import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AddToCartForm } from '@/components/AddToCartForm'
import { Badge } from '@/components/Badge'
import { COACard } from '@/components/COACard'
import { ImagePlaceholder } from '@/components/ImagePlaceholder'
import { ProductCard } from '@/components/ProductCard'
import { Tabs } from '@/components/Tabs'
import { TrustIconRow } from '@/components/TrustIconRow'
import { fetchProduct, fetchProducts } from '@/lib/fetchers'
import { formatGBP } from '@/lib/money'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await fetchProduct(slug)
  if (!product) return {}
  const description =
    product.description ?? `${product.name}, batch-tested, for laboratory research use only.`
  return {
    title: `${product.name} | Kineris Labs`,
    description,
    openGraph: { title: product.name, description },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [product, allProducts] = await Promise.all([fetchProduct(slug), fetchProducts()])
  if (!product) notFound()

  const allDataFields: [string, string | null][] = [
    ['CAS number', product.casNumber],
    ['Molecular formula', product.molecularFormula],
    ['Molecular weight', product.molecularWeight],
    ['Form', product.form],
    ['Storage conditions', product.storageConditions],
    ['Current batch', product.currentBatch?.batchNumber ?? null],
  ]
  const dataFields = allDataFields.filter(
    (field): field is [string, string] => field[1] !== null,
  )

  const cheapest = product.variants.reduce(
    (min, v) => (v.priceMinorUnits < min ? v.priceMinorUnits : min),
    product.variants[0]?.priceMinorUnits ?? 0,
  )
  const inStock = product.variants.some((v) => v.stock > 0)
  const purity = product.variants[0]?.purity

  const crossSell = allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.slug,
    description: product.description ?? dataFields.map(([label, value]) => `${label}: ${value}`).join('; '),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'GBP',
      price: (cheapest / 100).toFixed(2),
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <div className="grid gap-10 lg:grid-cols-2">
        <ImagePlaceholder label={product.name} formula={product.molecularFormula} className="aspect-square" />

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{product.name}</h1>
          {product.synonyms.length > 0 && (
            <p className="mt-1 text-sm text-ink-hint">Also known as: {product.synonyms.join(', ')}</p>
          )}
          {product.description && <p className="mt-3 text-sm text-ink-muted">{product.description}</p>}

          <div className="mt-3 flex items-center gap-3">
            <span className="data-figure text-sm text-ink-muted">from {formatGBP(cheapest)}</span>
            {purity && <Badge variant="verified">{purity} purity</Badge>}
          </div>

          <div className="mt-6 sticky bottom-0 z-10 -mx-4 border-t border-border bg-surface px-4 py-4 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
            <AddToCartForm variants={product.variants} />
          </div>

          <div className="mt-6 border-t border-border pt-4">
            <TrustIconRow />
          </div>

          <p className="mt-6 border-t border-border pt-4 text-xs text-ink-hint">
            For laboratory research use only. Not for human or veterinary use.
          </p>
        </div>
      </div>

      <div className="mt-12">
        <Tabs
          items={[
            {
              id: 'coa',
              label: 'Certificate of Analysis',
              content: product.currentBatch ? (
                <COACard batch={product.currentBatch} productName={product.name} />
              ) : (
                <p className="text-sm text-ink-hint">No current batch on record for this product yet.</p>
              ),
            },
            {
              id: 'specs',
              label: 'Specifications',
              content: (
                <dl className="space-y-2 text-sm">
                  {dataFields.map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 border-b border-border pb-2">
                      <dt className="text-ink-muted">{label}</dt>
                      <dd className="data-figure text-right text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
              ),
            },
            {
              id: 'shipping',
              label: 'Shipping & storage',
              content: (
                <div className="space-y-3 text-sm text-ink-muted">
                  {product.storageConditions && <p>{product.storageConditions}</p>}
                  <p>
                    UK addresses only, via Royal Mail Tracked. See the{' '}
                    <a href="/legal/shipping" className="text-accent hover:text-accent-hover">
                      Shipping Policy
                    </a>{' '}
                    for options and pricing.
                  </p>
                </div>
              ),
            },
            {
              id: 'faq',
              label: 'FAQ',
              content: (
                <div className="space-y-3">
                  {[
                    {
                      q: 'What does Research Use Only (RUO) mean?',
                      a: 'This product is sold strictly for laboratory research use, not for human or veterinary use. Checkout requires confirming this before an order can be placed.',
                    },
                    {
                      q: 'Where is the Certificate of Analysis for this batch?',
                      a: 'See the Certificate of Analysis tab above. Every batch can also be looked up directly on the Quality & CoAs page.',
                    },
                    {
                      q: 'What if no CoA is listed yet for this batch?',
                      a: 'The batch is on record but testing documentation hasn’t been published yet. Check back, or contact us.',
                    },
                  ].map((item) => (
                    <details key={item.q} className="rounded-sm border border-border p-3">
                      <summary className="cursor-pointer text-sm font-medium text-ink">{item.q}</summary>
                      <p className="mt-2 text-sm text-ink-muted">{item.a}</p>
                    </details>
                  ))}
                </div>
              ),
            },
          ]}
        />
      </div>

      {crossSell.length > 0 && (
        <div className="mt-12 border-t border-border pt-10">
          <h2 className="mb-6 text-lg font-semibold text-ink">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {crossSell.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
