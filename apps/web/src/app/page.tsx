import Link from 'next/link'
import { ProductCard } from '@/components/ProductCard'
import { fetchProducts } from '@/lib/fetchers'

export default async function HomePage() {
  const products = await fetchProducts()
  const featured = products.slice(0, 8)

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 space-y-16">
      <section className="max-w-2xl">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-accent">
          Research Use Only
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Research peptides, batch-tested and UK-dispatched.
        </h1>
        <p className="mt-4 text-ink-muted">
          Every batch is backed by a Certificate of Analysis. For laboratory research use only,
          not for human or veterinary use.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/shop"
            className="rounded-sm bg-accent px-5 py-2.5 text-sm font-medium text-white no-underline hover:bg-accent-hover"
          >
            Browse the catalogue
          </Link>
          <Link
            href="/quality"
            className="rounded-sm border border-border px-5 py-2.5 text-sm font-medium text-ink no-underline hover:border-accent"
          >
            Our testing process
          </Link>
        </div>
      </section>

      {featured.length > 0 && (
        <section>
          <h2 className="mb-6 text-lg font-semibold text-ink">Featured products</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="rounded-sm border border-border bg-surface p-8">
        <h2 className="mb-4 text-lg font-semibold text-ink">Quality and Certificates of Analysis</h2>
        <p className="max-w-2xl text-sm text-ink-muted">
          Every batch we supply is tested and backed by a Certificate of Analysis, available to
          download from the product page or looked up directly by batch number.
        </p>
        <Link href="/quality" className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-hover">
          Read about our testing process &rarr;
        </Link>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-ink">Why Kineris</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <h3 className="text-sm font-medium text-ink">UK-based</h3>
            <p className="mt-1 text-sm text-ink-muted">Operated and dispatched from the UK.</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-ink">Batch-tested</h3>
            <p className="mt-1 text-sm text-ink-muted">
              Every batch carries its own Certificate of Analysis.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-ink">Fast UK dispatch</h3>
            <p className="mt-1 text-sm text-ink-muted">Tracked shipping on every order.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
