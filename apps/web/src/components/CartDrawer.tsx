'use client'

import type { Product } from '@kineris/shared'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CartAddOn, CartTotalsBlock, FreeShippingProgress } from './CartTotals'
import { Modal } from './Modal'
import { ProductImage } from './ProductImage'
import { useCart } from '@/contexts/CartContext'
import { useOverlay } from '@/contexts/OverlayContext'
import { api } from '@/lib/api'
import { priceCart, resolveVariants, type ResolvedVariant } from '@/lib/cartPricing'
import { formatGBP } from '@/lib/money'

/**
 * The cart as a right-side drawer, the primary way to review/edit it without
 * leaving the page. /cart still exists as a real, linkable page (the drawer
 * links to it at the bottom) for anyone who'd rather have it full-screen.
 */
export function CartDrawer() {
  const { openOverlay, setOpenOverlay } = useOverlay()
  const open = openOverlay === 'cart'
  const { lines, setQuantity, removeLine } = useCart()
  const [variantMap, setVariantMap] = useState<Map<string, ResolvedVariant>>(new Map())

  useEffect(() => {
    if (open && variantMap.size === 0) {
      api<Product[]>('/api/products').then((products) => setVariantMap(resolveVariants(products)))
    }
  }, [open, variantMap.size])

  function close() {
    setOpenOverlay(null)
  }

  const pricing = priceCart(lines, variantMap)
  const resolvedLines = pricing.resolved

  return (
    <Modal open={open} onClose={close} label="Cart" align="right">
      <div className="flex h-full w-[min(100vw,26rem)] flex-col bg-surface">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-display text-lg font-semibold text-ink">Cart</h2>
          <button type="button" onClick={close} aria-label="Close cart" className="text-ink-hint hover:text-ink">
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {resolvedLines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-sm text-ink-muted">Your cart is empty.</p>
              <Link
                href="/shop"
                onClick={close}
                className="mt-4 text-sm font-medium text-accent no-underline hover:text-accent-hover"
              >
                Browse the catalogue
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {resolvedLines.map(({ line, variant }) => (
                <li key={line.variantId} className="flex items-center gap-3 py-4 first:pt-0">
                  <ProductImage
                    slug={variant.productSlug}
                    name={variant.productName}
                    size={variant.size}
                    formula={variant.molecularFormula}
                    bordered
                    sizes="56px"
                    className="h-14 w-14 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${variant.productSlug}`}
                      onClick={close}
                      className="block truncate text-sm font-medium text-ink no-underline hover:text-accent"
                    >
                      {variant.productName}
                    </Link>
                    <p className="text-xs text-ink-hint">{variant.size}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={variant.stock}
                        value={line.quantity}
                        onChange={(e) => setQuantity(line.variantId, Number(e.target.value))}
                        className="w-14 rounded-sm border border-border px-2 py-1 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => removeLine(line.variantId)}
                        className="text-xs text-ink-hint hover:text-ink"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <span className="data-figure shrink-0 text-sm text-ink">
                    {formatGBP(variant.priceMinorUnits * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {resolvedLines.length > 0 && (
          <div className="space-y-4 border-t border-border p-4">
            <FreeShippingProgress pricing={pricing} />
            <CartAddOn pricing={pricing} variants={variantMap} />
            <CartTotalsBlock pricing={pricing} />
            <Link
              href="/checkout"
              onClick={close}
              className="block rounded-sm bg-accent px-5 py-3 text-center text-sm font-medium text-bone no-underline hover:bg-accent-hover"
            >
              Proceed to checkout
            </Link>
            <Link
              href="/cart"
              onClick={close}
              className="-mt-1 block text-center text-xs text-ink-hint no-underline hover:text-ink"
            >
              View full cart
            </Link>
          </div>
        )}
      </div>
    </Modal>
  )
}
