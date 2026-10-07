import { notFound } from 'next/navigation'
import { AddToCartForm } from '@/components/AddToCartForm'
import { fetchProduct } from '@/lib/fetchers'

/**
 * Pack 2.5's exact field list for what a product page shows: name and
 * synonyms, size selector, price, stock message, RUO statement, purity,
 * form, quantity per vial, CAS number, molecular formula and weight,
 * storage conditions, current batch number, CoA download, add to cart.
 * No effect or benefit copy anywhere on this page, by design.
 */
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await fetchProduct(slug)
  if (!product) notFound()

  const dataFields: [string, string | null][] = [
    ['CAS number', product.casNumber],
    ['Molecular formula', product.molecularFormula],
    ['Molecular weight', product.molecularWeight],
    ['Form', product.form],
    ['Storage conditions', product.storageConditions],
    ['Current batch', product.currentBatch?.batchNumber ?? null],
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex aspect-square items-center justify-center rounded-sm bg-surface-sunken text-sm text-ink-hint">
          CoA-backed research grade
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{product.name}</h1>
          {product.synonyms.length > 0 && (
            <p className="mt-1 text-sm text-ink-hint">Also known as: {product.synonyms.join(', ')}</p>
          )}

          <div className="mt-6">
            <AddToCartForm variants={product.variants} />
          </div>

          <dl className="mt-8 space-y-2 border-t border-border pt-6 text-sm">
            {dataFields
              .filter(([, value]) => value !== null)
              .map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-ink-muted">{label}</dt>
                  <dd className="data-figure text-right text-ink">{value}</dd>
                </div>
              ))}
          </dl>

          {product.currentBatch?.coaFileUrl ? (
            <a
              href={product.currentBatch.coaFileUrl}
              className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-hover"
            >
              Download Certificate of Analysis (PDF)
            </a>
          ) : (
            <p className="mt-4 text-sm text-ink-hint">Certificate of Analysis for this batch: available on request.</p>
          )}

          <p className="mt-6 border-t border-border pt-4 text-xs text-ink-hint">
            For laboratory research use only. Not for human or veterinary use.
          </p>
        </div>
      </div>
    </div>
  )
}
