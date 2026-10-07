import argon2 from 'argon2'
import type { FastifyReply } from 'fastify'

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export function hashPassword(password: string): Promise<string> {
  return argon2.hash(password)
}

export function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password)
}

export function sessionExpiry(): Date {
  return new Date(Date.now() + SESSION_TTL_MS)
}

/**
 * Customer and admin sessions use differently-named cookies so a browser
 * signed into both the storefront and the admin app (plausible for
 * Sean/Connor, who are both) never has one overwrite the other.
 */
export const CUSTOMER_COOKIE = 'kineris_session'
export const ADMIN_COOKIE = 'kineris_admin_session'

export function setSessionCookie(reply: FastifyReply, name: string, sessionId: string): void {
  reply.setCookie(name, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: sessionExpiry(),
  })
}

export function clearSessionCookie(reply: FastifyReply, name: string): void {
  reply.clearCookie(name, { path: '/' })
}
