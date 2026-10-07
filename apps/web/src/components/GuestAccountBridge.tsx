'use client'

import { useState, type FormEvent } from 'react'
import { useCustomerAuth } from '@/contexts/CustomerAuthContext'
import { api, ApiError } from '@/lib/api'

/**
 * Section 4's "offer account creation after a guest order too" -- shown
 * inline (never a modal, so it doesn't interrupt the confirmation itself),
 * pre-filled with the checkout email, one password field. Reuses the
 * sign-up endpoint's optional claimOrderId so the just-placed order
 * attaches to the new account immediately.
 */
export function GuestAccountBridge({ orderId, email }: { orderId: string; email: string }) {
  const { refresh } = useCustomerAuth()
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await api('/api/auth/sign-up', { method: 'POST', body: JSON.stringify({ email, password, claimOrderId: orderId }) })
      await refresh()
      setDone(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong creating your account.')
      setSubmitting(false)
    }
  }

  if (done) {
    return <p className="mt-8 rounded-sm border border-border bg-surface-page p-4 text-sm text-ink">Account created -- you can track this order from your account.</p>
  }

  return (
    <form onSubmit={submit} className="mt-8 rounded-sm border border-border bg-surface-page p-4 text-left">
      <p className="text-sm font-medium text-ink">Create an account to track this order and reorder faster</p>
      <p className="mt-1 text-xs text-ink-hint">{email}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="password"
          required
          minLength={8}
          placeholder="Set a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="flex-1 rounded-sm border border-border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-sm bg-accent px-4 py-2 text-sm font-medium text-bone hover:bg-accent-hover disabled:opacity-50"
        >
          Create account
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  )
}
