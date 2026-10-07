'use client'

import type { Product } from '@kineris/shared'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { api } from '@/lib/api'
import { formatGBP } from '@/lib/money'

interface ResolvedVariant {
  variantId: string
  productSlug: string
  productName: string
  size: string
  priceMinorUnits: number
  stock: number
}

function resolveVariants(products: Product[]): Map<string, ResolvedVariant> {
  const map = new Map<string, ResolvedVariant>()
  for (const p of products) {
    for (const v of p.variants) {
      map.set(v.id, {
        variantId: v.id,
        productSlug: p.slug,
        productName: p.name,
        size: v.size,
        priceMinorUnits: v.priceMinorUnits,
        stock: v.stock,
      })
    }
  }
  return map
}

export default function CartPage() {
  const { lines, setQuantity, removeLine } = useCart()
  const [variantMap, setVariantMap] = useState<Map<string, ResolvedVariant>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<Product[]>('/api/products')
      .then((products) => setVariantMap(resolveVariants(products)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-ink-muted">Loading cart...</div>

  const resolvedLines = lines
    .map((l) => ({ line: l, variant: variantMap.get(l.variantId) }))
    .filter((r): r is { line: typeof lines[number]; variant: ResolvedVariant } => r.variant !== undefined)

  const subtotal = resolvedLines.reduce((sum, r) => sum + r.variant.priceMinorUnits * r.line.quantity, 0)

  if (resolvedLines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-ink-muted">Your cart is empty.</p>
        <Link href="/shop" className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-hover">
          Browse the catalogue
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Cart</h1>

      <ul className="mt-6 divide-y divide-border">
        {resolvedLines.map(({ line, variant }) => (
          <li key={line.variantId} className="flex items-center justify-between gap-4 py-4">
            <div>
              <Link href={`/products/${variant.productSlug}`} className="text-sm font-medium text-ink no-underline hover:text-accent">
                {variant.productName}
              </Link>
              <p className="text-xs text-ink-hint">{variant.size}</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={variant.stock}
                value={line.quantity}
                onChange={(e) => setQuantity(line.variantId, Number(e.target.value))}
                className="w-16 rounded-sm border border-border px-2 py-1 text-sm"
              />
              <span className="data-figure w-20 text-right text-sm text-ink">
                {formatGBP(variant.priceMinorUnits * line.quantity)}
              </span>
              <button
                type="button"
                onClick={() => removeLine(line.variantId)}
                className="text-xs text-ink-hint hover:text-ink"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm text-ink-muted">Subtotal</span>
        <span className="data-figure text-lg font-semibold text-ink">{formatGBP(subtotal)}</span>
      </div>

      <Link
        href="/checkout"
        className="mt-6 block rounded-sm bg-accent px-5 py-3 text-center text-sm font-medium text-white no-underline hover:bg-accent-hover"
      >
        Proceed to checkout
      </Link>
    </div>
  )
}
