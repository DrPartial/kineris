'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Modal } from './Modal'
import { useCustomerAuth } from '@/contexts/CustomerAuthContext'
import { useOverlay } from '@/contexts/OverlayContext'

const PRIMARY_LINKS = [
  { href: '/shop?category=peptide', label: 'Peptides' },
  { href: '/shop?category=bundle', label: 'Bundles' },
  { href: '/shop?category=lab-supply', label: 'Lab Supplies' },
  { href: '/quality', label: 'Quality & CoAs' },
]

const SECONDARY_LINKS = [
  { href: '/faq', label: 'FAQ' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

const LEGAL_LINKS = [
  { href: '/legal/terms', label: 'Terms & Conditions' },
  { href: '/legal/privacy', label: 'Privacy Policy' },
  { href: '/legal/cookies', label: 'Cookie Policy' },
  { href: '/legal/shipping', label: 'Shipping Policy' },
  { href: '/legal/returns', label: 'Returns Policy' },
]

export function NavDrawer() {
  const { openOverlay, setOpenOverlay } = useOverlay()
  const { customer, signOut } = useCustomerAuth()
  const [legalOpen, setLegalOpen] = useState(false)
  const open = openOverlay === 'drawer'

  function close() {
    setOpenOverlay(null)
  }

  return (
    <Modal open={open} onClose={close} label="Menu" align="left">
      <div className="flex h-full w-[min(85vw,22rem)] flex-col bg-surface">
        <div className="flex items-center justify-between border-b border-border p-4">
          <span className="font-display text-base font-semibold text-ink">Menu</span>
          <button type="button" onClick={close} aria-label="Close menu" className="text-ink-hint hover:text-ink">
            &times;
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 text-sm">
          <ul className="space-y-1">
            {PRIMARY_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={close} className="block rounded-sm px-2 py-2 text-ink no-underline hover:bg-surface-sunken">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <ul className="mt-4 space-y-1 border-t border-border pt-4">
            {SECONDARY_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={close} className="block rounded-sm px-2 py-2 text-ink-muted no-underline hover:bg-surface-sunken">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setLegalOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-sm px-2 py-2 text-ink-muted hover:bg-surface-sunken"
            >
              Legal
              <span aria-hidden="true">{legalOpen ? '−' : '+'}</span>
            </button>
            {legalOpen && (
              <ul className="mt-1 space-y-1 pl-4">
                {LEGAL_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} onClick={close} className="block rounded-sm px-2 py-1.5 text-xs text-ink-hint no-underline hover:text-ink">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="mt-4 border-t border-border pt-4 text-xs text-ink-hint">
            For laboratory research use only. Not for human or veterinary use.
          </p>
        </nav>

        <div className="border-t border-border p-4">
          {customer === 'loading' ? null : customer ? (
            <div className="flex gap-2">
              <Link
                href="/account"
                onClick={close}
                className="flex-1 rounded-sm border border-border px-4 py-2 text-center text-sm font-medium text-ink no-underline hover:border-accent"
              >
                My Account
              </Link>
              <Link
                href="/account/orders"
                onClick={close}
                className="flex-1 rounded-sm border border-border px-4 py-2 text-center text-sm font-medium text-ink no-underline hover:border-accent"
              >
                Order History
              </Link>
              <button
                type="button"
                onClick={() => {
                  signOut()
                  close()
                }}
                className="rounded-sm border border-border px-3 py-2 text-sm text-ink-muted hover:border-accent"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOpenOverlay('account')}
                className="flex-1 rounded-sm border border-border px-4 py-2 text-sm font-medium text-ink hover:border-accent"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setOpenOverlay('account')}
                className="flex-1 rounded-sm bg-accent px-4 py-2 text-sm font-medium text-bone hover:bg-accent-hover"
              >
                Create account
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
