import { SHIPPING_OPTIONS } from '@kineris/shared'
import { formatGBP } from '@/lib/money'

const cheapestShipping = SHIPPING_OPTIONS.reduce((min, opt) => (opt.priceMinorUnits < min.priceMinorUnits ? opt : min))

/**
 * Pack 2.1: RUO must be visible throughout the site, not hidden in the
 * footer. Rendered in the root layout so every single page carries it,
 * rather than being a per-page decision someone could forget to add. Also
 * carries a real shipping fact (sourced from the actual configured options,
 * not an invented free-shipping threshold) instead of a separate
 * announcement bar, so the RUO line isn't duplicated across two strips.
 *
 * sticky + z-50 so it stays visible above every overlay (drawer, search,
 * account, welcome modal -- all z-40, see Modal.tsx) rather than being
 * covered by them, per pack 2.1's "visible throughout the site."
 *
 * id="site-ruo-bar" is read by Modal.tsx to measure this bar's rendered
 * height, so a left/right drawer can start its own panel below it instead
 * of underneath it.
 */
export function RuoBar() {
  return (
    <div id="site-ruo-bar" className="sticky top-0 z-50 bg-ruo-bar text-ruo-bar-ink text-xs tracking-wide">
      {/* No items-center at the base size: a flex item's default min-width is
          its content's unwrapped width, so a centered (shrink-to-fit) item
          can force the row wider than the viewport. items-stretch (the
          default) + text-center lets the sentence actually wrap below sm. */}
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-1 px-4 py-2 sm:flex-row sm:items-center">
        <span className="data-figure min-w-0 text-center">
          Tracked UK dispatch from {formatGBP(cheapestShipping.priceMinorUnits)}
        </span>
        <span className="min-w-0 text-center">For laboratory research use only. Not for human or veterinary use.</span>
      </div>
    </div>
  )
}
