/**
 * Pack 8: "Contact / Support and FAQ (orders, shipping, CoAs, RUO only,
 * never usage)." Every question below is deliberately scoped to those four
 * topics; no entry about reconstitution, dosing or handling after delivery
 * beyond the RUO declaration's own wording.
 */
const FAQ = [
  {
    question: 'How long does dispatch take?',
    answer: '[Placeholder: dispatch cut-off time and lead time to be confirmed by Sean and Connor.]',
  },
  {
    question: 'Which shipping options do you offer?',
    answer: 'UK addresses only at launch, via Royal Mail Tracked options at checkout.',
  },
  {
    question: 'Where is my Certificate of Analysis (CoA)?',
    answer:
      'Every product page shows its current batch and CoA download. You can also look up any batch directly on the Quality & CoAs page.',
  },
  {
    question: 'What does Research Use Only (RUO) mean?',
    answer:
      'All products on this site are sold strictly for laboratory research use, not for human or veterinary use. Checkout requires confirming this before an order can be placed.',
  },
  {
    question: 'What is your returns policy?',
    answer: 'See our Returns Policy for the full terms.',
  },
]

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
