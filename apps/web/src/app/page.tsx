import Image from 'next/image'
import Link from 'next/link'
import { COACard } from '@/components/COACard'
import { HeroVideo } from '@/components/home/HeroVideo'
import { Reveal } from '@/components/home/Reveal'
import { ProductCard } from '@/components/ProductCard'
import { StatCounter } from '@/components/StatCounter'
import { TrustIconRow } from '@/components/TrustIconRow'
import { WelcomeModalTrigger } from '@/components/WelcomeModalTrigger'
import { fetchCoas, fetchProducts, fetchStats } from '@/lib/fetchers'

const STEPS = [
  { title: 'Select compounds', body: 'Choose from the catalogue, by size and quantity.' },
  { title: 'Batch picked & dispatched', body: 'Your order is packed from the current, CoA-backed batch.' },
  { title: 'Tracked delivery', body: 'Royal Mail tracked shipping, UK addresses only.' },
]

const eyebrow = 'text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted'
const h2 = 'text-balance font-display text-3xl font-bold leading-[1.08] tracking-[-0.02em] text-ink sm:text-4xl lg:text-5xl'

export default async function HomePage() {
  const [products, stats, coas] = await Promise.all([fetchProducts(), fetchStats(), fetchCoas()])
  const featured = products.slice(0, 8)
  const latestCoa = coas[0] ?? null
  const compoundCount = stats?.compoundCount ?? products.length

  // "Next working day, guaranteed by 1pm" is two ideas: the headline is the first, the rest is a footnote.
  const [dispatchValue, ...dispatchRest] = (stats?.dispatchLabel ?? '').split(', ')
  const statTiles = [
    { value: String(compoundCount), label: 'Compounds in catalogue' },
    stats?.avgPurityPercent != null ? { value: `${stats.avgPurityPercent}%`, label: 'Avg. purity, current batches' } : null,
    dispatchValue
      ? { value: dispatchValue, label: 'Fastest UK dispatch', note: dispatchRest.join(', ') || undefined }
      : null,
  ].filter((t): t is { value: string; label: string; note?: string } => t !== null)

  return (
    <div>
      {/* The reveal animation hides content until it scrolls into view, so without JS show it all. */}
      <noscript>
        <style>{'.reveal{opacity:1!important;transform:none!important}'}</style>
      </noscript>

      {/* Hero: full-bleed looping footage, headline left, trust strip as a bar along the bottom. */}
      <section className="on-dark relative isolate flex flex-col overflow-hidden bg-pine-ink lg:h-[calc(100svh-108px)] lg:max-h-[900px] lg:min-h-[640px]">
        <HeroVideo />
        <div className="mx-auto flex w-full max-w-6xl flex-1 items-start px-4 pb-10 pt-[372px] lg:items-center lg:pb-0 lg:pt-20">
          <div className="max-w-xl">
            <p className={`animate-rise flex items-start gap-2.5 tracking-[0.14em] sm:tracking-[0.2em] ${eyebrow}`}>
              <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-ember" aria-hidden="true" />
              Batch-tested &middot; CoA on record &middot; UK dispatched
            </p>
            <h1 className="animate-rise mt-5 text-balance font-display text-5xl font-bold leading-[1.02] tracking-[-0.025em] text-ink [animation-delay:120ms] sm:text-6xl lg:text-7xl">
              Every batch,
              <br className="hidden sm:block" /> on record.
            </h1>
            <p className="animate-rise mt-6 max-w-md text-lg leading-relaxed text-ink-muted [animation-delay:240ms]">
              Every product carries its own batch number and Certificate of Analysis, searchable on this site.
            </p>
            <div className="animate-rise mt-9 flex flex-wrap gap-3 [animation-delay:360ms]">
              <Link
                href="/shop"
                className="rounded-sm bg-bone px-6 py-3 text-sm font-semibold text-pine-ink no-underline hover:bg-white"
              >
                Browse the catalogue
              </Link>
              <Link
                href="/quality"
                className="rounded-sm border border-bone/40 px-6 py-3 text-sm font-semibold text-ink no-underline hover:border-bone"
              >
                Verify a CoA
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-border bg-pine-ink/70">
          <div className="mx-auto max-w-6xl px-4 py-5">
            <TrustIconRow centered />
            <p className="mt-3 text-center text-xs text-ink-muted">
              For laboratory research use only, not for human or veterinary use.
            </p>
          </div>
        </div>
      </section>

      {statTiles.length > 0 && (
        <section className="bg-surface-page">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
            <div
              className="grid gap-12 sm:grid-cols-[repeat(var(--cols),minmax(0,1fr))] sm:gap-0 sm:divide-x sm:divide-border"
              style={{ '--cols': statTiles.length } as React.CSSProperties}
            >
              {statTiles.map((tile, i) => (
                <Reveal key={tile.label} delay={i * 100} className="sm:px-8">
                  <StatCounter value={tile.value} label={tile.label} note={tile.note} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="bg-surface-page pb-24 sm:pb-28">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <p className={eyebrow}>The range</p>
                <h2 className={`${h2} mt-3`}>{compoundCount} compounds, each with its own batch record.</h2>
              </div>
              <Link href="/shop" className="text-sm font-semibold text-accent no-underline hover:text-accent-hover">
                Shop all &rarr;
              </Link>
            </Reveal>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {featured.map((p, i) => (
                <Reveal key={p.id} delay={(i % 4) * 80} className="h-full [&>a]:h-full">
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Story 1: traceability, over the label macro. */}
      <section className="on-dark relative isolate overflow-hidden bg-pine-ink">
        <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:absolute lg:inset-0 lg:aspect-auto">
          <Image
            src="/home/macro.webp"
            alt="Close-up of a Kineris vial label, beaded with condensation"
            fill
            sizes="100vw"
            className="object-cover object-[80%_92%]"
          />
        </div>
        <div className="relative mx-auto flex max-w-6xl px-4 py-16 lg:min-h-[760px] lg:items-center lg:py-28">
          <Reveal className="max-w-md">
            <p className={eyebrow}>Batch &amp; lot tracked</p>
            <h2 className={`${h2} mt-4`}>
              One vial.
              <br />
              One batch.
              <br />
              One record.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-muted">
              Every batch we supply is assigned its own batch number, and every order is packed from the current,
              CoA-backed batch.
            </p>
            <Link
              href="/quality"
              className="mt-8 inline-block text-sm font-semibold text-ink underline decoration-bone/40 underline-offset-4 hover:decoration-bone"
            >
              Look up a batch &rarr;
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Story 2: the Certificate of Analysis, beside the lab bench. */}
      <section className="bg-surface-page">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 sm:py-28 lg:grid-cols-2 lg:gap-16">
          <Reveal className="order-2 lg:order-1">
            <p className={eyebrow}>Certificate of Analysis</p>
            <h2 className={`${h2} mt-4`}>Certificates, in the open.</h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-muted">
              Every batch has its own Certificate of Analysis, searchable directly on the Quality page.
            </p>
            <div className="mt-8 max-w-sm">
              {latestCoa ? (
                <COACard batch={latestCoa} />
              ) : (
                <p className="text-sm text-ink-hint">No batches published yet.</p>
              )}
            </div>
            <Link
              href="/quality"
              className="mt-6 inline-block text-sm font-semibold text-accent no-underline hover:text-accent-hover"
            >
              Visit the Quality &amp; CoA library &rarr;
            </Link>
          </Reveal>
          <Reveal className="order-1 lg:order-2" delay={120}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src="/home/lab.webp"
                alt="Two Kineris vials on a steel laboratory bench in front of empty glassware"
                fill
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover object-[72%_center]"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-surface-sunken">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:py-28">
          <Reveal>
            <p className={eyebrow}>How it works</p>
            <h2 className={`${h2} mt-3 max-w-xl`}>From catalogue to your door.</h2>
          </Reveal>
          <ol className="mt-14 grid gap-12 sm:grid-cols-3 sm:gap-10">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 100}>
                <li className="border-t border-border-strong pt-6">
                  <span className="data-figure text-sm font-medium text-accent">0{i + 1}</span>
                  <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-ink">{step.title}</h3>
                  <p className="mt-2 max-w-xs text-ink-muted">{step.body}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-surface-page px-4 py-24 sm:py-28">
        <Reveal>
          <div className="on-dark mx-auto max-w-6xl rounded-lg bg-pine-ink px-6 py-16 text-center sm:px-12 sm:py-20">
            <h2 className={h2}>10% off your first order</h2>
            <p className="mx-auto mt-5 max-w-md text-lg text-ink-muted">Get a single-use code sent to your email.</p>
            <WelcomeModalTrigger className="mt-9 inline-block rounded-sm bg-ember px-7 py-3.5 text-sm font-semibold text-pine-ink hover:opacity-90">
              New here? Get 10% off
            </WelcomeModalTrigger>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
