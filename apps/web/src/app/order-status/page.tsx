'use client'

import { useState, type FormEvent } from 'react'
import { COACard } from '@/components/COACard'
import { api, ApiError } from '@/lib/api'
import { formatGBP } from '@/lib/money'

interface OrderStatusResult {
  id: string
  status: string
  totalMinorUnits: number
  trackingNumber: string | null
  trackingUrl: string | null
  createdAt: string
  items: {
    quantity: number
    unitPriceMinorUnits: number
    variant: { size: string; product: { name: string } }
    batch: { id: string; batchNumber: string; coaFileUrl: string | null; purity: string | null; reportedAt: string | null; isCurrent: boolean; createdAt: string; productId: string }
  }[]
}

const STATUS_COPY: Record<string, string> = {
  pending: 'Your order is being prepared.',
  shipped: 'On its way.',
  delivered: 'Delivered.',
  cancelled: 'This order was cancelled.',
  refunded: 'This order was refunded.',
}

export default function OrderStatusPage() {
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<OrderStatusResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setSearching(true)
    setError(null)
    setResult(null)
    try {
      const order = await api<OrderStatusResult>(
        `/api/order-status?orderId=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`,
        { method: 'GET' },
      )
      setResult(order)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong looking that up.')
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Order status</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Enter your order number and the email address used at checkout. Both must match.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          required
          placeholder="Order number"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="data-figure w-full rounded-sm border border-border px-3 py-2 text-sm"
        />
        <input
          type="email"
          required
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-sm border border-border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={searching}
          className="w-full rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-bone hover:bg-accent-hover disabled:opacity-50"
        >
          Look up order
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {result && (
        <div className="mt-8 rounded-md border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="data-figure text-sm text-ink">{result.id}</span>
            <span className="data-figure text-sm font-medium text-ink">{formatGBP(result.totalMinorUnits)}</span>
          </div>
          <p className="mt-2 text-sm text-ink">{STATUS_COPY[result.status] ?? result.status}</p>
          {result.trackingNumber && result.trackingUrl && (
            <p className="mt-1 text-sm">
              Tracking:{' '}
              <a href={result.trackingUrl} target="_blank" rel="noreferrer" className="data-figure text-accent hover:text-accent-hover">
                {result.trackingNumber}
              </a>
            </p>
          )}

          <ul className="mt-4 space-y-3 border-t border-border pt-4">
            {result.items.map((item, i) => (
              <li key={i} className="text-sm">
                <p className="text-ink">
                  {item.variant.product.name} ({item.variant.size}) &times; {item.quantity}
                </p>
                <div className="mt-2">
                  <COACard batch={item.batch} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
