import { COACard } from '@/components/COACard'
import { CoaLookupForm } from '@/components/CoaLookupForm'
import { fetchCoas } from '@/lib/fetchers'

export const metadata = {
  title: 'Lab Testing & Certificates of Analysis | Kineris Labs',
  description: 'Look up a Certificate of Analysis by batch number, or browse recently tested batches.',
}

const FAQ = [
  {
    q: 'What does Research Use Only (RUO) mean?',
    a: 'All products on this site are sold strictly for laboratory research use, not for human or veterinary use. Checkout requires confirming this before an order can be placed.',
  },
  {
    q: 'How do I read a Certificate of Analysis?',
    a: 'A CoA for a Kineris batch shows the batch/lot number, the purity measured by HPLC for that batch, the testing laboratory, and the date it was tested. Download the linked PDF for the full report.',
  },
  {
    q: 'How do I look up a batch?',
    a: 'Enter the batch number printed on your product (e.g. KL-2026-001) into the search box above, or find the current batch for any product on its own product page.',
  },
  {
    q: 'What does "CoA pending" mean?',
    a: 'The batch is on record and assigned, but the testing document for it hasn’t been published to the site yet. Check back, or contact us for the latest status.',
  },
]

export default async function QualityPage({
  searchParams,
}: {
  searchParams: Promise<{ batch?: string }>
}) {
  const { batch } = await searchParams
  const coas = await fetchCoas()

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Lab Testing &amp; Certificates of Analysis</h1>
      <p className="mt-3 max-w-xl text-ink-muted">
        Every batch we supply is independently tested by a third-party laboratory for purity (HPLC) and identity, and
        is assigned its own batch number and Certificate of Analysis. Look up any batch below, or browse the current
        certificates.
      </p>

      <h2 className="mt-10 mb-3 text-lg font-semibold text-ink">Look up a Certificate of Analysis</h2>
      <CoaLookupForm initialBatchNumber={batch} />

      <h2 className="mt-12 mb-4 text-lg font-semibold text-ink">Current CoAs</h2>
      {coas.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {coas.map((c) => (
            <COACard key={c.id} batch={c} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink-hint">No batches published yet.</p>
      )}

      <h2 className="mt-12 mb-4 text-lg font-semibold text-ink">Frequently asked</h2>
      <div className="space-y-3">
        {FAQ.map((item) => (
          <details key={item.q} className="rounded-sm border border-border p-3">
            <summary className="cursor-pointer text-sm font-medium text-ink">{item.q}</summary>
            <p className="mt-2 text-sm text-ink-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
