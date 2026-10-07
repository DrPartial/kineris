'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { COACard } from '@/components/COACard'
import { useCart } from '@/contexts/CartContext'
import { api } from '@/lib/api'
import { formatGBP } from '@/lib/money'

interface OrderSummary {
  id: string
  status: string
  totalMinorUnits: number
  trackingNumber: string | null
  trackingUrl: string | null
  createdAt: string
  items: {
    variantId: string
    quantity: number
    variant: { size: string; product: { name: string } }
    batch: { id: string; batchNumber: string; coaFileUrl: string | null; purity: string | null; reportedAt: string | null; isCurrent: boolean; createdAt: string; productId: string }
  }[]
}

const STATUS_COPY: Record<string, string> = {
  pending: 'Preparing',
  shipped: 'On its way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

export default function AccountOrdersPage() {
  const { addLine } = useCart()
  const [orders, setOrders] = useState<OrderSummary[] | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    api<OrderSummary[]>('/api/account/orders').then(setOrders)
  }, [])

  function reorder(order: OrderSummary) {
    for (const item of order.items) addLine(item.variantId, item.quantity)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Order history</h1>
        <Link href="/account" className="text-sm text-ink-muted hover:text-ink">
          Back to account
        </Link>
      </div>

      {orders === null && <p className="mt-6 text-sm text-ink-muted">Loading...</p>}
      {orders?.length === 0 && <p className="mt-6 text-sm text-ink-muted">No orders yet.</p>}

      {orders && orders.length > 0 && (
        <ul className="mt-6 divide-y divide-border rounded-sm border border-border">
          {orders.map((order) => (
            <li key={order.id} className="p-4">
              <button
                type="button"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                className="flex w-full items-center justify-between text-left text-sm"
              >
                <span className="data-figure text-ink">{order.id}</span>
                <span className="flex items-center gap-3">
                  <span className="data-figure text-ink">{formatGBP(order.totalMinorUnits)}</span>
                  <span className="rounded-full bg-surface-sunken px-2.5 py-0.5 text-xs font-medium text-ink-muted">
                    {STATUS_COPY[order.status] ?? order.status}
                  </span>
                </span>
              </button>

              {order.trackingNumber && order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs font-medium text-accent hover:text-accent-hover"
                >
                  Track package
                </a>
              )}

              {expanded === order.id && (
                <div className="mt-4 space-y-4 border-t border-border pt-4">
                  {order.items.map((item, i) => (
                    <div key={i}>
                      <p className="text-sm text-ink">
                        {item.variant.product.name} ({item.variant.size}) &times; {item.quantity}
                      </p>
                      <div className="mt-2">
                        <COACard batch={item.batch} />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => reorder(order)}
                    className="text-xs font-medium text-accent hover:text-accent-hover"
                  >
                    Reorder
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
