/**
 * Seeds local dev with Kineris's real 16-product launch range from
 * packages/shared/src/catalogue.ts (this and only this, confirmed by
 * Harvey). Safe to re-run: products are upserted by slug, and anything in
 * the database that isn't in that range is pruned first, along with its
 * dependent test orders, so a stray product from an earlier placeholder
 * pass never lingers.
 */
import { randomUUID } from 'node:crypto'
import { copyFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { FULL_CATALOGUE } from '@kineris/shared'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth.ts'

const prisma = new PrismaClient()

const SAMPLE_COA_SOURCE = path.resolve(import.meta.dirname, 'fixtures/sample-coa.pdf')
const UPLOAD_DIR = path.resolve(import.meta.dirname, '../uploads/coa')

// Hosted databases are different from local dev: nobody should wipe them or fill them with demo
// figures by accident. Against anything that is not localhost the seed refuses to run without
// SEED_CONFIRM_REMOTE=yes, never deletes orders unless SEED_RESET_ORDERS=yes, never invents
// purity, test dates or a sample CoA (those would be fake claims in a real database), and only
// creates an admin from ADMIN_EMAIL + ADMIN_PASSWORD (there is no default password).
const IS_LOCAL_DB = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL ?? '')

async function main() {
  if (!IS_LOCAL_DB && process.env.SEED_CONFIRM_REMOTE !== 'yes') {
    throw new Error('DATABASE_URL is not local. Set SEED_CONFIRM_REMOTE=yes to seed a hosted database.')
  }
  const resetOrders = IS_LOCAL_DB || process.env.SEED_RESET_ORDERS === 'yes'
  const liveSlugs = FULL_CATALOGUE.map((entry) => entry.slug)

  // Orders/back-in-stock requests referencing a pruned product or a stale
  // variant size would block the deletes below (no cascade from OrderItem
  // or the plain-string BackInStockRequest.variantId) -- this is always
  // dev/seed data, never real customer orders, so it's safe to clear
  // unconditionally on every reseed rather than track exactly which rows
  // would conflict.
  if (resetOrders) {
    await prisma.order.deleteMany({})
    await prisma.welcomeSubscriber.deleteMany({})
    await prisma.discountCode.deleteMany({ where: { autoIssued: true } })
    await prisma.backInStockRequest.deleteMany({})
  }

  const stale = await prisma.product.findMany({ where: { slug: { notIn: liveSlugs } }, select: { id: true, slug: true } })
  if (stale.length > 0) {
    console.log(`Pruning ${stale.length} product(s) no longer in the launch range: ${stale.map((p) => p.slug).join(', ')}`)
    await prisma.product.deleteMany({ where: { id: { in: stale.map((p) => p.id) } } })
  }

  console.log(`Seeding ${FULL_CATALOGUE.length} products (Kineris's real launch range)...`)

  for (const [index, entry] of FULL_CATALOGUE.entries()) {
    const product = await prisma.product.upsert({
      where: { slug: entry.slug },
      update: {
        name: entry.name,
        description: entry.description,
        synonyms: entry.synonyms,
        // Explicitly nulled, not just omitted: a product carried over from
        // an earlier placeholder seed could still have a fake CAS/formula/
        // weight sitting in the database, and upsert's update clause only
        // touches fields it's given, so leaving these out here would let a
        // stale fake value survive silently.
        casNumber: null,
        molecularFormula: null,
        molecularWeight: null,
      },
      create: {
        slug: entry.slug,
        name: entry.name,
        description: entry.description,
        synonyms: entry.synonyms,
        category: 'peptide',
        // CAS number / molecular formula / molecular weight deliberately
        // left unset -- see catalogue.ts's own doc comment on why these
        // need real supplier/CoA data, not a guess.
        form: 'Lyophilised powder',
        storageConditions: 'Store at -20°C, protect from light',
        published: true,
        lowStockThreshold: 5,
      },
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
        update: { priceMinorUnits: variant.priceMinorUnits },
        create: {
          productId: product.id,
          size: variant.size,
          priceMinorUnits: variant.priceMinorUnits,
          purity: IS_LOCAL_DB ? '≥98% (HPLC)' : null,
          stock: 25,
        },
      })
    }

    const hasCurrentBatch = await prisma.batch.findFirst({ where: { productId: product.id, isCurrent: true } })
    if (!hasCurrentBatch) {
      // Only the very first product gets the watermarked sample CoA PDF
      // attached, purely so the fully-populated CoA card UI is visible in
      // local dev -- every other batch is honestly CoA-pending, matching
      // where a real launch actually starts (pack 2.5 is OPEN on the testing
      // lab; see docs/PROJECT_NOTES.md).
      let coaFileUrl: string | null = null
      if (index === 0 && IS_LOCAL_DB) {
        await mkdir(UPLOAD_DIR, { recursive: true })
        const filename = `${randomUUID()}.pdf`
        await copyFile(SAMPLE_COA_SOURCE, path.join(UPLOAD_DIR, filename))
        coaFileUrl = `/uploads/coa/${filename}`
      }

      await prisma.batch.create({
        data: {
          productId: product.id,
          batchNumber: `KL-2026-${String(index + 1).padStart(3, '0')}`,
          purity: IS_LOCAL_DB ? '98.4%' : null,
          reportedAt: IS_LOCAL_DB ? new Date(Date.now() - (index + 1) * 3 * 24 * 60 * 60 * 1000) : null,
          coaFileUrl,
          isCurrent: true,
        },
      })
    }
  }

  // Local dev keeps the documented default login. A hosted database only gets an admin when one is
  // supplied explicitly, so there is never a well-known password on a public API.
  const adminEmail = IS_LOCAL_DB ? 'admin@kineris.local' : process.env.ADMIN_EMAIL
  const adminPassword = IS_LOCAL_DB ? 'change-me-now' : process.env.ADMIN_PASSWORD
  if (adminEmail && adminPassword) {
    const existingAdmin = await prisma.adminUser.findUnique({ where: { email: adminEmail } })
    if (!existingAdmin) {
      await prisma.adminUser.create({
        data: { email: adminEmail, passwordHash: await hashPassword(adminPassword) },
      })
      console.log(`Admin user created: ${adminEmail}${IS_LOCAL_DB ? ' / change-me-now (change this immediately)' : ''}`)
    }
  } else {
    console.log('No admin user created (set ADMIN_EMAIL and ADMIN_PASSWORD to create one).')
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
