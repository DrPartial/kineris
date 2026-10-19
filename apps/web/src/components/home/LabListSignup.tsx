'use client'

import { type FormEvent, useState } from 'react'
import { api, ApiError } from '@/lib/api'

/**
 * Inline "Join the lab list" form. Uses the same welcome-signup endpoint as the
 * welcome modal (stores the subscriber and emails a single-use 10% code), so the
 * list lives in our database until a CRM takes over.
 */
export function LabListSignup() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      // Joining a list described as batch release and restock emails is the marketing consent.
      await api('/api/welcome-signup', { method: 'POST', body: JSON.stringify({ email, consentMarketing: true }) })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong, try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-border p-6">
        <p className="font-display text-lg font-semibold text-ink">You&rsquo;re on the list</p>
        <p className="mt-1 text-sm text-ink-muted">
          If {email} isn&rsquo;t already subscribed, your single-use 10% code is on its way.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit}>
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-white/5 p-2 sm:flex-row sm:rounded-full">
        <label htmlFor="lab-list-email" className="sr-only">
          Email address
        </label>
        <input
          id="lab-list-email"
          type="email"
          required
          placeholder="you@lab.ac.uk"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-ink placeholder:text-ink-hint focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-ember px-6 py-3 text-sm font-semibold text-pine-ink hover:opacity-90 disabled:opacity-50"
        >
          Subscribe &rarr;
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-ember">{error}</p>}
      <p className="mt-3 text-xs text-ink-hint">
        No spam. Unsubscribe anytime. For laboratory research use only. See our{' '}
        <a href="/legal/privacy" className="text-ink-hint underline">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  )
}
