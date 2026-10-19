import Link from 'next/link'
import { BundleCard } from '@/components/BundleCard'
import { ProductCard } from '@/components/ProductCard'
import { fetchBundles, fetchProducts } from '@/lib/fetchers'

// Neutral, factual categories only (pack section 7: "avoid category names
// that describe effects"). "bundle" isn't a Product.category value (bundles
// are their own entity), so it's handled as a separate filter branch below.
const CATEGORIES = [
  { value: 'all', label: 'All products' },
  { value: 'peptide', label: 'Peptides' },
  { value: 'bundle', label: 'Bundles' },
  { value: 'lab_supply', label: 'Lab supplies' },
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
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Tissue &amp; Repair research peptides</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">
        Every batch independently third-party tested, with a Certificate of Analysis. For laboratory research use only.
      </p>

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
            <BundleCard key={b.id} bundle={b} />
          ))}
          {bundles.length === 0 && <p className="text-sm text-ink-muted">No bundles available right now.</p>}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {category === 'all' && bundles[0] && <BundleCard bundle={bundles.find((b) => b.slug === 'bpc-157-tb-500-bundle') ?? bundles[0]} />}
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
