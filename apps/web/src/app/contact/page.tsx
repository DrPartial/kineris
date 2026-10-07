import { FAQ } from '@/lib/faq'

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Contact &amp; FAQ</h1>

      <p className="mt-4 text-sm text-ink-muted">
        For order, shipping or CoA queries, email{' '}
        <a href="mailto:support@kinerislabs.com" className="text-accent hover:text-accent-hover">
          support@kinerislabs.com
        </a>{' '}
        (placeholder address).
      </p>

      <dl className="mt-10 space-y-6">
        {FAQ.map((item) => (
          <div key={item.question}>
            <dt className="text-sm font-medium text-ink">{item.question}</dt>
            <dd className="mt-1 text-sm text-ink-muted">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
