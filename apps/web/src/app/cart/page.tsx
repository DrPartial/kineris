'use client'

import type { Product } from '@kineris/shared'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CartAddOn, CartTotalsBlock, FreeShippingProgress } from '@/components/CartTotals'
import { ProductImage } from '@/components/ProductImage'
import { useCart } from '@/contexts/CartContext'
import { api } from '@/lib/api'
import { priceCart, resolveVariants, type ResolvedVariant } from '@/lib/cartPricing'
import { formatGBP } from '@/lib/money'

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

  const pricing = priceCart(lines, variantMap)
  const resolvedLines = pricing.resolved


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
            <div className="flex items-center gap-4">
              <ProductImage
                slug={variant.productSlug}
                name={variant.productName}
                size={variant.size}
                formula={variant.molecularFormula}
                bordered
                sizes="64px"
                className="h-16 w-16 shrink-0"
              />
              <div>
                <Link href={`/products/${variant.productSlug}`} className="text-sm font-medium text-ink no-underline hover:text-accent">
                  {variant.productName}
                </Link>
                <p className="text-xs text-ink-hint">{variant.size}</p>
              </div>
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

      <div className="mt-6 space-y-4 border-t border-border pt-4">
        <FreeShippingProgress pricing={pricing} />
        <CartAddOn pricing={pricing} variants={variantMap} />
        <CartTotalsBlock pricing={pricing} />
      </div>

      <Link
        href="/checkout"
        className="mt-6 block rounded-sm bg-accent px-5 py-3 text-center text-sm font-medium text-bone no-underline hover:bg-accent-hover"
      >
        Proceed to checkout
      </Link>
    </div>
  )
}
