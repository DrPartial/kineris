import { bundlePriceMinorUnits } from '@kineris/shared'
import { notFound } from 'next/navigation'
import { AddBundleToCartButton } from '@/components/AddBundleToCartButton'
import { fetchBundle } from '@/lib/fetchers'
import { formatGBP } from '@/lib/money'

export default async function BundlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const bundle = await fetchBundle(slug)
  if (!bundle) notFound()

  const priceMinorUnits = bundlePriceMinorUnits(bundle)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex aspect-square items-center justify-center rounded-sm bg-surface-sunken text-sm text-ink-hint">
          Bundle, separate vials
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{bundle.name}</h1>
          <p className="mt-2 text-sm text-ink-muted">
            A set of separate vials, never a pre-mixed blend. Each item ships in its own
            CoA-backed vial.
          </p>

          <dl className="mt-4 space-y-1 text-sm">
            {bundle.components.map((c) => (
              <div key={c.variantId} className="flex justify-between gap-4">
                <dt className="text-ink-muted">
                  {c.quantity} &times; {c.variant.size}
                </dt>
                <dd className="data-figure text-ink">{formatGBP(c.variant.priceMinorUnits * c.quantity)}</dd>
              </div>
            ))}
          </dl>

          <p className="data-figure mt-4 text-2xl font-semibold text-ink">{formatGBP(priceMinorUnits)}</p>
          <p className="mt-1 text-sm text-ink-muted">
            {bundle.availableCount > 0 ? `${bundle.availableCount} available` : 'Out of stock'}
          </p>

          <div className="mt-6">
            <AddBundleToCartButton bundle={bundle} />
          </div>

          <p className="mt-6 border-t border-border pt-4 text-xs text-ink-hint">
            For laboratory research use only. Not for human or veterinary use.
          </p>
        </div>
      </div>
    </div>
  )
}
