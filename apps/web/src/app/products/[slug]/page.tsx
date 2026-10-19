import { BUNDLES, bundleSinglesTotalMinorUnits, catalogueEntry } from '@kineris/shared'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AddToCartForm, type PackOption } from '@/components/AddToCartForm'
import { Badge } from '@/components/Badge'
import { COACard } from '@/components/COACard'
import { DispatchCountdown } from '@/components/DispatchCountdown'
import { ProductCard } from '@/components/ProductCard'
import { Tabs } from '@/components/Tabs'
import { TrustIconRow } from '@/components/TrustIconRow'
import { ProductHeroImage, VariantSelectionProvider } from '@/components/VariantSelection'
import { fetchProduct, fetchProducts } from '@/lib/fetchers'
import { formatGBP } from '@/lib/money'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await fetchProduct(slug)
  if (!product) return {}
  const description =
    product.description ?? `${product.name}, third-party tested, for laboratory research use only.`
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

  const entry = catalogueEntry(product.slug)
  const allDataFields: [string, string | null][] = [
    ['Research area', entry?.researchArea ?? null],
    ['CAS number', product.casNumber],
    ['Molecular formula', product.molecularFormula],
    ['Molecular weight', product.molecularWeight],
    ['Sequence', entry?.specs.sequence ?? null],
    ['Appearance', product.form],
    ['Purity (specification)', product.variants[0]?.purity ?? null],
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
  // The tested figure from the current batch CoA when there is one, otherwise the general spec.
  const batchPurity = product.currentBatch?.purity ?? null
  const purity = batchPurity ?? product.variants[0]?.purity
  const isPeptide = product.category === 'peptide'

  // Packs of this one vial (5-packs) go in the pack selector; mixed bundles that include it are linked below it.
  const firstSize = product.variants[0]?.size
  const packs: PackOption[] = BUNDLES.filter(
    (b) => b.components.length === 1 && b.components[0]!.slug === product.slug && b.components[0]!.size === firstSize,
  ).map((b) => ({
    id: b.slug,
    label: `${b.components[0]!.quantity}-pack`,
    quantity: b.components[0]!.quantity,
    priceMinorUnits: b.priceMinorUnits,
    savingMinorUnits: bundleSinglesTotalMinorUnits(b) - b.priceMinorUnits,
  }))
  const mixedBundles = BUNDLES.filter((b) => b.components.length > 1 && b.components.some((c) => c.slug === product.slug))

  const crossSell = allProducts.filter((p) => p.id !== product.id).slice(0, 4)

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

      <VariantSelectionProvider variants={product.variants}>
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductHeroImage
          slug={product.slug}
          name={product.name}
          formula={product.molecularFormula}
          variants={product.variants}
        />

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {product.name}
            {firstSize && <span className="font-normal text-ink-muted"> {firstSize}</span>}
          </h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent">Research Use Only</p>
          {product.synonyms.length > 0 && (
            <p className="mt-1 text-sm text-ink-hint">Also known as: {product.synonyms.join(', ')}</p>
          )}

          {purity && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="verified">
                {purity} purity{isPeptide ? (batchPurity ? ', third-party HPLC tested' : ' specification') : ''}
              </Badge>
              {isPeptide && (
                <a href="#product-tabs" className="text-sm font-medium text-accent hover:text-accent-hover">
                  View CoA
                </a>
              )}
            </div>
          )}

          <div className="mt-6 sticky bottom-0 z-10 -mx-4 border-t border-border bg-surface px-4 py-4 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
            <AddToCartForm variants={product.variants} packs={packs} lowStockThreshold={product.lowStockThreshold} />
          </div>
          <DispatchCountdown className="mt-3 text-sm text-ink-muted" />

          {mixedBundles.length > 0 && (
            <ul className="mt-4 space-y-1 text-sm">
              {mixedBundles.map((b) => (
                <li key={b.slug}>
                  <Link href={`/bundles/${b.slug}`} className="text-accent no-underline hover:text-accent-hover">
                    Also in the {b.name}, {formatGBP(b.priceMinorUnits)} (save{' '}
                    {formatGBP(bundleSinglesTotalMinorUnits(b) - b.priceMinorUnits)}) &rarr;
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 border-t border-border pt-4">
            <TrustIconRow
              items={[
                ...(isPeptide ? [{ icon: 'check' as const, label: 'Independently third-party tested' }] : []),
                { icon: 'truck', label: 'Dispatched from the UK' },
                { icon: 'batch', label: 'Free tracked delivery over £100' },
              ]}
            />
          </div>

          <p className="mt-6 border-t border-border pt-4 text-xs text-ink-hint">
            For laboratory research use only. Not for human or veterinary use.
          </p>
        </div>
      </div>
      </VariantSelectionProvider>

      <div id="product-tabs" className="mt-12 scroll-mt-28">
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
              id: 'description',
              label: 'Description',
              content: <p className="max-w-2xl text-sm text-ink-muted">{product.description}</p>,
            },
            {
              id: 'shipping',
              label: 'Shipping & storage',
              content: (
                <div className="space-y-3 text-sm text-ink-muted">
                  {product.storageConditions && <p>{product.storageConditions}</p>}
                  <p>
                    UK addresses only, via Royal Mail: Tracked 48 £3.95 (free over £100), Tracked 24 £4.95, or Special
                    Delivery guaranteed by 1pm £10.95. Orders placed by 2.30pm Monday to Friday are dispatched the same
                    day. See the{' '}
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
                      a: 'See the Certificate of Analysis tab above. Every batch can also be looked up directly on the Lab Testing & CoAs page.',
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

      <div className="mt-10 rounded-md border border-border bg-surface-sunken p-4 text-sm text-ink">
        <p className="font-semibold">Research Use Only</p>
        <p className="mt-1 text-ink-muted">
          This product is supplied for in-vitro laboratory research only. It is not a medicine, food, supplement or
          cosmetic, and is not for human or veterinary use of any kind. By ordering you confirm it will be used only by
          suitably qualified people in a lawful research setting.
        </p>
      </div>

      {crossSell.length > 0 && (
        <div className="mt-12 border-t border-border pt-10">
          <h2 className="mb-6 text-lg font-semibold text-ink">Also in the range</h2>
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
