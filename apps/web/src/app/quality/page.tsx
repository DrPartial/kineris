import { CoaLookupForm } from '@/components/CoaLookupForm'

export default function QualityPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Quality &amp; Certificates of Analysis</h1>

      <div className="mt-6 space-y-4 text-sm text-ink-muted">
        <p>
          Every batch we supply is tested and assigned its own batch number and Certificate of
          Analysis (CoA). The current batch and its CoA are shown on each product page, and any
          batch can be looked up directly below.
        </p>
        <p>
          [Placeholder: whether CoAs are issued by an independent UK/EU testing lab or by the
          supplier is still being decided; this section will state the actual process once
          confirmed, per the project instruction pack.]
        </p>
      </div>

      <h2 className="mt-10 mb-3 text-lg font-semibold text-ink">Look up a Certificate of Analysis</h2>
      <CoaLookupForm />
    </div>
  )
}
