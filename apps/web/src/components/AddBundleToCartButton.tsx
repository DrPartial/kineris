'use client'

import type { Bundle } from '@kineris/shared'
import { useAddToCart } from '@/lib/useAddToCart'

/**
 * The cart has no concept of a bundle line item, only variant lines (see
 * CartContext), a bundle is "separate vials, never a pre-mixed blend"
 * (pack section 7), so adding one to the cart means adding each of its
 * component variants at the quantity the bundle needs.
 */
export function AddBundleToCartButton({ bundle }: { bundle: Bundle }) {
  const addToCart = useAddToCart()
  const inStock = bundle.availableCount > 0

  if (!inStock) {
    return <p className="text-sm text-ink-muted">This bundle is currently out of stock.</p>
  }

  return (
    <button
      type="button"
      onClick={() => {
        bundle.components.forEach((c, i) => addToCart(c.variantId, c.quantity, { openCart: i === bundle.components.length - 1 }))
      }}
      className="w-full rounded-sm bg-accent px-5 py-3 text-sm font-medium text-bone hover:bg-accent-hover sm:w-auto"
    >
      Add bundle to cart
    </button>
  )
}
