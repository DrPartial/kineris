import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.ts'
import { requireAdmin } from '../lib/requireAuth.ts'

const discountWrite = z.object({
  code: z.string().min(1),
  percentOff: z.number().int().min(1).max(100).nullable().optional(),
  amountOffMinorUnits: z.number().int().positive().nullable().optional(),
  active: z.boolean().default(true),
})

export async function discountRoutes(app: FastifyInstance) {
  app.get('/api/admin/discount-codes', async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return
    return prisma.discountCode.findMany({ orderBy: { createdAt: 'desc' } })
  })

  app.post('/api/admin/discount-codes', async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return
    const parsed = discountWrite.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })
    if (!parsed.data.percentOff && !parsed.data.amountOffMinorUnits) {
      return reply.code(400).send({ error: 'Set either percentOff or amountOffMinorUnits.' })
    }
    const code = await prisma.discountCode.create({ data: parsed.data })
    return reply.code(201).send(code)
  })

  app.patch('/api/admin/discount-codes/:id', async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return
    const { id } = req.params as { id: string }
    const parsed = discountWrite.partial().safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })
    return prisma.discountCode.update({ where: { id }, data: parsed.data })
  })
}
