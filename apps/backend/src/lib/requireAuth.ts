import type { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from './prisma.ts'
import { ADMIN_COOKIE, CUSTOMER_COOKIE } from './auth.ts'

/**
 * Loads the session row and checks expiry itself rather than trusting the
 * cookie's own presence, since an expired-but-still-sent cookie must fail closed,
 * not fall through as "no session" (which some callers might treat as a
 * softer case than "invalid session").
 */
export async function requireCustomer(req: FastifyRequest, reply: FastifyReply): Promise<string | null> {
  const sessionId = req.cookies[CUSTOMER_COOKIE]
  if (!sessionId) {
    reply.code(401).send({ error: 'Not signed in.' })
    return null
  }
  const session = await prisma.customerSession.findUnique({ where: { id: sessionId } })
  if (!session || session.expiresAt < new Date()) {
    reply.code(401).send({ error: 'Session expired.' })
    return null
  }
  return session.customerId
}

export async function requireAdmin(req: FastifyRequest, reply: FastifyReply): Promise<string | null> {
  const sessionId = req.cookies[ADMIN_COOKIE]
  if (!sessionId) {
    reply.code(401).send({ error: 'Not signed in.' })
    return null
  }
  const session = await prisma.adminSession.findUnique({ where: { id: sessionId } })
  if (!session || session.expiresAt < new Date()) {
    reply.code(401).send({ error: 'Session expired.' })
    return null
  }
  return session.adminId
}
