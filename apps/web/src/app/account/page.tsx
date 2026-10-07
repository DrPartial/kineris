'use client'

import Link from 'next/link'
import { useCustomerAuth } from '@/contexts/CustomerAuthContext'

export default function AccountPage() {
  const { customer, signOut } = useCustomerAuth()

  if (customer === 'loading') return <div className="mx-auto max-w-3xl px-4 py-16 text-sm text-ink-muted">Loading...</div>

  if (customer === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-ink-muted">Sign in to view your account.</p>
        <Link href="/account/sign-in" className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-hover">
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Account</h1>
        <button type="button" onClick={signOut} className="text-sm text-ink-muted hover:text-ink">
          Sign out
        </button>
      </div>
      <p className="mt-1 text-sm text-ink-muted">{customer.email}</p>

      <Link
        href="/account/orders"
        className="mt-6 flex items-center justify-between rounded-sm border border-border bg-surface p-4 text-sm font-medium text-ink no-underline hover:border-accent"
      >
        Order history
        <span aria-hidden="true">&rarr;</span>
      </Link>
    </div>
  )
}
