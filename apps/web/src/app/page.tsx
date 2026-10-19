import Image from 'next/image'
import Link from 'next/link'
import { BundleCard } from '@/components/BundleCard'
import { LabListSignup } from '@/components/home/LabListSignup'
import { Reveal } from '@/components/home/Reveal'
import { ProductCard } from '@/components/ProductCard'
import { StatCounter } from '@/components/StatCounter'
import { TrustIconRow } from '@/components/TrustIconRow'
import { PURITY_CLAIM, SITE_TRUST } from '@/lib/claims'
import { FAQ } from '@/lib/faq'
import { fetchBundles, fetchProducts, fetchStats } from '@/lib/fetchers'

// Protide-style proof cards. No manufacturing certification is claimed: we have no evidence of one.
const PROOF_CARDS = [
  {
    title: 'Third-party HPLC-MS verified',
    body: 'Every batch is third-party tested to confirm purity and molecular identity through documented laboratory analysis.',
  },
  {
    title: 'Batch tracked',
    body: 'Every vial carries a batch number linked to its Certificate of Analysis, so you can check exactly what you received.',
  },
  {
    title: 'Fast UK shipping & support',
    body: 'Order by 2.30pm Mon-Fri for same-day dispatch by Royal Mail. Our UK team is ready to help with any procurement questions.',
  },
]

const CLOSING_STRIP = [
  {
    title: 'Free UK delivery',
    body: 'Free tracked delivery on orders over £100.',
    icon: 'M3 7h11v9H3zM14 11h4l3 3v2h-7zM6.5 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM17.5 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  },
  {
    title: 'Ships from the UK',
    body: 'Royal Mail tracked, next day available.',
    icon: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21ZM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  },
  {
    title: 'HPLC-verified purity',
    body: 'Every batch is independently third-party tested.',
    icon: 'M8 12l3 3 5-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  },
  {
    title: 'Secure checkout',
    body: 'Encrypted checkout with guest or account ordering.',
    icon: 'M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3Z',
  },
]

const USPS = [
  `HPLC-MS tested for ${PURITY_CLAIM} purity and molecular identity`,
  'Secure packaging with tracked Royal Mail delivery, next day available',
  'Certificates of Analysis published for every batch',
  'UK-based team backing every order with dedicated support',
  'Free tracked UK delivery on orders over £100',
  'Every vial batch-numbered and traceable to its CoA',
]

const STEPS = [
  {
    title: 'Select Your Compounds',
    body: 'Choose from a range of specialised tissue and repair research peptides, each third-party tested with publicly documented CoAs. Buy in bundles for the best value.',
  },
  {
    title: 'Packed & Shipped From UK',
    body: 'Orders are packed and shipped from our UK facility with full dispatch-to-delivery tracking.',
  },
  {
    title: 'Next Day Delivery',
    body: 'Order before 2.30pm for next day delivery. Or standard 2-3 business day delivery in insulated, protective packaging for guaranteed quality.',
  },
]

const SPECIALIST_POINTS = [
  {
    title: 'One focused range',
    body: 'Five tissue and repair research peptides, plus the lab supplies to go with them.',
  },
  {
    title: 'Every batch independently tested',
    body: 'Third-party HPLC testing for purity and identity on every batch we sell.',
  },
  {
    title: 'CoAs published',
    body: 'Each batch’s Certificate of Analysis is on its product page and searchable by batch number.',
  },
  {
    title: 'Cold-chain storage, UK stock',
    body: 'Stored at -20 °C and dispatched from the UK by Royal Mail.',
  },
]

const eyebrow = 'text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted'
const h2 =
  'text-balance font-display text-3xl font-bold leading-[1.08] tracking-[-0.02em] text-ink sm:text-4xl lg:text-5xl'

export default async function HomePage() {
  const [products, bundles, stats] = await Promise.all([fetchProducts(), fetchBundles(), fetchStats()])
  const peptides = products.filter((p) => p.category === 'peptide')
  const leadBundle = bundles.find((b) => b.slug === 'bpc-157-tb-500-bundle') ?? bundles[0] ?? null
  const compoundCount = stats?.compoundCount ?? peptides.length

  const statTiles = [
    { value: 'Repair Specialists', label: `${compoundCount} high-quality tissue & repair compounds` },
    // Only shown once real batch CoAs are uploaded: the average is of tested batch purity, never the spec.
    stats?.avgPurityPercent != null
      ? {
          value: `${stats.avgPurityPercent}%`,
          label: 'Average batch purity (HPLC)',
        }
      : null,
    { value: 'UK Supplier', label: 'Lab tested and shipped from the UK' },
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
            {/* Protide-style proof pill: the three facts a researcher checks first, before the headline. */}
            <p className="animate-rise inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent-soft px-3.5 py-1.5 text-xs font-semibold text-accent">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ember" aria-hidden="true" />
              {PURITY_CLAIM} purity &middot; Tissue &amp; repair specialists &middot; UK supplier &middot; Next day
              delivery
            </p>
            <h1 className="animate-rise mt-5 text-balance font-display text-4xl font-bold leading-[1.05] tracking-[-0.025em] text-ink [animation-delay:120ms] sm:text-5xl xl:text-[3.5rem]">
              Trusted <span className="text-accent">UK Supplier</span> of Tissue &amp; Repair Research{' '}
              <span className="text-accent">Peptides</span>
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
                Shop Peptides &rarr;
              </Link>
              <Link
                href="/quality"
                className="rounded-sm border border-border-strong px-6 py-3 text-sm font-semibold text-ink no-underline hover:border-ink"
              >
                Verify a CoA &rarr;
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
            <TrustIconRow items={SITE_TRUST} centered />
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

      {/* Protide-style proof block: a search-friendly headline, the testing method, and three proof cards. */}
      <section className="bg-surface-page">
        <div className="on-dark bg-pine-ink">
          <Reveal className="mx-auto max-w-4xl px-4 pb-36 pt-20 text-center sm:pb-40 sm:pt-24">
            <h2 className={h2}>Buy Research Peptides in the UK: Verified {PURITY_CLAIM} Purity &amp; Identity</h2>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-ink-muted">
              Kineris Labs is a UK specialist supplier of tissue and repair research peptides. Every compound is clearly
              labelled and third-party tested by an independent analytical laboratory using High-Performance Liquid
              Chromatography (HPLC) and Mass Spectrometry to confirm purity and molecular identity. Batch-specific
              Certificates of Analysis are published for every compound.
            </p>
          </Reveal>
        </div>
        <div className="mx-auto -mt-24 grid max-w-6xl gap-5 px-4 pb-20 sm:pb-24 md:grid-cols-3">
          {PROOF_CARDS.map((card, i) => (
            <Reveal key={card.title} delay={i * 80} className="h-full">
              <div className="h-full rounded-lg border border-border bg-surface p-8 text-center shadow-sm">
                <h3 className="font-display text-xl font-semibold tracking-tight text-ink">{card.title}</h3>
                <p className="mt-4 leading-relaxed text-ink-muted">{card.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {(products.length > 0 || leadBundle) && (
        <section className="bg-surface-page pb-24 sm:pb-28">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <p className={eyebrow}>The range</p>
                <h2 className={`${h2} mt-3`}>Lab-Tested Tissue &amp; Repair Research Peptides</h2>
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

      {/* Key USPs: one statement, six checkable reasons. */}
      <section className="bg-surface-page">
        <div className="mx-auto max-w-6xl px-4 pb-24 sm:pb-28">
          <Reveal>
            <div className="on-dark rounded-lg bg-pine-ink px-6 py-12 sm:px-12 sm:py-16">
              <h2 className={`${h2} max-w-2xl`}>
                Tested, verified and shipped so your research is the only variable that matters.
              </h2>
            </div>
          </Reveal>
          <ul className="mt-10 grid gap-x-12 gap-y-6 sm:grid-cols-2">
            {USPS.map((usp, i) => (
              <Reveal key={usp} delay={(i % 2) * 80}>
                <li className="flex items-start gap-4 text-lg text-ink">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-1 shrink-0 text-accent"
                    aria-hidden="true"
                  >
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                  {usp}
                </li>
              </Reveal>
            ))}
          </ul>
          <Link
            href="/quality"
            className="mt-10 inline-block text-sm font-semibold text-accent no-underline hover:text-accent-hover"
          >
            Lab Testing &amp; CoA library &rarr;
          </Link>
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

      {/* How it works, Protide-style: a centred heading over three soft cards. */}
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:py-28">
          <Reveal>
            <h2 className={`${h2} text-center`}>How It Works</h2>
          </Reveal>
          <ol className="mt-14 grid gap-5 md:grid-cols-3 md:gap-8">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 100} className="h-full">
                <li className="h-full rounded-lg bg-surface-sunken px-8 py-10 text-center">
                  <h3 className="text-balance font-display text-2xl font-semibold tracking-tight text-ink">{step.title}</h3>
                  <p className="mt-4 leading-relaxed text-ink-muted">{step.body}</p>
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
          <Link
            href="/faq"
            className="mt-6 inline-block text-sm font-semibold text-accent no-underline hover:text-accent-hover"
          >
            All FAQs &rarr;
          </Link>
        </div>
      </section>

      <section className="bg-surface-page px-4 pb-24 sm:pb-28">
        <Reveal>
          <div className="on-dark mx-auto grid max-w-6xl items-center gap-10 rounded-lg bg-pine-ink px-6 py-16 sm:px-12 sm:py-20 lg:grid-cols-2">
            <div>
              <p className={`flex items-center gap-2.5 ${eyebrow}`}>
                <span className="h-2 w-2 rotate-45 bg-ember" aria-hidden="true" />
                Research updates
              </p>
              <h2 className={`${h2} mt-4`}>Join the lab list.</h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-muted">
                Join the lab list for batch releases and restock alerts. New subscribers get 10% off their first order.
              </p>
            </div>
            <LabListSignup />
          </div>
        </Reveal>
      </section>

      {/* Explicit research-use notice, as Protide carries: compliance stated plainly, not hidden in the footer. */}
      <section className="bg-surface-sunken">
        <Reveal className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-20">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Research Use Only Notice
          </h2>
          <p className="mt-5 leading-relaxed text-ink-muted">
            Kineris Labs is a specialist supplier of analytical-grade research peptides for in vitro laboratory
            research. All products are supplied for laboratory research only and are not for human or animal
            consumption, medical use, veterinary use, or any therapeutic, diagnostic or clinical purpose. Please review
            our{' '}
            <Link href="/legal/terms" className="text-accent">
              Terms &amp; Conditions
            </Link>{' '}
            before purchasing.
          </p>
        </Reveal>
      </section>

      {/* Closing value strip: the offer, the origin, the proof and the checkout, one line each. */}
      <section className="border-t border-border bg-surface">
        <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-14 text-center lg:grid-cols-4">
          {CLOSING_STRIP.map((item) => (
            <li key={item.title}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto text-accent"
                aria-hidden="true"
              >
                <path d={item.icon} />
              </svg>
              <p className="mt-4 font-display text-lg font-semibold text-ink">{item.title}</p>
              <p className="mt-1 text-sm text-ink-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
