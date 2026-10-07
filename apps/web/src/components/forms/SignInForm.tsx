'use client'

import { useState, type FormEvent } from 'react'
import { OAuthButtons } from './OAuthButtons'
import { useCustomerAuth } from '@/contexts/CustomerAuthContext'
import { api, ApiError } from '@/lib/api'

export function SignInForm({ onSuccess }: { onSuccess: () => void }) {
  const { refresh } = useCustomerAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await api('/api/auth/log-in', { method: 'POST', body: JSON.stringify({ email, password }) })
      await refresh()
      onSuccess()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong signing in.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <input
        type="email"
        required
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-sm border border-border px-3 py-2 text-sm"
      />
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-sm border border-border px-3 py-2 pr-16 text-sm"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-hint hover:text-ink"
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>
      <p className="text-xs text-ink-hint">
        Forgot password?{' '}
        <a href="mailto:support@kinerislabs.com" className="text-accent hover:text-accent-hover">
          Contact support
        </a>
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-bone hover:bg-accent-hover disabled:opacity-50"
      >
        Sign in
      </button>
      <div className="flex items-center gap-3 text-xs text-ink-hint">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <OAuthButtons />
    </form>
  )
}
