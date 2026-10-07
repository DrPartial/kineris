import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { CUSTOMER_COOKIE, clearSessionCookie, hashPassword, sessionExpiry, setSessionCookie, verifyPassword } from '../lib/auth.ts'
import { prisma } from '../lib/prisma.ts'
import { requireCustomer } from '../lib/requireAuth.ts'

const credentials = z.object({ email: z.string().email(), password: z.string().min(8) })

/**
 * Email/password only for this pass (project plan): Google and Apple
 * sign-in are pack section 8 requirements, deferred as a flagged follow-up
 * rather than stubbed-and-pretended-to-work.
 */
export async function authRoutes(app: FastifyInstance) {
  app.post('/api/auth/sign-up', async (req, reply) => {
    const parsed = credentials.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })

    const existing = await prisma.customer.findUnique({ where: { email: parsed.data.email } })
    if (existing) return reply.code(409).send({ error: 'An account with that email already exists.' })

    const passwordHash = await hashPassword(parsed.data.password)
    const customer = await prisma.customer.create({ data: { email: parsed.data.email, passwordHash } })
    const session = await prisma.customerSession.create({
      data: { customerId: customer.id, expiresAt: sessionExpiry() },
    })
    setSessionCookie(reply, CUSTOMER_COOKIE, session.id)
    return reply.code(201).send({ id: customer.id, email: customer.email })
  })

  app.post('/api/auth/log-in', async (req, reply) => {
    const parsed = credentials.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })

    const customer = await prisma.customer.findUnique({ where: { email: parsed.data.email } })
    const ok = customer && (await verifyPassword(customer.passwordHash, parsed.data.password))
    if (!ok || !customer) return reply.code(401).send({ error: 'Incorrect email or password.' })

    const session = await prisma.customerSession.create({
      data: { customerId: customer.id, expiresAt: sessionExpiry() },
    })
    setSessionCookie(reply, CUSTOMER_COOKIE, session.id)
    return { id: customer.id, email: customer.email }
  })

  app.post('/api/auth/log-out', async (req, reply) => {
    const sessionId = req.cookies[CUSTOMER_COOKIE]
    if (sessionId) await prisma.customerSession.deleteMany({ where: { id: sessionId } })
    clearSessionCookie(reply, CUSTOMER_COOKIE)
    return { ok: true }
  })

  app.get('/api/auth/me', async (req, reply) => {
    const customerId = await requireCustomer(req, reply)
    if (!customerId) return
    const customer = await prisma.customer.findUnique({ where: { id: customerId } })
    if (!customer) return reply.code(401).send({ error: 'Not signed in.' })
    return { id: customer.id, email: customer.email }
  })

  app.get('/api/account/orders', async (req, reply) => {
    const customerId = await requireCustomer(req, reply)
    if (!customerId) return
    return prisma.order.findMany({
      where: { customerId },
      include: { items: { include: { variant: { include: { product: true } } } } },
      orderBy: { createdAt: 'desc' },
    })
  })
}
