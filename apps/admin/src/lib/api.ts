const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    /** The full parsed error body, so a caller can read extra fields like compliance `issues` without re-parsing the message string. */
    public body: unknown = null,
  ) {
    super(message)
  }
}

async function parseErrorBody(res: Response): Promise<{ error: string; [key: string]: unknown }> {
  return res.json().catch(() => ({ error: res.statusText }))
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    const body = await parseErrorBody(res)
    throw new ApiError(res.status, typeof body.error === 'string' ? body.error : res.statusText, body)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

/** Multipart upload (batch + CoA PDF) bypasses the JSON Content-Type above, the browser sets its own boundary header. */
export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { method: 'POST', credentials: 'include', body: formData })
  if (!res.ok) {
    const body = await parseErrorBody(res)
    throw new ApiError(res.status, typeof body.error === 'string' ? body.error : res.statusText, body)
  }
  return res.json()
}
