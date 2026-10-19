import Link from 'next/link'

/**
 * Fills the last slot of the homepage range grid with a quiet link to the shop. Deliberately
 * secondary: no filled button, so the product cards' "Add to cart" stays the main action.
 */
export function ShopAllCard() {
  return (
    <Link
      href="/shop"
      className="group flex h-full flex-col items-center justify-center gap-5 rounded-md bg-surface-sunken p-6 text-center no-underline transition-colors hover:bg-accent-soft"
    >
      <span
        aria-hidden
        className="flex h-12 w-12 items-center justify-center rounded-full border border-border-strong text-lg text-ink transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-white"
      >
        &rarr;
      </span>
      <div>
        <p className="font-display text-xl font-semibold tracking-tight text-ink">Shop all</p>
        <p className="mt-1 text-sm text-ink-muted">Peptides, bundles and lab supplies</p>
      </div>
    </Link>
  )
}
