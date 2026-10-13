'use client'

import { useCart } from '@/contexts/CartContext'
import { useOverlay } from '@/contexts/OverlayContext'

/** Adds to the cart and slides the cart drawer open, so the shopper sees it land and can keep shopping. */
export function useAddToCart() {
  const { addLine } = useCart()
  const { setOpenOverlay } = useOverlay()
  return (variantId: string, quantity = 1, { openCart = true } = {}) => {
    addLine(variantId, quantity)
    if (openCart) setOpenOverlay('cart')
  }
}
