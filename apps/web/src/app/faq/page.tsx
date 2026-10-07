import Link from 'next/link'
import { FAQ } from '@/lib/faq'

export const metadata = {
  title: 'FAQ | Kineris Labs',
  description: 'Orders, shipping, Certificates of Analysis and RUO, answered.',
}

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Frequently asked questions</h1>

      <dl className="mt-8 space-y-6">
        {FAQ.map((item) => (
          <div key={item.question}>
            <dt className="text-sm font-medium text-ink">{item.question}</dt>
            <dd className="mt-1 text-sm text-ink-muted">{item.answer}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-10 border-t border-border pt-6 text-sm text-ink-muted">
        Can&rsquo;t find what you need?{' '}
        <Link href="/contact" className="text-accent hover:text-accent-hover">
          Contact us
        </Link>
        .
      </p>
    </div>
  )
}
