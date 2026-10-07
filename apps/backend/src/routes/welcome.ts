import { randomBytes } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.ts'
import { requireAdmin } from '../lib/requireAuth.ts'

const signupSchema = z.object({
  email: z.string().email(),
  consentMarketing: z.boolean(),
})

function randomSuffix(): string {
  return randomBytes(4).toString('hex').toUpperCase().slice(0, 5)
}

/**
 * The arrival-modal WELCOME10 flow. A code visible in page source can't
 * actually be single-use, so this issues one unique DiscountCode per
 * subscriber (restrictedToEmail) rather than handing out the shared static
 * "WELCOME10" string -- see docs/PROJECT_NOTES.md for the reasoning.
 */
export async function welcomeRoutes(app: FastifyInstance) {
  app.post('/api/welcome-signup', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (req, reply) => {
    const parsed = signupSchema.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })
    const { email, consentMarketing } = parsed.data

    const existing = await prisma.welcomeSubscriber.findUnique({ where: { email } })
    if (existing) {
      // Already subscribed: treat as a success (don't leak whether an email
      // is known, and don't issue a second code), consistent with "suppress
      // forever once used."
      return reply.code(200).send({ ok: true })
    }

    let code = `WELCOME10-${randomSuffix()}`
    for (let attempt = 0; attempt < 5; attempt++) {
      const clash = await prisma.discountCode.findUnique({ where: { code } })
      if (!clash) break
      code = `WELCOME10-${randomSuffix()}`
    }

    const discountCode = await prisma.discountCode.create({
      data: {
        code,
        internalDescription: 'Welcome modal -- auto-issued',
        percentOff: 10,
        usageLimitType: 'single_use_per_customer',
        perCustomerLimit: 1,
        validityType: 'ongoing',
        status: 'active',
        autoIssued: true,
        stacking: 'disallow',
        restrictedToEmail: email,
      },
    })

    await prisma.welcomeSubscriber.create({
      data: {
        email,
        consentMarketing,
        consentTimestamp: new Date(),
        source: 'welcome_modal',
        issuedCodeId: discountCode.id,
      },
    })

    // Marketing-email send, deferred: section 4's Klaviyo-vs-Resend/Postmark
    // decision is still open (per the pack), same "flag rather than fake"
    // treatment as the existing dispatch-email hook in orders.ts.
    app.log.info({ email }, 'welcome code email would send here (Klaviyo vs Resend/Postmark: open decision)')

    // Never return the code itself -- it only has value if it stays gated
    // behind the subscriber's inbox.
    return reply.code(201).send({ ok: true })
  })

  app.get('/api/admin/subscribers', async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return
    return prisma.welcomeSubscriber.findMany({
      include: { issuedCode: { select: { code: true, status: true } } },
      orderBy: { createdAt: 'desc' },
    })
  })
}
