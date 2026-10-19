/**
 * Seeds the database with Kineris's 6-product launch range and its bundles
 * from packages/shared/src/catalogue.ts (this and only this). Safe to re-run: products are upserted by slug, and anything in
 * the database that isn't in that range is pruned first, along with its
 * dependent test orders, so a stray product from an earlier placeholder
 * pass never lingers.
 */
import { randomUUID } from 'node:crypto'
import { copyFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { BUNDLES, FULL_CATALOGUE } from '@kineris/shared'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth.ts'

const prisma = new PrismaClient()

const SAMPLE_COA_SOURCE = path.resolve(import.meta.dirname, 'fixtures/sample-coa.pdf')
const UPLOAD_DIR = path.resolve(import.meta.dirname, '../uploads/coa')

async function main() {
  const liveSlugs = FULL_CATALOGUE.map((entry) => entry.slug)

  // Orders/back-in-stock requests referencing a pruned product or a stale
  // variant size would block the deletes below (no cascade from OrderItem
  // or the plain-string BackInStockRequest.variantId) -- this is always
  // dev/seed data, never real customer orders, so it's safe to clear
  // unconditionally on every reseed rather than track exactly which rows
  // would conflict.
  await prisma.order.deleteMany({})
  await prisma.welcomeSubscriber.deleteMany({})
  await prisma.discountCode.deleteMany({ where: { autoIssued: true } })
  await prisma.backInStockRequest.deleteMany({})

  const stale = await prisma.product.findMany({ where: { slug: { notIn: liveSlugs } }, select: { id: true, slug: true } })
  if (stale.length > 0) {
    console.log(`Pruning ${stale.length} product(s) no longer in the launch range: ${stale.map((p) => p.slug).join(', ')}`)
    await prisma.product.deleteMany({ where: { id: { in: stale.map((p) => p.id) } } })
  }

  console.log(`Seeding ${FULL_CATALOGUE.length} products (Kineris's real launch range)...`)

  for (const [index, entry] of FULL_CATALOGUE.entries()) {
    const specs = {
      name: entry.name,
      description: entry.description,
      synonyms: entry.synonyms,
      category: entry.category,
      casNumber: entry.specs.casNumber,
      molecularFormula: entry.specs.molecularFormula,
      molecularWeight: entry.specs.molecularWeight,
      form: entry.specs.form,
      storageConditions: entry.specs.storageConditions,
    }
    const product = await prisma.product.upsert({
      where: { slug: entry.slug },
      update: specs,
      create: { slug: entry.slug, ...specs, published: true, lowStockThreshold: 5 },
    })

    // A product kept across catalogue updates can still carry stale sizes
    // from an earlier pass (e.g. Epitalon used to list 50mg; the real range
    // only has 10mg) -- upsert alone never removes those, so they're pruned
    // explicitly first.
    const liveSizes = entry.variants.map((v) => v.size)
    await prisma.productVariant.deleteMany({ where: { productId: product.id, size: { notIn: liveSizes } } })

    for (const variant of entry.variants) {
      await prisma.productVariant.upsert({
        where: { productId_size: { productId: product.id, size: variant.size } },
        // Stock is reset to the launch quantities on every seed: like the
        // order wipe above, this script is for setting up a pre-launch
        // database, never for one that holds real stock.
        update: { priceMinorUnits: variant.priceMinorUnits, purity: entry.specs.purity, stock: variant.launchStock },
        create: {
          productId: product.id,
          size: variant.size,
          priceMinorUnits: variant.priceMinorUnits,
          purity: entry.specs.purity,
          stock: variant.launchStock,
        },
      })
    }

    const hasCurrentBatch = await prisma.batch.findFirst({ where: { productId: product.id, isCurrent: true } })
    if (!hasCurrentBatch) {
      // Only the very first product gets the watermarked sample CoA PDF
      // attached, purely so the fully-populated CoA card UI is visible in
      // local dev -- every other batch is honestly CoA-pending until the
      // independent third-party CoAs are uploaded in admin.
      let coaFileUrl: string | null = null
      if (index === 0) {
        await mkdir(UPLOAD_DIR, { recursive: true })
        const filename = `${randomUUID()}.pdf`
        await copyFile(SAMPLE_COA_SOURCE, path.join(UPLOAD_DIR, filename))
        coaFileUrl = `/uploads/coa/${filename}`
      }

      await prisma.batch.create({
        data: {
          productId: product.id,
          batchNumber: `KL-2026-${String(index + 1).padStart(3, '0')}`,
          // Purity and test date come from the real CoA when it's uploaded, never invented here.
          purity: null,
          reportedAt: null,
          coaFileUrl,
          isCurrent: true,
        },
      })
    }
  }

  // Bundles are recipes over the single vials above (pack 5); their fixed
  // prices live in BUNDLES and are applied at checkout, not stored here.
  const liveBundleSlugs = BUNDLES.map((b) => b.slug)
  await prisma.bundle.deleteMany({ where: { slug: { notIn: liveBundleSlugs } } })
  for (const def of BUNDLES) {
    const components = await Promise.all(
      def.components.map(async (c) => {
        const variant = await prisma.productVariant.findFirstOrThrow({
          where: { size: c.size, product: { slug: c.slug } },
        })
        return { variantId: variant.id, quantity: c.quantity }
      }),
    )
    await prisma.bundle.upsert({
      where: { slug: def.slug },
      update: { name: def.name, published: true, components: { deleteMany: {}, create: components } },
      create: { slug: def.slug, name: def.name, published: true, components: { create: components } },
    })
  }
  console.log(`Seeded ${BUNDLES.length} bundles.`)

  const adminEmail = 'admin@kineris.local'
  const existingAdmin = await prisma.adminUser.findUnique({ where: { email: adminEmail } })
  if (!existingAdmin) {
    await prisma.adminUser.create({
      data: { email: adminEmail, passwordHash: await hashPassword('change-me-now') },
    })
    console.log(`Admin user created: ${adminEmail} / change-me-now (change this immediately)`)
  }

  const discountCode = await prisma.discountCode.findUnique({ where: { code: 'WELCOME10' } })
  if (!discountCode) {
    // The general, publicly-readable code (unlike the per-subscriber
    // WELCOME10-XXXXX variants the welcome-modal flow issues, see
    // src/routes/welcome.ts) -- kept distinct and documented in
    // docs/PROJECT_NOTES.md.
    await prisma.discountCode.create({
      data: {
        code: 'WELCOME10',
        internalDescription: 'General first-order code, read off the homepage CTA.',
        percentOff: 10,
        active: true,
        status: 'active',
        validityType: 'ongoing',
        usageLimitType: 'unlimited',
        perCustomerLimit: 1,
        stacking: 'disallow',
        autoIssued: false,
      },
    })
  }

  console.log('Seed complete.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
