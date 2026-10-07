/**
 * Seeds local dev with the catalogue from packages/shared (real names, sizes and prices for the
 * 16 peptides; the lab supplies and all per-product technical data are still placeholders, see
 * catalogue.ts's own doc comment). Safe to re-run: products are upserted by slug, and existing
 * rows are never overwritten (`update: {}`), so a database seeded from an older catalogue keeps
 * its old rows, reset it to pick up catalogue changes.
 */
import { randomUUID } from 'node:crypto'
import { copyFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { FULL_CATALOGUE } from '@kineris/shared'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth.ts'

const prisma = new PrismaClient()

// Deterministic-looking but clearly fake placeholder technical data, cycled
// per product so the UI doesn't show the exact same numbers on every page.
const PLACEHOLDER_FORMULAS = ['C12H20N4O3S', 'C9H14N2O4', 'C21H32N6O4S', 'C14H22N4O6']
const PLACEHOLDER_WEIGHTS = ['312.4 g/mol', '214.2 g/mol', '480.6 g/mol', '358.1 g/mol']
const PLACEHOLDER_PURITIES = ['98.4%', '99.1%', '97.9%', '98.8%']

const SAMPLE_COA_SOURCE = path.resolve(import.meta.dirname, 'fixtures/sample-coa.pdf')
const UPLOAD_DIR = path.resolve(import.meta.dirname, '../uploads/coa')

async function main() {
  console.log(`Seeding ${FULL_CATALOGUE.length} products...`)

  for (const [index, entry] of FULL_CATALOGUE.entries()) {
    const category = entry.category === 'lab-supply' ? 'lab_supply' : 'peptide'
    const product = await prisma.product.upsert({
      where: { slug: entry.slug },
      update: {},
      create: {
        slug: entry.slug,
        name: entry.name,
        synonyms: entry.synonyms ?? [],
        category,
        casNumber: category === 'peptide' ? `000000-${String(10 + index).padStart(2, '0')}-0` : null,
        molecularFormula: category === 'peptide' ? PLACEHOLDER_FORMULAS[index % PLACEHOLDER_FORMULAS.length] : null,
        molecularWeight: category === 'peptide' ? PLACEHOLDER_WEIGHTS[index % PLACEHOLDER_WEIGHTS.length] : null,
        form: category === 'peptide' ? 'Lyophilised powder' : 'Liquid',
        storageConditions: category === 'peptide' ? 'Store at -20°C, protect from light' : 'Store at room temperature',
        published: true,
        lowStockThreshold: 5,
      },
    })

    for (const [sizeIndex, size] of entry.sizes.entries()) {
      // Real price when the catalogue has one, placeholder pricing otherwise (lab supplies).
      const priceMinorUnits = entry.pricesMinorUnits?.[sizeIndex] ?? 3500 + index * 150 + sizeIndex * 1200
      await prisma.productVariant.upsert({
        where: { productId_size: { productId: product.id, size } },
        update: {},
        create: {
          productId: product.id,
          size,
          priceMinorUnits,
          purity: category === 'peptide' ? '≥98% (HPLC)' : null,
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
          purity: category === 'peptide' ? PLACEHOLDER_PURITIES[index % PLACEHOLDER_PURITIES.length] : null,
          reportedAt: new Date(Date.now() - (index + 1) * 3 * 24 * 60 * 60 * 1000),
          coaFileUrl,
          isCurrent: true,
        },
      })
    }
  }

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
