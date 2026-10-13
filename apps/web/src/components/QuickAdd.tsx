'use client'

import type { ProductVariant } from '@kineris/shared'
import { useEffect, useRef, useState } from 'react'
import { formatGBP } from '@/lib/money'
import { useAddToCart } from '@/lib/useAddToCart'

/**
 * Add-to-cart straight from a product card. One in-stock size adds immediately; several open a
 * small size chooser first. Either way the cart drawer slides open.
 */
export function QuickAdd({ variants, productName }: { variants: ProductVariant[]; productName: string }) {
  const addToCart = useAddToCart()
  const [choosing, setChoosing] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const available = variants.filter((v) => v.stock > 0)

  useEffect(() => {
    if (!choosing) return
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setChoosing(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setChoosing(false)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [choosing])

  const base = 'w-full rounded-sm border px-3 py-2 text-xs font-semibold'
  if (available.length === 0) {
    return (
      <button type="button" disabled className={`${base} border-border text-ink-hint`}>
        Out of stock
      </button>
    )
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup={available.length > 1 ? 'listbox' : undefined}
        aria-expanded={available.length > 1 ? choosing : undefined}
        onClick={() => (available.length === 1 ? addToCart(available[0].id) : setChoosing((c) => !c))}
        className={`${base} border-border text-ink hover:border-accent hover:text-accent`}
      >
        {available.length === 1 ? 'Add to cart' : choosing ? 'Choose a size' : 'Quick add'}
      </button>
      {choosing && (
        <ul role="listbox" aria-label={`${productName} sizes`} className="animate-pop-in absolute inset-x-0 bottom-full z-10 mb-2 rounded-md border border-border-strong bg-surface p-1">
          {available.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => {
                  setChoosing(false)
                  addToCart(v.id)
                }}
                className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-sm text-ink hover:bg-surface-sunken"
              >
                <span>{v.size}</span>
                <span className="data-figure text-ink-muted">{formatGBP(v.priceMinorUnits)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
