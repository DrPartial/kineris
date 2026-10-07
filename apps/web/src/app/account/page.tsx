'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { api, ApiError } from '@/lib/api'
import { formatGBP } from '@/lib/money'

interface Me {
  id: string
  email: string
}

interface OrderSummary {
  id: string
  status: string
  totalMinorUnits: number
  createdAt: string
  items: { variantId: string; quantity: number; variant: { size: string; product: { name: string } } }[]
}

export default function AccountPage() {
  const { addLine } = useCart()
  const [me, setMe] = useState<Me | null | 'loading'>('loading')
  const [orders, setOrders] = useState<OrderSummary[]>([])

  useEffect(() => {
    api<Me>('/api/auth/me')
      .then((user) => {
        setMe(user)
        return api<OrderSummary[]>('/api/account/orders')
      })
      .then(setOrders)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) setMe(null)
      })
  }, [])

  async function signOut() {
    await api('/api/auth/log-out', { method: 'POST' })
    setMe(null)
  }

  function reorder(order: OrderSummary) {
    for (const item of order.items) addLine(item.variantId, item.quantity)
  }

  if (me === 'loading') return <div className="mx-auto max-w-3xl px-4 py-16 text-sm text-ink-muted">Loading...</div>

  if (me === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-ink-muted">Sign in to view your account.</p>
        <Link href="/account/sign-in" className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-hover">
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Account</h1>
        <button type="button" onClick={signOut} className="text-sm text-ink-muted hover:text-ink">
          Sign out
        </button>
      </div>
      <p className="mt-1 text-sm text-ink-muted">{me.email}</p>

      <h2 className="mt-8 mb-4 text-lg font-semibold text-ink">Order history</h2>
      {orders.length === 0 ? (
        <p className="text-sm text-ink-muted">No orders yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-sm border border-border">
          {orders.map((order) => (
            <li key={order.id} className="p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="data-figure text-ink">{order.id}</span>
                <span className="capitalize text-ink-muted">{order.status}</span>
              </div>
              <ul className="mt-2 space-y-1 text-sm text-ink-muted">
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.variant.product.name} ({item.variant.size}) &times; {item.quantity}
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex items-center justify-between">
                <span className="data-figure text-sm font-medium text-ink">{formatGBP(order.totalMinorUnits)}</span>
                <button
                  type="button"
                  onClick={() => reorder(order)}
                  className="text-xs font-medium text-accent hover:text-accent-hover"
                >
                  Reorder
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
