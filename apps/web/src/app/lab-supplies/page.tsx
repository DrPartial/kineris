import { showOnLabSuppliesPage, type Product } from '@kineris/shared'
import Link from 'next/link'
import { ProductCard } from '@/components/ProductCard'
import { fetchProducts } from '@/lib/fetchers'

export const metadata = {
  title: 'Lab Supplies | Kineris Labs',
  description:
    'Sterile vials, vial storage cases, glassware and consumables for storing and handling research peptides. Dispatched from the UK.',
}

// Modelled on UK Peptides' Lab Supplies page: breadcrumb, short intro, sort, grid, then the RUO notes.
const SORTS = [
  { value: 'default', label: 'Default' },
  { value: 'name-asc', label: 'Name (A - Z)' },
  { value: 'name-desc', label: 'Name (Z - A)' },
  { value: 'price-asc', label: 'Price (Low > High)' },
  { value: 'price-desc', label: 'Price (High > Low)' },
]

const cheapest = (p: Product) => Math.min(...p.variants.map((v) => v.priceMinorUnits))

function sortProducts(products: Product[], sort: string): Product[] {
  const sorted = [...products]
  if (sort === 'name-asc') sorted.sort((a, b) => a.name.localeCompare(b.name))
  if (sort === 'name-desc') sorted.sort((a, b) => b.name.localeCompare(a.name))
  if (sort === 'price-asc') sorted.sort((a, b) => cheapest(a) - cheapest(b))
  if (sort === 'price-desc') sorted.sort((a, b) => cheapest(b) - cheapest(a))
  // 'default' keeps the API's bestseller order.
  return sorted
}

export default async function LabSuppliesPage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const { sort = 'default' } = await searchParams
  const products = sortProducts((await fetchProducts()).filter(showOnLabSuppliesPage), sort)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-hint">
        <Link href="/" className="text-ink-hint no-underline hover:text-ink">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Lab Supplies</span>
      </nav>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">Lab Supplies</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">
        Sterile vials, storage cases, glassware and consumables that make storing and handling research peptides more
        straightforward. Dispatched from the UK with your peptide order. For laboratory research use only.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-y border-border py-3">
        <nav aria-label="Sort by" className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-ink-hint">Sort by:</span>
          {SORTS.map((s) => (
            <Link
              key={s.value}
              href={s.value === 'default' ? '/lab-supplies' : `/lab-supplies?sort=${s.value}`}
              className={`rounded-full border px-3 py-1 no-underline ${
                sort === s.value
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-border text-ink-muted hover:border-accent'
              }`}
            >
              {s.label}
            </Link>
          ))}
        </nav>
        <p className="text-sm text-ink-hint">
          Showing {products.length} {products.length === 1 ? 'product' : 'products'}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {products.length === 0 && (
          <p className="col-span-full text-sm text-ink-muted">No lab supplies available right now.</p>
        )}
      </div>

      <dl className="mt-14 grid gap-6 rounded-lg border border-border bg-surface-sunken p-6 text-sm sm:grid-cols-3">
        <div>
          <dt className="font-semibold text-ink">Research Use Only</dt>
          <dd className="mt-1 text-ink-muted">All products are sold exclusively for in-vitro laboratory research.</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Not medical products</dt>
          <dd className="mt-1 text-ink-muted">
            None of the products on this site are medicines or medical devices, and none are presented as such.
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Returns</dt>
          <dd className="mt-1 text-ink-muted">
            Faulty or damaged items are replaced. See our{' '}
            <Link href="/legal/returns" className="text-accent hover:text-accent-hover">
              returns policy
            </Link>
            .
          </dd>
        </div>
      </dl>
    </div>
  )
}
