import { bundleDefinition, bundlePriceMinorUnits, bundleSinglesPriceMinorUnits } from '@kineris/shared'
import { notFound } from 'next/navigation'
import { AddBundleToCartButton } from '@/components/AddBundleToCartButton'
import { bundleContents } from '@/components/BundleCard'
import { DispatchCountdown } from '@/components/DispatchCountdown'
import { ProductImage } from '@/components/ProductImage'
import { TrustIconRow } from '@/components/TrustIconRow'
import { fetchBundle } from '@/lib/fetchers'
import { formatGBP } from '@/lib/money'

export default async function BundlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const bundle = await fetchBundle(slug)
  if (!bundle) notFound()

  const priceMinorUnits = bundlePriceMinorUnits(bundle)
  const singles = bundleSinglesPriceMinorUnits(bundle)
  const leadSlug = bundleDefinition(bundle.slug)?.components[0]?.slug

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        {leadSlug ? (
          <ProductImage slug={leadSlug} name={bundle.name} className="aspect-square" priority sizes="(min-width: 1024px) 480px, 100vw" />
        ) : (
          <div className="flex aspect-square items-center justify-center rounded-sm bg-surface-sunken text-sm text-ink-hint">
            Bundle, separate vials
          </div>
        )}

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{bundle.name}</h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent">Research Use Only</p>
          <p className="mt-3 text-sm text-ink">{bundleContents(bundle)}</p>
          <p className="mt-2 text-sm text-ink-muted">
            Separate vials in one order, never a pre-mixed blend. Each vial is from a third-party tested batch with its
            own Certificate of Analysis.
          </p>

          <div className="mt-5 flex items-baseline gap-3">
            <p className="data-figure text-2xl font-semibold text-ink">{formatGBP(priceMinorUnits)}</p>
            {singles > priceMinorUnits && (
              <>
                <p className="data-figure text-sm text-ink-hint line-through">{formatGBP(singles)}</p>
                <p className="text-sm font-medium text-accent">Save {formatGBP(singles - priceMinorUnits)}</p>
              </>
            )}
          </div>
          <p className="mt-1 text-sm text-ink-muted">{bundle.availableCount > 0 ? 'In stock' : 'Out of stock'}</p>

          <div className="mt-6">
            <AddBundleToCartButton bundle={bundle} />
          </div>
          <DispatchCountdown className="mt-3 text-sm text-ink-muted" />

          <div className="mt-6 border-t border-border pt-4">
            <TrustIconRow />
          </div>

          <p className="mt-6 border-t border-border pt-4 text-xs text-ink-hint">
            For laboratory research use only. Not for human or veterinary use.
          </p>
        </div>
      </div>
    </div>
  )
}
