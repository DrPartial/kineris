import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { availableBundleCount } from '../lib/bundleStock.ts'
import { prisma } from '../lib/prisma.ts'
import { requireAdmin } from '../lib/requireAuth.ts'

async function withAvailability(bundles: Awaited<ReturnType<typeof loadBundles>>) {
  return bundles.map((b) => ({
    ...b,
    availableCount: availableBundleCount(
      b.components.map((c) => ({ variantId: c.variantId, quantity: c.quantity, variantStock: c.variant.stock })),
    ),
  }))
}

function loadBundles(published: boolean | undefined) {
  return prisma.bundle.findMany({
    where: published === undefined ? {} : { published },
    include: { components: { include: { variant: true } } },
    orderBy: { name: 'asc' },
  })
}

export async function bundleRoutes(app: FastifyInstance) {
  app.get('/api/bundles', async () => withAvailability(await loadBundles(true)))

  app.get('/api/bundles/:slug', async (req, reply) => {
    const { slug } = req.params as { slug: string }
    const bundle = await prisma.bundle.findUnique({
      where: { slug },
      include: { components: { include: { variant: true } } },
    })
    if (!bundle || !bundle.published) return reply.code(404).send({ error: 'Bundle not found.' })
    return (await withAvailability([bundle]))[0]
  })

  app.get('/api/admin/bundles', async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return
    return withAvailability(await loadBundles(undefined))
  })

  const bundleWrite = z.object({
    slug: z.string().min(1),
    name: z.string().min(1),
    published: z.boolean().default(false),
    components: z.array(z.object({ variantId: z.string(), quantity: z.number().int().positive() })).min(1),
  })

  app.post('/api/admin/bundles', async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return
    const parsed = bundleWrite.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })
    const { components, ...rest } = parsed.data
    const bundle = await prisma.bundle.create({
      data: { ...rest, components: { create: components } },
      include: { components: true },
    })
    return reply.code(201).send(bundle)
  })
}
