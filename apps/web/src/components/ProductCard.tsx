import type { Product } from '@kineris/shared'
import Link from 'next/link'
import { Badge } from './Badge'
import { ImagePlaceholder } from './ImagePlaceholder'
import { formatGBP } from '@/lib/money'

export function ProductCard({ product }: { product: Product }) {
  const cheapest = product.variants.reduce(
    (min, v) => (v.priceMinorUnits < min ? v.priceMinorUnits : min),
    product.variants[0]?.priceMinorUnits ?? 0,
  )
  const inStock = product.variants.some((v) => v.stock > 0)
  const purity = product.variants[0]?.purity

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block rounded-md border border-border bg-surface p-4 no-underline transition-colors hover:border-accent"
    >
      <ImagePlaceholder label={product.name} formula={product.molecularFormula} className="mb-3 aspect-square" />
      <h3 className="text-sm font-medium text-ink">{product.name}</h3>
      {purity && (
        <div className="mt-1">
          <Badge variant="verified">{purity}</Badge>
        </div>
      )}
      <div className="mt-2 flex items-center justify-between">
        <span className="data-figure text-sm text-ink">from {formatGBP(cheapest)}</span>
        <span className="text-xs text-ink-hint">{inStock ? 'In stock' : 'Out of stock'}</span>
      </div>
    </Link>
  )
}
