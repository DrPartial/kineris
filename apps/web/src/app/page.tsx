import Link from 'next/link'
import { Badge } from '@/components/Badge'
import { COACard } from '@/components/COACard'
import { ImagePlaceholder } from '@/components/ImagePlaceholder'
import { ProductCard } from '@/components/ProductCard'
import { StatCounter } from '@/components/StatCounter'
import { TrustIconRow } from '@/components/TrustIconRow'
import { WelcomeModalTrigger } from '@/components/WelcomeModalTrigger'
import { fetchCoas, fetchProducts, fetchStats } from '@/lib/fetchers'

export default async function HomePage() {
  const [products, stats, coas] = await Promise.all([fetchProducts(), fetchStats(), fetchCoas()])
  const featured = products.slice(0, 8)
  const latestCoa = coas[0] ?? null

  const statTiles = [
    { value: String(stats?.compoundCount ?? products.length), label: 'Compounds in catalogue' },
    stats?.avgPurityPercent != null ? { value: `${stats.avgPurityPercent}%`, label: 'Avg. purity, current batches' } : null,
    stats?.dispatchLabel ? { value: stats.dispatchLabel, label: 'Fastest UK dispatch' } : null,
  ].filter((t): t is { value: string; label: string } => t !== null)

  return (
    <div>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-2 lg:items-center">
          <div>
            <Badge>Batch-tested &middot; CoA on record &middot; UK dispatched</Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Research peptides, tracked from batch to your door.
            </h1>
            <p className="mt-4 max-w-xl text-ink-muted">
              Every product carries its own batch number and Certificate of Analysis, searchable
              on this site. For laboratory research use only, not for human or veterinary use.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-sm bg-accent px-5 py-2.5 text-sm font-medium text-bone no-underline hover:bg-accent-hover"
              >
                Browse the catalogue
              </Link>
              <Link
                href="/quality"
                className="rounded-sm border border-border px-5 py-2.5 text-sm font-medium text-ink no-underline hover:border-accent"
              >
                Verify a CoA
              </Link>
            </div>
          </div>
          <ImagePlaceholder label="Kineris Labs" className="aspect-[4/3] lg:aspect-square" />
        </div>
      </section>

      <section className="border-b border-border bg-surface-page">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <TrustIconRow />
        </div>
      </section>

      {statTiles.length > 0 && (
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-6xl grid-cols-1 justify-items-center gap-8 px-4 py-10 sm:grid-cols-3">
            {statTiles.map((tile) => (
              <StatCounter key={tile.label} value={tile.value} label={tile.label} />
            ))}
          </div>
        </section>
      )}

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-16">
        <section>
          <h2 className="mb-6 text-lg font-semibold text-ink">How it works</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { step: '1', title: 'Select compounds', body: 'Choose from the catalogue, by size and quantity.' },
              { step: '2', title: 'Batch picked & dispatched', body: 'Your order is packed from the current, CoA-backed batch.' },
              { step: '3', title: 'Tracked delivery', body: 'Royal Mail tracked shipping, UK addresses only.' },
            ].map((item) => (
              <div key={item.step} className="rounded-md border border-border bg-surface p-5">
                <span className="data-figure text-xs font-medium text-accent">Step {item.step}</span>
                <h3 className="mt-1 text-sm font-medium text-ink">{item.title}</h3>
                <p className="mt-1 text-sm text-ink-muted">{item.body}</p>
              </div>
            ))}
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

        <section className="rounded-md border border-border bg-surface p-8">
          <h2 className="mb-2 text-lg font-semibold text-ink">Quality and Certificates of Analysis</h2>
          <p className="max-w-2xl text-sm text-ink-muted">
            Every batch we supply is assigned its own batch number and Certificate of Analysis,
            searchable directly on the Quality page.
          </p>
          <div className="mt-6 max-w-sm">
            {latestCoa ? (
              <COACard batch={latestCoa} />
            ) : (
              <p className="text-sm text-ink-hint">No batches published yet.</p>
            )}
          </div>
          <Link href="/quality" className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-hover">
            Visit the Quality &amp; CoA library &rarr;
          </Link>
        </section>

        <section className="rounded-md border border-border bg-surface p-8 text-center">
          <h2 className="text-lg font-semibold text-ink">10% off your first order</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">
            Get a single-use code sent to your email.
          </p>
          <WelcomeModalTrigger className="mt-4 inline-block rounded-sm bg-ember px-5 py-2.5 text-sm font-medium text-pine-ink hover:opacity-90">
            New here? Get 10% off
          </WelcomeModalTrigger>
        </section>
      </div>
    </div>
  )
}
