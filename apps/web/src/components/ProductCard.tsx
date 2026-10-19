import type { Product } from '@kineris/shared'
import Link from 'next/link'
import { Badge } from './Badge'
import { ProductImage } from './ProductImage'
import { QuickAddButton } from './QuickAddButton'
import { formatGBP } from '@/lib/money'

/** Stock label from the admin's real numbers: in stock, low stock with the count, or out of stock. */
export function stockLabel(stock: number, lowStockThreshold: number): string {
  if (stock <= 0) return 'Out of stock'
  if (stock <= lowStockThreshold) return `Low stock: ${stock} left`
  return 'In stock'
}

export function ProductCard({ product }: { product: Product }) {
  const cheapestVariant = product.variants.reduce<(typeof product.variants)[number] | undefined>(
    (min, v) => (!min || v.priceMinorUnits < min.priceMinorUnits ? v : min),
    undefined,
  )
  const cheapest = cheapestVariant?.priceMinorUnits ?? 0
  const stock = product.variants.reduce((sum, v) => sum + v.stock, 0)
  // The batch CoA's tested figure when there is one, otherwise the general spec.
  const purity = product.currentBatch?.purity ?? product.variants[0]?.purity
  const isPeptide = product.category === 'peptide'

  return (
    <div className="group flex h-full flex-col rounded-md border border-border bg-surface p-4 transition-colors hover:border-accent">
      <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col no-underline">
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
        <h3 className="text-sm font-medium text-ink">
          {product.name}
          {cheapestVariant && <span className="font-normal text-ink-hint"> {cheapestVariant.size}</span>}
        </h3>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {purity && <Badge variant="verified">{purity}</Badge>}
          {isPeptide && <Badge>Third-party tested</Badge>}
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 pt-3">
          <span className="data-figure text-sm font-semibold text-ink">{formatGBP(cheapest)}</span>
          <span className="text-xs text-ink-hint">{stockLabel(stock, product.lowStockThreshold)}</span>
        </div>
      </Link>
      {cheapestVariant && cheapestVariant.stock > 0 && (
        <div className="mt-3">
          <QuickAddButton variantId={cheapestVariant.id} />
        </div>
      )}
    </div>
  )
}
