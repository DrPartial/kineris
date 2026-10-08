import type { Product } from '@kineris/shared'
import Link from 'next/link'
import { Badge } from './Badge'
import { ProductImage } from './ProductImage'
import { formatGBP } from '@/lib/money'

export function ProductCard({ product }: { product: Product }) {
  const cheapestVariant = product.variants.reduce<(typeof product.variants)[number] | undefined>(
    (min, v) => (!min || v.priceMinorUnits < min.priceMinorUnits ? v : min),
    undefined,
  )
  const cheapest = cheapestVariant?.priceMinorUnits ?? 0
  const inStock = product.variants.some((v) => v.stock > 0)
  const purity = product.variants[0]?.purity

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col rounded-md border border-border bg-surface p-4 no-underline transition-colors hover:border-accent"
    >
      {/* The card is already white and bordered, so the white vial photo needs no frame of its own. */}
      <ProductImage
        slug={product.slug}
        name={product.name}
        size={cheapestVariant?.size}
        formula={product.molecularFormula}
        bordered={false}
        sizes="(min-width: 1024px) 240px, (min-width: 640px) 33vw, 50vw"
        className="mb-3 aspect-square"
      />
      <h3 className="text-sm font-medium text-ink">{product.name}</h3>
      {purity && (
        <div className="mt-1">
          <Badge variant="verified">{purity}</Badge>
        </div>
      )}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 pt-2">
        <span className="data-figure text-sm text-ink">from {formatGBP(cheapest)}</span>
        <span className="text-xs text-ink-hint">{inStock ? 'In stock' : 'Out of stock'}</span>
      </div>
    </Link>
  )
}
