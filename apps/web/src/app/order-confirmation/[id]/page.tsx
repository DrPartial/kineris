import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatGBP } from '@/lib/money'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

interface OrderDetail {
  id: string
  totalMinorUnits: number
  customerEmail: string
  trackingNumber: string | null
  items: { quantity: number; unitPriceMinorUnits: number; variant: { size: string; product: { name: string } } }[]
}

async function fetchOrder(id: string): Promise<OrderDetail | null> {
  const res = await fetch(`${API_URL}/api/orders/${id}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await fetchOrder(id)
  if (!order) notFound()

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Order confirmed</h1>
      <p className="mt-2 text-sm text-ink-muted">
        A confirmation has been sent to {order.customerEmail}. Your order number is{' '}
        <span className="data-figure">{order.id}</span>.
      </p>

      <ul className="mt-8 divide-y divide-border rounded-sm border border-border text-left">
        {order.items.map((item, i) => (
          <li key={i} className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-ink">
              {item.variant.product.name} ({item.variant.size}) &times; {item.quantity}
            </span>
            <span className="data-figure text-ink-muted">{formatGBP(item.unitPriceMinorUnits * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between px-4 text-base font-semibold text-ink">
        <span>Total</span>
        <span className="data-figure">{formatGBP(order.totalMinorUnits)}</span>
      </div>

      <Link href="/shop" className="mt-8 inline-block text-sm font-medium text-accent hover:text-accent-hover">
        Continue browsing
      </Link>
    </div>
  )
}
