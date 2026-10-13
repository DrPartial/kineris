'use client'

import { FREE_SHIPPING_THRESHOLD_MINOR_UNITS, type Product, type ProductVariant } from '@kineris/shared'
import Link from 'next/link'
import { useMemo } from 'react'
import { Modal } from './Modal'
import { ProductImage } from './ProductImage'
import { useCart } from '@/contexts/CartContext'
import { useOverlay } from '@/contexts/OverlayContext'
import { formatGBP } from '@/lib/money'
import { useProducts } from '@/lib/useProducts'

interface Resolved {
  variant: ProductVariant
  product: Product
}

const iconButton =
  'flex h-8 w-8 items-center justify-center rounded-sm border border-border text-ink hover:border-accent disabled:opacity-40 disabled:hover:border-border'

export function CartDrawer() {
  const { openOverlay, setOpenOverlay } = useOverlay()
  const { lines, setQuantity, removeLine, addLine } = useCart()
  const open = openOverlay === 'cart'
  const products = useProducts(open || lines.length > 0)

  const variants = useMemo(() => {
    const map = new Map<string, Resolved>()
    for (const p of products) for (const v of p.variants) map.set(v.id, { variant: v, product: p })
    return map
  }, [products])

  const rows = lines
    .map((line) => ({ line, resolved: variants.get(line.variantId) }))
    .filter((r): r is { line: (typeof lines)[number]; resolved: Resolved } => r.resolved !== undefined)

  const itemCount = rows.reduce((n, r) => n + r.line.quantity, 0)
  const subtotal = rows.reduce((sum, r) => sum + r.resolved.variant.priceMinorUnits * r.line.quantity, 0)
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD_MINOR_UNITS - subtotal)
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD_MINOR_UNITS) * 100)

  const inCart = new Set(rows.map((r) => r.resolved.product.id))
  const suggestions = products.filter((p) => !inCart.has(p.id) && p.variants.some((v) => v.stock > 0)).slice(0, 2)

  function close() {
    setOpenOverlay(null)
  }

  return (
    <Modal open={open} onClose={close} label="Shopping cart" align="right">
      <div className="flex h-dvh w-[min(100vw,26rem)] flex-col bg-surface pt-[var(--ruo-h,2rem)] sm:border-l sm:border-border">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-ink">
            Your cart{itemCount > 0 && <span className="ml-2 text-sm font-normal text-ink-hint">({itemCount})</span>}
          </h2>
          <button type="button" onClick={close} aria-label="Close cart" className="text-2xl leading-none text-ink-hint hover:text-ink">
            &times;
          </button>
        </div>

        {rows.length === 0 && lines.length > 0 && products.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-sm text-ink-hint">Loading your cart…</div>
        ) : rows.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="text-ink-muted">Your cart is empty.</p>
            <Link
              href="/shop"
              onClick={close}
              className="mt-5 rounded-sm bg-accent px-5 py-3 text-sm font-semibold text-bone no-underline hover:bg-accent-hover"
            >
              Browse the catalogue
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-border px-5 py-4">
              <p className="text-sm text-ink">
                {remaining > 0 ? (
                  <>
                    Add <span className="data-figure font-semibold">{formatGBP(remaining)}</span> more for free UK delivery
                  </>
                ) : (
                  'You’ve unlocked free UK delivery (Royal Mail Tracked 48).'
                )}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-sunken" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to free delivery">
                <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <ul className="divide-y divide-border px-5">
                {rows.map(({ line, resolved: { variant, product } }) => (
                  <li key={line.variantId} className="flex gap-4 py-4">
                    <Link href={`/products/${product.slug}`} onClick={close} className="block h-20 w-20 shrink-0">
                      <ProductImage slug={product.slug} name={product.name} size={variant.size} formula={product.molecularFormula} className="h-20 w-20" sizes="80px" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link href={`/products/${product.slug}`} onClick={close} className="block truncate text-sm font-medium text-ink no-underline hover:text-accent">
                            {product.name}
                          </Link>
                          <p className="text-xs text-ink-hint">{variant.size}</p>
                        </div>
                        <span className="data-figure text-sm text-ink">{formatGBP(variant.priceMinorUnits * line.quantity)}</span>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <button type="button" aria-label={`Decrease ${product.name} quantity`} onClick={() => setQuantity(line.variantId, line.quantity - 1)} className={iconButton}>
                            &minus;
                          </button>
                          <span className="data-figure w-6 text-center text-sm" aria-live="polite">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase ${product.name} quantity`}
                            disabled={line.quantity >= variant.stock}
                            onClick={() => setQuantity(line.variantId, line.quantity + 1)}
                            className={iconButton}
                          >
                            +
                          </button>
                        </div>
                        <button type="button" onClick={() => removeLine(line.variantId)} className="text-xs text-ink-hint underline underline-offset-2 hover:text-ink">
                          Remove
                        </button>
                      </div>
                      {line.quantity >= variant.stock && <p className="mt-1 text-xs text-ink-hint">Maximum available</p>}
                    </div>
                  </li>
                ))}
              </ul>

              {suggestions.length > 0 && (
                <div className="border-t border-border px-5 py-5">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">Also in the catalogue</h3>
                  <ul className="mt-3 space-y-3">
                    {suggestions.map((p) => {
                      const v = p.variants.filter((x) => x.stock > 0).sort((a, b) => a.priceMinorUnits - b.priceMinorUnits)[0]
                      return (
                        <li key={p.id} className="flex items-center gap-3">
                          <Link href={`/products/${p.slug}`} onClick={close} className="block h-12 w-12 shrink-0">
                            <ProductImage slug={p.slug} name={p.name} size={v.size} formula={p.molecularFormula} className="h-12 w-12" sizes="48px" />
                          </Link>
                          <div className="min-w-0 flex-1">
                            <Link href={`/products/${p.slug}`} onClick={close} className="block truncate text-sm text-ink no-underline hover:text-accent">
                              {p.name}
                            </Link>
                            <p className="data-figure text-xs text-ink-hint">
                              {v.size} &middot; {formatGBP(v.priceMinorUnits)}
                            </p>
                          </div>
                          <button type="button" onClick={() => addLine(v.id, 1)} className="rounded-sm border border-border px-3 py-1.5 text-xs font-semibold text-ink hover:border-accent">
                            + Add
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div className="border-t border-border bg-surface px-5 pb-5 pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-ink-muted">Subtotal</span>
                <span className="data-figure text-lg font-semibold text-ink">{formatGBP(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-ink-hint">Delivery and discount codes are applied at checkout.</p>
              <Link
                href="/checkout"
                onClick={close}
                className="mt-4 block rounded-sm bg-accent px-5 py-3 text-center text-sm font-semibold text-bone no-underline hover:bg-accent-hover"
              >
                Checkout
              </Link>
              <button type="button" onClick={close} className="mt-2 block w-full rounded-sm border border-border px-5 py-3 text-center text-sm font-semibold text-ink hover:border-accent">
                Continue shopping
              </button>
              <p className="mt-3 text-center text-xs text-ink-hint">For laboratory research use only.</p>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
