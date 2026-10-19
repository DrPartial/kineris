'use client'

import { useCart } from '@/contexts/CartContext'
import { useOverlay } from '@/contexts/OverlayContext'

/** One-tap add from a product card; opens the cart drawer so the add is visible. */
export function QuickAddButton({ variantId, label = 'Add to cart' }: { variantId: string; label?: string }) {
  const { addLine } = useCart()
  const { setOpenOverlay } = useOverlay()
  return (
    <button
      type="button"
      onClick={() => {
        addLine(variantId, 1)
        setOpenOverlay('cart')
      }}
      className="w-full rounded-sm bg-accent px-3 py-2 text-xs font-semibold text-bone hover:bg-accent-hover"
    >
      {label}
    </button>
  )
}
