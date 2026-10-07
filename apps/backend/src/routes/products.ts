import { checkCompliance } from '@kineris/shared'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.ts'
import { requireAdmin } from '../lib/requireAuth.ts'

const productWrite = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  synonyms: z.array(z.string()).default([]),
  category: z.enum(['peptide', 'lab_supply']),
  casNumber: z.string().nullable().optional(),
  molecularFormula: z.string().nullable().optional(),
  molecularWeight: z.string().nullable().optional(),
  form: z.string().nullable().optional(),
  storageConditions: z.string().nullable().optional(),
  published: z.boolean().default(false),
  lowStockThreshold: z.number().int().positive().default(5),
})

/**
 * Every free-text field a product carries is checked against the compliance
 * blocklist before saving (pack 2.3), name and synonyms included, since
 * those are exactly the fields someone drafting copy would type into first.
 * Takes a partial shape deliberately: a PATCH only checks the fields it's
 * actually changing, not the whole record re-assembled from scratch.
 */
function complianceIssues(input: Partial<z.infer<typeof productWrite>>): Record<string, string[]> {
  const issues: Record<string, string[]> = {}
  const fields: [string, string | null | undefined][] = [
    ['name', input.name],
    ['synonyms', input.synonyms?.join(' ')],
    ['form', input.form],
    ['storageConditions', input.storageConditions],
  ]
  for (const [field, text] of fields) {
    if (!text) continue
    const found = checkCompliance(text)
    if (found.length > 0) issues[field] = found
  }
  return issues
}

export async function productRoutes(app: FastifyInstance) {
  // Public: published products only, with variants and the current batch.
  app.get('/api/products', async () => {
    const products = await prisma.product.findMany({
      where: { published: true },
      include: { variants: true, batches: { where: { isCurrent: true }, take: 1 } },
      orderBy: { name: 'asc' },
    })
    return products.map((p) => ({ ...p, currentBatch: p.batches[0] ?? null, batches: undefined }))
  })

  app.get('/api/products/:slug', async (req, reply) => {
    const { slug } = req.params as { slug: string }
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { variants: true, batches: { where: { isCurrent: true }, take: 1 } },
    })
    if (!product || !product.published) return reply.code(404).send({ error: 'Product not found.' })
    return { ...product, currentBatch: product.batches[0] ?? null, batches: undefined }
  })

  // Admin: full list including unpublished, create, update.
  app.get('/api/admin/products', async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return
    return prisma.product.findMany({ include: { variants: true, batches: true }, orderBy: { name: 'asc' } })
  })

  app.post('/api/admin/products', async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return
    const parsed = productWrite.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })

    const issues = complianceIssues(parsed.data)
    if (Object.keys(issues).length > 0) {
      return reply.code(422).send({ error: 'Compliance check failed.', issues })
    }

    const product = await prisma.product.create({ data: parsed.data })
    return reply.code(201).send(product)
  })

  app.patch('/api/admin/products/:id', async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return
    const { id } = req.params as { id: string }
    const parsed = productWrite.partial().safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })

    const issues = complianceIssues(parsed.data)
    if (Object.keys(issues).length > 0) {
      return reply.code(422).send({ error: 'Compliance check failed.', issues })
    }

    const product = await prisma.product.update({ where: { id }, data: parsed.data })
    return product
  })

  // Variants
  const variantWrite = z.object({
    size: z.string().min(1),
    priceMinorUnits: z.number().int().nonnegative(),
    purity: z.string().nullable().optional(),
    stock: z.number().int().nonnegative().default(0),
  })

  app.post('/api/admin/products/:id/variants', async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return
    const { id } = req.params as { id: string }
    const parsed = variantWrite.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })
    const variant = await prisma.productVariant.create({ data: { ...parsed.data, productId: id } })
    return reply.code(201).send(variant)
  })

  app.patch('/api/admin/variants/:id', async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return
    const { id } = req.params as { id: string }
    const parsed = variantWrite.partial().safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })
    return prisma.productVariant.update({ where: { id }, data: parsed.data })
  })
}
