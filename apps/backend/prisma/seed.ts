/**
 * Seeds local dev with the placeholder catalogue from packages/shared
 * (NOT Kineris's real products, see catalogue.ts's own doc comment) so
 * every page has something real-looking to render. Safe to re-run: products
 * are upserted by slug.
 */
import { FULL_CATALOGUE } from '@kineris/shared'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth.ts'

const prisma = new PrismaClient()

// Deterministic-looking but clearly fake placeholder technical data, cycled
// per product so the UI doesn't show the exact same numbers on every page.
const PLACEHOLDER_FORMULAS = ['C12H20N4O3S', 'C9H14N2O4', 'C21H32N6O4S', 'C14H22N4O6']
const PLACEHOLDER_WEIGHTS = ['312.4 g/mol', '214.2 g/mol', '480.6 g/mol', '358.1 g/mol']

async function main() {
  console.log(`Seeding ${FULL_CATALOGUE.length} placeholder products...`)

  for (const [index, entry] of FULL_CATALOGUE.entries()) {
    const category = entry.category === 'lab-supply' ? 'lab_supply' : 'peptide'
    const product = await prisma.product.upsert({
      where: { slug: entry.slug },
      update: {},
      create: {
        slug: entry.slug,
        name: entry.name,
        synonyms: [],
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
      const priceMinorUnits = 3500 + index * 150 + sizeIndex * 1200 // placeholder pricing only
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
      await prisma.batch.create({
        data: {
          productId: product.id,
          batchNumber: `KL-2026-${String(index + 1).padStart(3, '0')}`,
          coaFileUrl: null, // real CoA PDFs come later, pack 2.5 is OPEN on the testing lab
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
    await prisma.discountCode.create({ data: { code: 'WELCOME10', percentOff: 10, active: true } })
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
