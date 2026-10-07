import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { DISCOUNT_FAILURE_MESSAGES, validateDiscountCode } from '../lib/discountValidation.ts'
import { prisma } from '../lib/prisma.ts'
import { requireAdmin } from '../lib/requireAuth.ts'

const discountWrite = z.object({
  code: z.string().min(1),
  internalDescription: z.string().nullable().optional(),
  percentOff: z.number().int().min(1).max(100).nullable().optional(),
  amountOffMinorUnits: z.number().int().positive().nullable().optional(),
  minimumOrderValueMinorUnits: z.number().int().positive().nullable().optional(),
  usageLimitType: z.enum(['unlimited', 'single_use_per_customer', 'total_redemption_cap']).default('unlimited'),
  totalRedemptionCap: z.number().int().positive().nullable().optional(),
  perCustomerLimit: z.number().int().min(1).default(1),
  validityType: z.enum(['ongoing', 'fixed_duration', 'date_range']).default('ongoing'),
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  status: z.enum(['scheduled', 'active', 'paused', 'ended']).default('active'),
  stacking: z.enum(['allow', 'disallow']).default('disallow'),
  active: z.boolean().default(true),
})

export async function discountRoutes(app: FastifyInstance) {
  app.get('/api/admin/discount-codes', async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return
    const codes = await prisma.discountCode.findMany({
      include: { _count: { select: { redemptions: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return codes.map((c) => ({ ...c, redemptionCount: c._count.redemptions, _count: undefined }))
  })

  app.post('/api/admin/discount-codes', async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return
    const parsed = discountWrite.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })
    if (!parsed.data.percentOff && !parsed.data.amountOffMinorUnits) {
      return reply.code(400).send({ error: 'Set either percentOff or amountOffMinorUnits.' })
    }
    const { startsAt, endsAt, ...rest } = parsed.data
    const code = await prisma.discountCode.create({
      data: { ...rest, startsAt: startsAt ? new Date(startsAt) : null, endsAt: endsAt ? new Date(endsAt) : null },
    })
    return reply.code(201).send(code)
  })

  app.patch('/api/admin/discount-codes/:id', async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return
    const { id } = req.params as { id: string }
    const parsed = discountWrite.partial().safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })
    const { startsAt, endsAt, ...rest } = parsed.data
    return prisma.discountCode.update({
      where: { id },
      data: {
        ...rest,
        ...(startsAt !== undefined ? { startsAt: startsAt ? new Date(startsAt) : null } : {}),
        ...(endsAt !== undefined ? { endsAt: endsAt ? new Date(endsAt) : null } : {}),
      },
    })
  })

  // Immediately ends an active promotion regardless of its configured end
  // date -- the "End now" admin action.
  app.post('/api/admin/discount-codes/:id/end', async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return
    const { id } = req.params as { id: string }
    return prisma.discountCode.update({ where: { id }, data: { status: 'ended', endsAt: new Date() } })
  })

  const validateSchema = z.object({
    code: z.string().min(1),
    subtotalMinorUnits: z.number().int().nonnegative(),
    customerEmail: z.string().email(),
  })

  // Public: lets checkout validate-as-you-type with a specific reason per
  // failure, instead of a generic "invalid code" or (the old behaviour)
  // silently applying zero discount for a bad code.
  app.post('/api/discount-codes/validate', { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, async (req, reply) => {
    const parsed = validateSchema.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })
    const result = await validateDiscountCode(parsed.data.code.toUpperCase(), parsed.data.subtotalMinorUnits, parsed.data.customerEmail)
    if (!result.valid) return reply.code(422).send({ valid: false, reason: result.reason, message: DISCOUNT_FAILURE_MESSAGES[result.reason] })
    return result
  })
}
