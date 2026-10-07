'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { api, ApiError } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await api('/api/admin/auth/log-in', { method: 'POST', body: JSON.stringify({ email, password }) })
      router.push('/')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong signing in.')
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/kineris-logo-light.svg" alt="Kineris" className="h-11 w-auto" />
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-sm border border-border px-3 py-2 text-sm"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-sm border border-border px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-bone hover:bg-accent-hover disabled:opacity-50"
        >
          Sign in
        </button>
      </form>
      <p className="mt-4 text-xs text-ink-hint">
        Seeded admin login: admin@kineris.local / change-me-now (change this immediately).
      </p>
    </div>
  )
}
