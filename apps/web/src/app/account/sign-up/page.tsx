'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { api, ApiError } from '@/lib/api'

export default function SignUpPage() {
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
      await api('/api/auth/sign-up', { method: 'POST', body: JSON.stringify({ email, password }) })
      // sign_up: the shared analytics event name (pack section 4) fires from
      // here once a provider SDK is wired up; deferred per the project plan.
      router.push('/account')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong creating your account.')
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Create an account</h1>
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
          minLength={8}
          placeholder="Password (min. 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-sm border border-border px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          Create account
        </button>
      </form>
      <p className="mt-4 text-sm text-ink-muted">
        Already have an account?{' '}
        <a href="/account/sign-in" className="text-accent hover:text-accent-hover">
          Sign in
        </a>
      </p>
    </div>
  )
}
