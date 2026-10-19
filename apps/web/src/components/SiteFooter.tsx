import Link from 'next/link'
import { SITE_TRUST } from '@/lib/claims'
import { TrustIconRow } from './TrustIconRow'

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
 * RUO statement, legal links." Company details confirmed by Sean (October 2026).
 */
export function SiteFooter() {
  return (
    <>
      {/* Protide-style home-country band just above the footer. */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-10 text-center sm:flex-row sm:justify-center sm:gap-4 sm:text-left">
          <svg viewBox="0 0 60 30" className="h-6 w-12 shrink-0 rounded-[2px] shadow-sm" aria-hidden="true">
            <clipPath id="uk-flag-clip">
              <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
            </clipPath>
            <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
            <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-flag-clip)" stroke="#C8102E" strokeWidth="4" />
            <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
            <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
          </svg>
          <div>
            <p className="font-display text-lg font-semibold text-ink">Proudly based in the UK</p>
            <p className="text-sm text-ink-muted">A UK company with UK stock, dispatched by Royal Mail.</p>
          </div>
        </div>
      </section>
      <footer className="on-dark border-t border-border bg-pine-ink text-ink-muted">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm space-y-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/kineris-logo-dark.svg" alt="Kineris" className="h-9 w-auto" />

          <TrustIconRow items={SITE_TRUST} condensed centered />

          <p className="text-ink font-medium">For laboratory research use only. Not for human or veterinary use.</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="no-underline hover:text-ink">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="space-y-1 text-xs">
            <p>SHPP Ltd, trading as Kineris Labs. Registered in England and Wales, company number 17528699.</p>
            <p>Registered office: Suite 137, 5 High Street, Maidenhead, Berkshire, SL6 1JN, United Kingdom</p>
            <p>
              Contact:{' '}
              <a href="mailto:hello@kinerislabs.com" className="hover:text-ink">
                hello@kinerislabs.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
