import Link from 'next/link'
import { ProductCard } from '@/components/ProductCard'
import { fetchBundles, fetchProducts } from '@/lib/fetchers'

// Neutral, factual categories only (pack section 7: "avoid category names
// that describe effects"). "bundle" isn't a Product.category value (bundles
// are their own entity), so it's handled as a separate filter branch below.
const CATEGORIES = [
  { value: 'all', label: 'All products' },
  { value: 'peptide', label: 'Peptides' },
  { value: 'bundle', label: 'Bundles' },
  { value: 'lab-supply', label: 'Lab supplies' },
]

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category = 'all' } = await searchParams
  const [products, bundles] = await Promise.all([fetchProducts(), fetchBundles()])

  const filteredProducts =
    category === 'all'
      ? products
      : category === 'bundle'
        ? []
        : products.filter((p) => p.category === category)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Shop</h1>

      <nav className="mt-6 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <Link
            key={c.value}
            href={c.value === 'all' ? '/shop' : `/shop?category=${c.value}`}
            className={`rounded-full border px-4 py-1.5 text-sm no-underline ${
              category === c.value
                ? 'border-accent bg-accent-soft text-accent'
                : 'border-border text-ink-muted hover:border-accent'
            }`}
          >
            {c.label}
          </Link>
        ))}
      </nav>

      {category === 'bundle' ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {bundles.map((b) => (
            <Link
              key={b.id}
              href={`/bundles/${b.slug}`}
              className="rounded-sm border border-border bg-surface p-4 no-underline hover:border-accent"
            >
              <div className="mb-3 flex aspect-square items-center justify-center rounded-sm bg-surface-sunken text-xs text-ink-hint">
                Bundle
              </div>
              <h3 className="text-sm font-medium text-ink">{b.name}</h3>
              <p className="mt-1 text-xs text-ink-hint">
                {b.availableCount > 0 ? `${b.availableCount} available` : 'Out of stock'}
              </p>
            </Link>
          ))}
          {bundles.length === 0 && <p className="text-sm text-ink-muted">No bundles available right now.</p>}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {filteredProducts.length === 0 && (
            <p className="col-span-full text-sm text-ink-muted">No products in this category yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
