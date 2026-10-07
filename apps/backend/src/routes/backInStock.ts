import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.ts'

const captureSchema = z.object({ variantId: z.string(), email: z.string().email() })

export async function backInStockRoutes(app: FastifyInstance) {
  app.post('/api/back-in-stock', async (req, reply) => {
    const parsed = captureSchema.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })

    const variant = await prisma.productVariant.findUnique({ where: { id: parsed.data.variantId } })
    if (!variant) return reply.code(404).send({ error: 'Unknown product variant.' })

    // Idempotent: re-submitting the same email for the same variant is a
    // no-op, not a duplicate-row error: the unique constraint on
    // [variantId, email] means a second POST should look like success, not
    // fail, from the storefront's point of view.
    await prisma.backInStockRequest.upsert({
      where: { variantId_email: { variantId: parsed.data.variantId, email: parsed.data.email } },
      create: { variantId: parsed.data.variantId, email: parsed.data.email },
      update: {},
    })

    return reply.code(201).send({ ok: true })
  })
}
