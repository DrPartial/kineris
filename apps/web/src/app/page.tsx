import Image from 'next/image'
import Link from 'next/link'
import { BundleCard } from '@/components/BundleCard'
import { COACard } from '@/components/COACard'
import { CoaLookupForm } from '@/components/CoaLookupForm'
import { Reveal } from '@/components/home/Reveal'
import { ProductCard } from '@/components/ProductCard'
import { StatCounter } from '@/components/StatCounter'
import { TrustIconRow } from '@/components/TrustIconRow'
import { WelcomeModalTrigger } from '@/components/WelcomeModalTrigger'
import { FAQ } from '@/lib/faq'
import { fetchBundles, fetchCoas, fetchProducts, fetchStats } from '@/lib/fetchers'

const STEPS = [
  { title: 'Select compounds', body: 'Choose single vials, 5-packs or a bundle. Bundle savings apply automatically.' },
  {
    title: 'Picked from a tested batch',
    body: 'Your order is packed from the current, third-party tested batch, and dispatched the same day if placed by 2.30pm Mon-Fri.',
  },
  {
    title: 'Royal Mail Tracked 24hrs',
    body: 'Next-day tracked delivery, or Special Delivery guaranteed by 1pm. UK addresses only.',
  },
]

const SPECIALIST_POINTS = [
  { title: 'One focused range', body: 'Five tissue and repair research peptides, plus the lab supplies to go with them.' },
  { title: 'Every batch independently tested', body: 'Third-party HPLC testing for purity and identity on every batch we sell.' },
  { title: 'CoAs published', body: 'Each batch’s Certificate of Analysis is on its product page and searchable by batch number.' },
  { title: 'Cold-chain storage, UK stock', body: 'Stored at -20 °C and dispatched from the UK by Royal Mail.' },
]

const eyebrow = 'text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted'
const h2 = 'text-balance font-display text-3xl font-bold leading-[1.08] tracking-[-0.02em] text-ink sm:text-4xl lg:text-5xl'

export default async function HomePage() {
  const [products, bundles, stats, coas] = await Promise.all([fetchProducts(), fetchBundles(), fetchStats(), fetchCoas()])
  const peptides = products.filter((p) => p.category === 'peptide')
  const leadBundle = bundles.find((b) => b.slug === 'bpc-157-tb-500-bundle') ?? bundles[0] ?? null
  const compoundCount = stats?.compoundCount ?? peptides.length

  const statTiles = [
    { value: String(compoundCount), label: 'Specialist compounds' },
    // Only shown once real batch CoAs are uploaded: the average is of tested batch purity, never the spec.
    stats?.avgPurityPercent != null ? { value: `${stats.avgPurityPercent}%`, label: 'Average batch purity (HPLC)' } : null,
    { value: 'Next day', label: 'Delivery', note: 'Order by 2.30pm Mon-Fri' },
  ].filter((t): t is { value: string; label: string; note?: string } => t !== null)

  return (
    <div>
      {/* The reveal animation hides content until it scrolls into view, so without JS show it all. */}
      <noscript>
        <style>{'.reveal{opacity:1!important;transform:none!important}'}</style>
      </noscript>

      {/* Hero: one message (UK specialists, independently tested), proof beside it, one primary action. */}
      <section className="bg-surface-page">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-10 pt-12 lg:grid-cols-[1fr_1.2fr] lg:gap-8 lg:pb-16 lg:pt-16">
          <div className="max-w-xl">
            <p className={`animate-rise flex items-start gap-2.5 tracking-[0.14em] ${eyebrow}`}>
              <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-ember" aria-hidden="true" />
              Independently lab tested &middot; CoA for every batch &middot; Specialists in tissue &amp; repair &middot; UK
              supplier
            </p>
            <h1 className="animate-rise mt-5 text-balance font-display text-4xl font-bold leading-[1.05] tracking-[-0.025em] text-ink [animation-delay:120ms] sm:text-5xl xl:text-[3.5rem]">
              Trusted UK Supplier of Tissue &amp; Repair Research Peptides
            </h1>
            <p className="animate-rise mt-6 max-w-lg text-lg leading-relaxed text-ink-muted [animation-delay:240ms]">
              Specialists in BPC-157, TB-500, GHK-Cu, KPV and SS-31. Every batch is third-party tested for purity and
              identity, with an independent Certificate of Analysis.
            </p>
            <div className="animate-rise mt-8 flex flex-wrap gap-3 [animation-delay:360ms]">
              <Link
                href="/shop"
                className="rounded-sm bg-accent px-6 py-3 text-sm font-semibold text-bone no-underline hover:bg-accent-hover"
              >
                Shop Peptides
              </Link>
              <Link
                href="/quality"
                className="rounded-sm border border-border-strong px-6 py-3 text-sm font-semibold text-ink no-underline hover:border-ink"
              >
                Verify a CoA
              </Link>
            </div>
            <p className="animate-rise mt-6 inline-block rounded-sm bg-surface-sunken px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink [animation-delay:420ms]">
              Research Use Only &middot; Not for human or veterinary use
            </p>
          </div>
          <div className="animate-rise relative aspect-[2200/1180] mix-blend-multiply [animation-delay:200ms]">
            <Image
              src="/home/range-lineup.webp"
              alt="The five Kineris research peptide vials: GHK-Cu 50mg, TB-500 2mg, BPC-157 5mg, KPV 10mg and SS-31 10mg"
              fill
              priority
              sizes="(min-width: 1024px) 600px, 100vw"
              className="object-contain"
            />
          </div>
        </div>
        <div className="border-y border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-5">
            <TrustIconRow centered />
          </div>
        </div>
      </section>

      {statTiles.length > 0 && (
        <section className="bg-surface-page">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
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

      {(products.length > 0 || leadBundle) && (
        <section className="bg-surface-page pb-24 sm:pb-28">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <p className={eyebrow}>The range</p>
                <h2 className={`${h2} mt-3`}>Tissue &amp; repair research peptides, every batch tested.</h2>
              </div>
              <Link href="/shop" className="text-sm font-semibold text-accent no-underline hover:text-accent-hover">
                Shop all &rarr;
              </Link>
            </Reveal>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {leadBundle && (
                <Reveal className="h-full">
                  <BundleCard bundle={leadBundle} />
                </Reveal>
              )}
              {products.map((p, i) => (
                <Reveal key={p.id} delay={((i + 1) % 4) * 80} className="h-full">
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Traceability, with a working batch lookup beside it. */}
      <section className="bg-pine-ink">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:py-24 lg:grid-cols-2">
          <Reveal className="on-dark max-w-md">
            <p className={eyebrow}>Batch &amp; lot tracked</p>
            <h2 className={`${h2} mt-4`}>
              One vial.
              <br />
              One batch.
              <br />
              One record.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-muted">
              Every batch has its own batch number and independent Certificate of Analysis, and every order is packed from
              the current tested batch. Enter the batch number from your vial to see its CoA.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="rounded-lg bg-surface p-6 sm:p-8">
              <p className="font-display text-lg font-semibold text-ink">Look up a batch</p>
              <p className="mb-4 mt-1 text-sm text-ink-muted">Batch number is printed on the vial label and packing slip.</p>
              <CoaLookupForm />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Conga line of proof: the CoA for every product in the range. */}
      <section className="bg-surface-page">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:py-28">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className={eyebrow}>Certificates of Analysis</p>
              <h2 className={`${h2} mt-3`}>Independent results, in the open.</h2>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-muted">
                Every batch is tested by an independent third-party lab for purity and identity. The full report is one
                click from every product.
              </p>
            </div>
            <Link href="/quality" className="text-sm font-semibold text-accent no-underline hover:text-accent-hover">
              Lab Testing &amp; CoA library &rarr;
            </Link>
          </Reveal>
          {coas.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {coas.slice(0, 6).map((c, i) => (
                <Reveal key={c.id} delay={(i % 3) * 80}>
                  <COACard batch={c} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-hint">Batch certificates are being published.</p>
          )}
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:py-28">
          <Reveal>
            <p className={eyebrow}>Why a specialist supplier</p>
            <h2 className={`${h2} mt-3 max-w-2xl`}>Specialists in tissue &amp; repair research peptides.</h2>
          </Reveal>
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {SPECIALIST_POINTS.map((point, i) => (
              <Reveal key={point.title} delay={i * 80}>
                <div className="border-t border-border-strong pt-5">
                  <h3 className="font-display text-lg font-semibold tracking-tight text-ink">{point.title}</h3>
                  <p className="mt-2 text-ink-muted">{point.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-sunken">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:py-28">
          <Reveal>
            <p className={eyebrow}>How it works</p>
            <h2 className={`${h2} mt-3 max-w-xl`}>From catalogue to your lab.</h2>
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

      <section className="bg-surface-page">
        <div className="mx-auto max-w-3xl px-4 py-24 sm:py-28">
          <Reveal>
            <p className={eyebrow}>Questions</p>
            <h2 className={`${h2} mt-3`}>Testing, dispatch and payment.</h2>
          </Reveal>
          <div className="mt-10 space-y-3">
            {FAQ.slice(0, 5).map((item) => (
              <details key={item.question} className="rounded-md border border-border bg-surface p-4">
                <summary className="cursor-pointer text-sm font-medium text-ink">{item.question}</summary>
                <p className="mt-2 text-sm text-ink-muted">{item.answer}</p>
              </details>
            ))}
          </div>
          <Link href="/faq" className="mt-6 inline-block text-sm font-semibold text-accent no-underline hover:text-accent-hover">
            All FAQs &rarr;
          </Link>
        </div>
      </section>

      <section className="bg-surface-page px-4 pb-24 sm:pb-28">
        <Reveal>
          <div className="on-dark mx-auto max-w-6xl rounded-lg bg-pine-ink px-6 py-16 text-center sm:px-12 sm:py-20">
            <h2 className={h2}>10% off your first order</h2>
            <p className="mx-auto mt-5 max-w-md text-lg text-ink-muted">
              Plus batch release and restock alerts. Get a single-use code sent to your email.
            </p>
            <WelcomeModalTrigger className="mt-9 inline-block rounded-sm bg-ember px-7 py-3.5 text-sm font-semibold text-pine-ink hover:opacity-90">
              Get 10% off
            </WelcomeModalTrigger>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
