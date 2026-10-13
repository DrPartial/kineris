'use client'

import type { ProductVariant } from '@kineris/shared'
import { useEffect, useState } from 'react'
import { useVariantSelection } from './VariantSelection'
import { formatGBP } from '@/lib/money'
import { useAddToCart } from '@/lib/useAddToCart'

/**
 * Mobile-only bar that appears once the main buy form has scrolled out of view, so adding to the
 * cart is always one tap away. Sits above the bottom nav (h-16 + safe area).
 */
export function StickyBuyBar({
  targetId,
  productName,
  variants,
}: {
  targetId: string
  productName: string
  variants: ProductVariant[]
}) {
  const shared = useVariantSelection()
  const addToCart = useAddToCart()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = document.getElementById(targetId)
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0))
    io.observe(el)
    return () => io.disconnect()
  }, [targetId])

  const selected = variants.find((v) => v.id === shared?.selectedId) ?? variants[0]
  if (!selected || !visible || selected.stock <= 0) return null

  return (
    <div
      className="animate-pop-in fixed inset-x-0 z-20 flex items-center gap-3 border-t border-border bg-surface px-4 py-3 lg:hidden"
      style={{ bottom: 'calc(3.5rem + env(safe-area-inset-bottom))' }}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{productName}</p>
        <p className="data-figure text-xs text-ink-muted">
          {selected.size} &middot; {formatGBP(selected.priceMinorUnits)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => addToCart(selected.id)}
        className="shrink-0 rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold text-bone hover:bg-accent-hover"
      >
        Add to cart
      </button>
    </div>
  )
}
