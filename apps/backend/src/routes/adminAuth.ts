import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ADMIN_COOKIE, clearSessionCookie, sessionExpiry, setSessionCookie, verifyPassword } from '../lib/auth.ts'
import { prisma } from '../lib/prisma.ts'
import { requireAdmin } from '../lib/requireAuth.ts'

const credentials = z.object({ email: z.string().email(), password: z.string().min(8) })

// No public sign-up: admin accounts are created directly in the database
// (or a future seed/CLI step) by whoever already has one, Sean, Connor and
// Harvey are the only people who should ever reach this.
export async function adminAuthRoutes(app: FastifyInstance) {
  app.post('/api/admin/auth/log-in', async (req, reply) => {
    const parsed = credentials.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })

    const admin = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } })
    const ok = admin && (await verifyPassword(admin.passwordHash, parsed.data.password))
    if (!ok || !admin) return reply.code(401).send({ error: 'Incorrect email or password.' })

    const session = await prisma.adminSession.create({ data: { adminId: admin.id, expiresAt: sessionExpiry() } })
    setSessionCookie(reply, ADMIN_COOKIE, session.id)
    return { id: admin.id, email: admin.email }
  })

  app.post('/api/admin/auth/log-out', async (req, reply) => {
    const sessionId = req.cookies[ADMIN_COOKIE]
    if (sessionId) await prisma.adminSession.deleteMany({ where: { id: sessionId } })
    clearSessionCookie(reply, ADMIN_COOKIE)
    return { ok: true }
  })

  app.get('/api/admin/auth/me', async (req, reply) => {
    const adminId = await requireAdmin(req, reply)
    if (!adminId) return
    const admin = await prisma.adminUser.findUnique({ where: { id: adminId } })
    if (!admin) return reply.code(401).send({ error: 'Not signed in.' })
    return { id: admin.id, email: admin.email }
  })
}
