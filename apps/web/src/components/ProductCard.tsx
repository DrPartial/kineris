import type { Product } from '@kineris/shared'
import Link from 'next/link'
import { formatGBP } from '@/lib/money'

/**
 * No product photography yet (imagery rules in pack 2.4: lab/product shots
 * only, never people or lifestyle scenes), so this placeholder block stands
 * in rather than reaching for a generic stock image that would risk
 * breaking that rule by accident.
 */
export function ProductCard({ product }: { product: Product }) {
  const cheapest = product.variants.reduce(
    (min, v) => (v.priceMinorUnits < min ? v.priceMinorUnits : min),
    product.variants[0]?.priceMinorUnits ?? 0,
  )
  const inStock = product.variants.some((v) => v.stock > 0)

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block rounded-sm border border-border bg-surface p-4 no-underline transition-colors hover:border-accent"
    >
      <div className="mb-3 flex aspect-square items-center justify-center rounded-sm bg-surface-sunken text-xs text-ink-hint">
        CoA-backed research grade
      </div>
      <h3 className="text-sm font-medium text-ink">{product.name}</h3>
      {product.variants[0]?.purity && (
        <p className="data-figure text-xs text-ink-hint">{product.variants[0].purity}</p>
      )}
      <div className="mt-2 flex items-center justify-between">
        <span className="data-figure text-sm text-ink">from {formatGBP(cheapest)}</span>
        <span className="text-xs text-ink-hint">{inStock ? 'In stock' : 'Out of stock'}</span>
      </div>
    </Link>
  )
}
