'use client'

import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useCustomerAuth } from '@/contexts/CustomerAuthContext'
import { useOverlay } from '@/contexts/OverlayContext'

// Nav labels are neutral/factual per pack section 7 ("avoid category names
// that describe effects"), the same rule the product categories follow.
const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/shop?category=bundle', label: 'Bundles' },
  { href: '/quality', label: 'Quality & CoAs' },
  { href: '/faq', label: 'FAQ' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function SiteHeader() {
  const { lines } = useCart()
  const { customer } = useCustomerAuth()
  const { setOpenOverlay } = useOverlay()
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0)

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-6">
        <Link href="/" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/kineris-logo-light.svg" alt="Kineris" className="h-11 w-auto" />
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-ink-muted">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="no-underline hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        {/* Search and Account are hidden below lg -- MobileNav (lg:hidden)
            and the drawer already cover both there, so showing them twice
            would be redundant and, at narrow widths, doesn't fit next to the
            logo and Cart anyway. */}
        <div className="flex items-center gap-4 text-sm">
          <button
            type="button"
            onClick={() => setOpenOverlay('search')}
            aria-label="Search"
            className="hidden text-ink-muted hover:text-ink lg:block"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM21 21l-4.3-4.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {customer && customer !== 'loading' ? (
            <Link href="/account" className="hidden no-underline text-ink-muted hover:text-ink lg:inline-block">
              Account
            </Link>
          ) : (
            <button type="button" onClick={() => setOpenOverlay('account')} className="hidden text-ink-muted hover:text-ink lg:inline-block">
              Account
            </button>
          )}
          <Link href="/cart" className="no-underline text-ink hover:text-accent font-medium">
            Cart{itemCount > 0 ? ` (${itemCount})` : ''}
          </Link>
        </div>
      </div>
    </header>
  )
}
