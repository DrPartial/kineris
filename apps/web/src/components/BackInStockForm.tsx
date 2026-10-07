'use client'

import { useState, type FormEvent } from 'react'
import { api } from '@/lib/api'

export function BackInStockForm({ variantId }: { variantId: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  async function submit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      await api('/api/back-in-stock', { method: 'POST', body: JSON.stringify({ variantId, email }) })
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return <p className="text-sm text-ink-muted">We&rsquo;ll email you when this size is back in stock.</p>
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-sm border border-border px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={status === 'sending'}
        className="rounded-sm border border-ink px-4 py-2 text-sm font-medium text-ink hover:bg-surface-sunken disabled:opacity-50"
      >
        Notify me when back in stock
      </button>
      {status === 'error' && <p className="text-sm text-red-600">Something went wrong, please try again.</p>}
    </form>
  )
}
