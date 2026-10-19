'use client'

import type { ProductVariant } from '@kineris/shared'
import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useOverlay } from '@/contexts/OverlayContext'
import { formatGBP } from '@/lib/money'
import { BackInStockForm } from './BackInStockForm'
import { useVariantSelection } from './VariantSelection'

/** A pack option for the selected size, e.g. a 5-pack priced from its bundle. */
export interface PackOption {
  id: string
  label: string
  quantity: number
  priceMinorUnits: number
  savingMinorUnits: number
}

export function AddToCartForm({
  variants,
  packs = [],
  lowStockThreshold = 5,
}: {
  variants: ProductVariant[]
  /** Multi-vial packs for the first size; when given, the largest is selected first (anchor high). */
  packs?: PackOption[]
  lowStockThreshold?: number
}) {
  // Controlled by the product page's VariantSelectionProvider (so the image follows the size);
  // standalone it keeps its own state.
  const shared = useVariantSelection()
  const [localId, setLocalId] = useState(variants[0]?.id)
  const selectedId = shared ? shared.selectedId : localId
  const setSelectedId = shared ? shared.select : setLocalId
  const { addLine } = useCart()
  const { setOpenOverlay } = useOverlay()
  const [added, setAdded] = useState(false)
  const packOptions: PackOption[] = packs.length
    ? [
        {
          id: 'single',
          label: 'Single vial',
          quantity: 1,
          priceMinorUnits: variants[0]?.priceMinorUnits ?? 0,
          savingMinorUnits: 0,
        },
        ...packs,
      ]
    : []
  const [packId, setPackId] = useState(packs.length ? packs[packs.length - 1]!.id : 'single')

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0]
  if (!selected) return null
  const pack = packOptions.find((p) => p.id === packId)
  const quantity = pack?.quantity ?? 1
  const inStock = selected.stock >= quantity

  return (
    <div className="space-y-4">
      {variants.length > 1 && (
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
      )}

      {packOptions.length > 0 ? (
        <div className="space-y-2" role="radiogroup" aria-label="Pack size">
          {[...packOptions].reverse().map((p) => (
            <label
              key={p.id}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-sm border px-3 py-2.5 text-sm ${
                p.id === packId ? 'border-accent bg-accent-soft' : 'border-border hover:border-accent'
              }`}
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pack"
                  checked={p.id === packId}
                  onChange={() => {
                    setPackId(p.id)
                    setAdded(false)
                  }}
                />
                <span className="font-medium text-ink">{p.label}</span>
                {p.savingMinorUnits > 0 && (
                  <span className="text-xs font-medium text-accent">Save {formatGBP(p.savingMinorUnits)}</span>
                )}
              </span>
              <span className="data-figure font-semibold text-ink">{formatGBP(p.priceMinorUnits)}</span>
            </label>
          ))}
        </div>
      ) : (
        <p className="data-figure text-2xl font-semibold text-ink">{formatGBP(selected.priceMinorUnits)}</p>
      )}
      {selected.stock > 0 && selected.stock <= lowStockThreshold ? (
        <span className="data-figure inline-block rounded-sm bg-ember px-2 py-1 text-xs font-medium text-pine-ink">
          Low stock: {selected.stock} left
        </span>
      ) : (
        <p className="text-sm text-ink-muted">{selected.stock > 0 ? 'In stock' : 'Out of stock'}</p>
      )}

      {inStock ? (
        <button
          type="button"
          onClick={() => {
            addLine(selected.id, quantity)
            setAdded(true)
            setOpenOverlay('cart')
          }}
          className="w-full rounded-sm bg-accent px-5 py-3 text-sm font-medium text-bone hover:bg-accent-hover sm:w-auto"
        >
          {added ? 'Added to cart' : 'Add to cart'}
        </button>
      ) : selected.stock > 0 ? (
        <p className="text-sm text-ink-muted">Only {selected.stock} left, choose a smaller pack.</p>
      ) : (
        <BackInStockForm variantId={selected.id} />
      )}
    </div>
  )
}
