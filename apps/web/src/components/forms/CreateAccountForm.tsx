'use client'

import { useState, type FormEvent } from 'react'
import { OAuthButtons } from './OAuthButtons'
import { useCustomerAuth } from '@/contexts/CustomerAuthContext'
import { api, ApiError } from '@/lib/api'

function passwordStrength(password: string): { score: 0 | 1 | 2 | 3; label: string } {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password)) score++
  if (password.length >= 12 && /[^A-Za-z0-9]/.test(password)) score++
  const labels = ['Weak', 'Weak', 'Good', 'Strong'] as const
  return { score: Math.min(score, 3) as 0 | 1 | 2 | 3, label: labels[Math.min(score, 3)] }
}

export function CreateAccountForm({ onSuccess }: { onSuccess: () => void }) {
  const { refresh } = useCustomerAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const strength = passwordStrength(password)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await api('/api/auth/sign-up', { method: 'POST', body: JSON.stringify({ email, password }) })
      // sign_up: the shared analytics event name (pack section 4) fires from
      // here once a provider SDK is wired up; deferred per the project plan.
      await refresh()
      onSuccess()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong creating your account.')
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
      <div>
        <input
          type="password"
          required
          minLength={8}
          placeholder="Password (min. 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-sm border border-border px-3 py-2 text-sm"
        />
        {password.length > 0 && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex h-1 flex-1 gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`h-full flex-1 rounded-full ${i <= strength.score ? 'bg-accent' : 'bg-border'}`}
                />
              ))}
            </div>
            <span className="text-xs text-ink-hint">{strength.label}</span>
          </div>
        )}
      </div>

      {/* Deliberately its own section, visually and legally separate from
          the RUO/Terms checkboxes used at checkout -- this is an optional
          marketing opt-in, not a compliance declaration. */}
      <label className="flex items-start gap-2 rounded-sm border border-border bg-surface-page p-3 text-sm text-ink-muted">
        <input
          type="checkbox"
          checked={marketingConsent}
          onChange={(e) => setMarketingConsent(e.target.checked)}
          className="mt-0.5"
        />
        Email me about new batches, restocks and offers.
      </label>

      <p className="text-xs text-ink-hint">
        By creating an account you agree to our{' '}
        <a href="/legal/terms" className="text-accent hover:text-accent-hover">
          Terms
        </a>{' '}
        and{' '}
        <a href="/legal/privacy" className="text-accent hover:text-accent-hover">
          Privacy Policy
        </a>
        .
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-bone hover:bg-accent-hover disabled:opacity-50"
      >
        Create account
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
