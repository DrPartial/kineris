import Link from 'next/link'

const LEGAL_LINKS = [
  { href: '/legal/terms', label: 'Terms & Conditions' },
  { href: '/legal/privacy', label: 'Privacy Policy' },
  { href: '/legal/cookies', label: 'Cookie Policy' },
  { href: '/legal/shipping', label: 'Shipping Policy' },
  { href: '/legal/returns', label: 'Returns Policy' },
]

/**
 * Pack 8's exact footer list: "company name, registration number,
 * registered address, contact email (UK law requires these on the site),
 * RUO statement, legal links." The registration details are placeholders,
 * real company-number/address/email come from Sean/Connor.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface mt-16">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-ink-muted space-y-6">
        <p className="text-ink font-medium">
          For laboratory research use only. Not for human or veterinary use.
        </p>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {LEGAL_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="no-underline hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-1 text-xs">
          <p>Kineris Labs Ltd (placeholder, confirm registered company name)</p>
          <p>Company registration number: [placeholder]</p>
          <p>Registered address: [placeholder, UK]</p>
          <p>
            Contact:{' '}
            <a href="mailto:hello@kinerislabs.com" className="hover:text-ink">
              hello@kinerislabs.com
            </a>{' '}
            (placeholder address)
          </p>
        </div>
      </div>
    </footer>
  )
}
