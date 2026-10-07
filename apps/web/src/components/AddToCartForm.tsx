'use client'

import type { ProductVariant } from '@kineris/shared'
import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { formatGBP } from '@/lib/money'
import { BackInStockForm } from './BackInStockForm'
import { useVariantSelection } from './VariantSelection'

export function AddToCartForm({ variants }: { variants: ProductVariant[] }) {
  // Controlled by the product page's VariantSelectionProvider (so the image follows the size);
  // standalone it keeps its own state.
  const shared = useVariantSelection()
  const [localId, setLocalId] = useState(variants[0]?.id)
  const selectedId = shared ? shared.selectedId : localId
  const setSelectedId = shared ? shared.select : setLocalId
  const { addLine } = useCart()
  const [added, setAdded] = useState(false)

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0]
  if (!selected) return null
  const inStock = selected.stock > 0

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-ink">Size</p>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => {
                setSelectedId(v.id)
                setAdded(false)
              }}
              className={`rounded-sm border px-3 py-1.5 text-sm ${
                v.id === selectedId
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-border text-ink-muted hover:border-accent'
              }`}
            >
              {v.size}
            </button>
          ))}
        </div>
      </div>

      <p className="data-figure text-2xl font-semibold text-ink">{formatGBP(selected.priceMinorUnits)}</p>
      {inStock && selected.stock <= 5 ? (
        <span className="data-figure inline-block rounded-sm bg-ember px-2 py-1 text-xs font-medium text-pine-ink">
          Only {selected.stock} remaining
        </span>
      ) : (
        <p className="text-sm text-ink-muted">{inStock ? 'In stock' : 'Out of stock'}</p>
      )}

      {inStock ? (
        <button
          type="button"
          onClick={() => {
            addLine(selected.id, 1)
            setAdded(true)
          }}
          className="w-full rounded-sm bg-accent px-5 py-3 text-sm font-medium text-bone hover:bg-accent-hover sm:w-auto"
        >
          {added ? 'Added to cart' : 'Add to cart'}
        </button>
      ) : (
        <BackInStockForm variantId={selected.id} />
      )}
    </div>
  )
}
