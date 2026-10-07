'use client'

import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'

// Nav labels are neutral/factual per pack section 7 ("avoid category names
// that describe effects"), the same rule the product categories follow.
const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/shop?category=bundle', label: 'Bundles' },
  { href: '/quality', label: 'Quality & CoAs' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function SiteHeader() {
  const { lines } = useCart()
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0)

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-6">
        {/* Logo deferred (Harvey's own call) -- wordmark placeholder until then. */}
        <Link href="/" className="font-semibold tracking-tight text-lg text-ink no-underline">
          Kineris Labs
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-ink-muted">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="no-underline hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/account" className="no-underline text-ink-muted hover:text-ink">
            Account
          </Link>
          <Link href="/cart" className="no-underline text-ink hover:text-accent font-medium">
            Cart{itemCount > 0 ? ` (${itemCount})` : ''}
          </Link>
        </div>
      </div>
    </header>
  )
}
