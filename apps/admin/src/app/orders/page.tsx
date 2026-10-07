'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/AdminShell'
import { api } from '@/lib/api'
import { formatGBP } from '@/lib/money'

interface OrderAdmin {
  id: string
  customerEmail: string
  status: string
  totalMinorUnits: number
  trackingNumber: string | null
  trackingUrl: string | null
  createdAt: string
  items: { quantity: number; unitPriceMinorUnits: number; variant: { size: string; product: { name: string } }; batch: { batchNumber: string } }[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderAdmin[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, string>>({})

  function load() {
    api<OrderAdmin[]>('/api/admin/orders').then(setOrders)
  }

  useEffect(load, [])

  async function markShipped(orderId: string) {
    const trackingNumber = trackingDrafts[orderId]
    if (!trackingNumber) return
    await api(`/api/admin/orders/${orderId}/ship`, { method: 'PATCH', body: JSON.stringify({ trackingNumber }) })
    load()
  }

  async function markDelivered(orderId: string) {
    await api(`/api/admin/orders/${orderId}/deliver`, { method: 'PATCH' })
    load()
  }

  async function markRefunded(orderId: string) {
    await api(`/api/admin/orders/${orderId}/refund`, { method: 'PATCH' })
    load()
  }

  return (
    <AdminShell>
      <h1 className="text-xl font-semibold text-ink">Orders</h1>

      <ul className="mt-6 divide-y divide-border rounded-sm border border-border">
        {orders.map((order) => (
          <li key={order.id} className="p-4">
            <button
              type="button"
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              className="flex w-full items-center justify-between text-left text-sm"
            >
              <span>
                <span className="data-figure text-ink">{order.id}</span>{' '}
                <span className="text-ink-muted">({order.customerEmail})</span>
              </span>
              <span className="flex items-center gap-4">
                <span className="data-figure">{formatGBP(order.totalMinorUnits)}</span>
                <span className="capitalize text-ink-muted">{order.status}</span>
              </span>
            </button>

            {expanded === order.id && (
              <div className="mt-4 space-y-4 border-t border-border pt-4 print:border-0">
                <div>
                  <h3 className="mb-2 text-xs font-medium uppercase text-ink-hint">Packing slip</h3>
                  <ul className="space-y-1 text-sm">
                    {order.items.map((item, i) => (
                      <li key={i}>
                        {item.quantity} &times; {item.variant.product.name} ({item.variant.size}), batch{' '}
                        <span className="data-figure">{item.batch.batchNumber}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="mt-2 text-xs text-accent hover:text-accent-hover print:hidden"
                  >
                    Print packing slip
                  </button>
                </div>

                {order.status === 'pending' && (
                  <div className="flex items-end gap-2 print:hidden">
                    <div>
                      <label className="mb-1 block text-xs text-ink-hint">Carrier</label>
                      <select disabled className="w-32 rounded-sm border border-border bg-surface-sunken px-2 py-1.5 text-sm text-ink-muted">
                        <option>Royal Mail</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-ink-hint">Tracking number</label>
                      <input
                        value={trackingDrafts[order.id] ?? ''}
                        onChange={(e) => setTrackingDrafts((prev) => ({ ...prev, [order.id]: e.target.value }))}
                        className="w-48 rounded-sm border border-border px-2 py-1 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => markShipped(order.id)}
                      className="rounded-sm bg-accent px-3 py-1.5 text-sm font-medium text-bone hover:bg-accent-hover"
                    >
                      Mark as shipped
                    </button>
                  </div>
                )}
                {order.trackingNumber && (
                  <p className="text-xs text-ink-hint">
                    Royal Mail tracking:{' '}
                    {order.trackingUrl ? (
                      <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="data-figure text-accent hover:text-accent-hover">
                        {order.trackingNumber}
                      </a>
                    ) : (
                      <span className="data-figure">{order.trackingNumber}</span>
                    )}
                  </p>
                )}
                {order.status === 'shipped' && (
                  <div className="flex gap-2 print:hidden">
                    <button
                      type="button"
                      onClick={() => markDelivered(order.id)}
                      className="rounded-sm border border-ink px-3 py-1.5 text-sm text-ink hover:bg-surface-sunken"
                    >
                      Mark delivered
                    </button>
                    <button
                      type="button"
                      onClick={() => markRefunded(order.id)}
                      className="rounded-sm border border-border px-3 py-1.5 text-sm text-ink-muted hover:bg-surface-sunken"
                    >
                      Mark refunded
                    </button>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
        {orders.length === 0 && <li className="p-4 text-sm text-ink-muted">No orders yet.</li>}
      </ul>
    </AdminShell>
  )
}
