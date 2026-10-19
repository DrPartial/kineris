import type { Bundle } from '@kineris/shared'
import { bundleDefinition, bundlePriceMinorUnits, bundleSinglesPriceMinorUnits, catalogueEntry } from '@kineris/shared'
import Link from 'next/link'
import { AddBundleToCartButton } from './AddBundleToCartButton'
import { Badge } from './Badge'
import { ProductImage } from './ProductImage'
import { formatGBP } from '@/lib/money'

/** Human contents line, e.g. "5 × BPC-157 5mg + 5 × TB-500 2mg". */
export function bundleContents(bundle: Bundle): string {
  const def = bundleDefinition(bundle.slug)
  if (!def) return bundle.components.map((c) => `${c.quantity} × ${c.variant.size}`).join(' + ')
  return def.components
    .map((c) => `${c.quantity} × ${(catalogueEntry(c.slug)?.name ?? c.slug).replace(/ \(.*\)$/, '')} ${c.size}`)
    .join(' + ')
}

export function BundleCard({ bundle, compact = false }: { bundle: Bundle; compact?: boolean }) {
  const price = bundlePriceMinorUnits(bundle)
  const saving = bundleSinglesPriceMinorUnits(bundle) - price
  const leadSlug = bundleDefinition(bundle.slug)?.components[0]?.slug

  return (
    <div className="flex h-full flex-col rounded-md border border-accent bg-surface p-4">
      <Link href={`/bundles/${bundle.slug}`} className="flex flex-1 flex-col no-underline">
        {leadSlug ? (
          <ProductImage
            slug={leadSlug}
            name={bundle.name}
            bordered={false}
            sizes="(min-width: 1024px) 240px, 50vw"
            className="mb-3 aspect-square"
          />
        ) : (
          <div className="mb-3 flex aspect-square items-center justify-center rounded-sm bg-surface-sunken text-xs text-ink-hint">
            Bundle, separate vials
          </div>
        )}
        <h3 className="text-sm font-medium text-ink">{bundle.name}</h3>
        {!compact && <p className="mt-1 text-xs text-ink-hint">{bundleContents(bundle)}</p>}
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {saving > 0 && <Badge variant="verified">Save {formatGBP(saving)}</Badge>}
          <Badge>Separate vials</Badge>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 pt-3">
          <span className="data-figure text-sm font-semibold text-ink">{formatGBP(price)}</span>
          <span className="text-xs text-ink-hint">{bundle.availableCount > 0 ? 'In stock' : 'Out of stock'}</span>
        </div>
      </Link>
      <div className="mt-3">
        <AddBundleToCartButton
          bundle={bundle}
          label="Quick add"
          className="w-full rounded-sm bg-accent px-3 py-2 text-xs font-semibold text-bone hover:bg-accent-hover"
        />
      </div>
    </div>
  )
}
