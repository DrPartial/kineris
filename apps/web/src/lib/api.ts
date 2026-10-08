const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    /** The full parsed error body, so a caller can read extra fields without re-parsing the message string. */
    public body: unknown = null,
  ) {
    super(message)
  }
}

/**
 * Every call carries the session cookie (credentials: 'include') since auth
 * here is an HttpOnly cookie, never a bearer token read from JS, the same
 * reasoning Harvey's other project follows: the browser owns the session,
 * not application code.
 */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    // Only set JSON content-type when there's actually a body: Fastify's
    // default JSON parser rejects an empty body sent with this header
    // (FST_ERR_CTP_EMPTY_JSON_BODY), which broke every bodyless POST/PATCH
    // call (sign-out, mark delivered/refunded, end promotion) until caught.
    headers: { ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...init?.headers },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new ApiError(res.status, typeof body.error === 'string' ? body.error : res.statusText, body)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}
