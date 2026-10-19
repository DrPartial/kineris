/**
 * Pre-launch password gate. Only active when SITE_PASSWORD is set, so local dev and production
 * after launch are unaffected. The cookie holds a SHA-256 of the password (never the password
 * itself); Web Crypto is used so the same code runs in the Edge middleware and the route handler.
 */
export const GATE_COOKIE = 'kl_gate'

export async function gateToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`kineris-gate:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}
