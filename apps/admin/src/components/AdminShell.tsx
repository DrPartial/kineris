'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { api } from '@/lib/api'
import { useAdminAuth } from '@/lib/useAdminAuth'

const NAV = [
  { href: '/', label: 'Dashboard' },
  { href: '/products', label: 'Products' },
  { href: '/orders', label: 'Orders' },
  { href: '/discount-codes', label: 'Discount codes' },
  { href: '/bundles', label: 'Bundles' },
]

export function AdminShell({ children }: { children: ReactNode }) {
  const admin = useAdminAuth()
  const pathname = usePathname()
  const router = useRouter()

  if (!admin) return <div className="p-8 text-sm text-ink-muted">Loading...</div>

  async function signOut() {
    await api('/api/admin/auth/log-out', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-border bg-surface p-4">
        <p className="mb-6 text-sm font-semibold text-ink">Kineris Admin</p>
        <nav className="space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-sm px-3 py-2 text-sm no-underline ${
                pathname === item.href ? 'bg-accent-soft text-accent' : 'text-ink-muted hover:bg-surface-sunken'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button type="button" onClick={signOut} className="mt-8 text-xs text-ink-hint hover:text-ink">
          Sign out ({admin.email})
        </button>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
