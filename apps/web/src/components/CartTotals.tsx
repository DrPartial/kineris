'use client'

import { FREE_SHIPPING_OPTION_ID, FREE_SHIPPING_THRESHOLD_MINOR_UNITS, SHIPPING_OPTIONS } from '@kineris/shared'
import Link from 'next/link'
import type { priceCart, ResolvedVariant } from '@/lib/cartPricing'
import { formatGBP } from '@/lib/money'
import { useCart } from '@/contexts/CartContext'
import { DispatchCountdown } from './DispatchCountdown'

type Pricing = ReturnType<typeof priceCart>

/** Free-delivery progress bar: the nudge to add one more vial. */
export function FreeShippingProgress({ pricing }: { pricing: Pricing }) {
  const pct = Math.min(100, Math.round((pricing.goodsTotal / FREE_SHIPPING_THRESHOLD_MINOR_UNITS) * 100))
  return (
    <div>
      <p className="text-sm text-ink">
        {pricing.toFreeShipping > 0 ? (
          <>
            You&rsquo;re <span className="data-figure font-semibold">{formatGBP(pricing.toFreeShipping)}</span> away from
            free tracked delivery
          </>
        ) : (
          <span className="font-medium text-accent">You&rsquo;ve unlocked free tracked delivery</span>
        )}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-sunken" aria-hidden="true">
        <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

/** Subtotal, any bundle savings, and the goods total, used by the cart drawer and cart page. */
export function CartTotalsBlock({ pricing }: { pricing: Pricing }) {
  return (
    <div className="space-y-1.5 text-sm">
      {pricing.bundles.savingMinorUnits > 0 && (
        <>
          <div className="flex items-center justify-between text-ink-muted">
            <span>Subtotal</span>
            <span className="data-figure">{formatGBP(pricing.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-accent">
            <span>Bundle savings ({pricing.bundles.applied.map((a) => (a.count > 1 ? `${a.count} × ${a.name}` : a.name)).join(', ')})</span>
            <span className="data-figure">-{formatGBP(pricing.bundles.savingMinorUnits)}</span>
          </div>
        </>
      )}
      <div className="flex items-center justify-between">
        <span className="text-ink-muted">Total before delivery</span>
        <span className="data-figure text-lg font-semibold text-ink">{formatGBP(pricing.goodsTotal)}</span>
      </div>
      <p className="text-xs text-ink-hint">
        Delivery:{' '}
        {SHIPPING_OPTIONS.map(
          (o) =>
            `${o.label.replace('Royal Mail ', '')} ${formatGBP(o.priceMinorUnits)}${
              o.id === FREE_SHIPPING_OPTION_ID ? ` (free over £${FREE_SHIPPING_THRESHOLD_MINOR_UNITS / 100})` : ''
            }`,
        ).join(' · ')}
      </p>
      <DispatchCountdown className="text-xs text-ink-muted" />
    </div>
  )
}

/**
 * One suggested add-on: bacteriostatic water if the cart has none,
 * otherwise nothing (bundles are applied automatically, so there is no
 * separate bundle to upsell into).
 */
export function CartAddOn({
  pricing,
  variants,
}: {
  pricing: Pricing
  variants: Map<string, ResolvedVariant>
}) {
  const { addLine } = useCart()
  const water = [...variants.values()].find((v) => v.productSlug === 'bacteriostatic-water' && v.stock > 0)
  const hasWater = pricing.resolved.some((r) => r.variant.productSlug === 'bacteriostatic-water')
  if (!water || hasWater || pricing.resolved.length === 0) return null
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-page p-3 text-sm">
      <div className="min-w-0">
        <p className="font-medium text-ink">Add bacteriostatic water</p>
        <p className="text-xs text-ink-hint">
          {water.size} vial, {formatGBP(water.priceMinorUnits)} &middot;{' '}
          <Link href="/products/bacteriostatic-water" className="text-ink-hint">
            details
          </Link>
        </p>
      </div>
      <button
        type="button"
        onClick={() => addLine(water.variantId, 1)}
        className="shrink-0 rounded-sm border border-accent px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent-soft"
      >
        Add
      </button>
    </div>
  )
}
