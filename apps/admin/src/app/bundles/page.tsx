'use client'

import type { Bundle } from '@kineris/shared'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/AdminShell'
import { api } from '@/lib/api'

export default function BundlesListPage() {
  const [bundles, setBundles] = useState<Bundle[]>([])

  useEffect(() => {
    api<Bundle[]>('/api/admin/bundles').then(setBundles)
  }, [])

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">Bundles</h1>
        <Link
          href="/bundles/new"
          className="rounded-sm bg-accent px-4 py-2 text-sm font-medium text-bone no-underline hover:bg-accent-hover"
        >
          Add bundle
        </Link>
      </div>

      <ul className="mt-6 divide-y divide-border rounded-sm border border-border text-sm">
        {bundles.map((b) => (
          <li key={b.id} className="flex items-center justify-between px-4 py-3">
            <span className="text-ink">{b.name}</span>
            <span className="text-ink-muted">
              {b.components.length} component{b.components.length === 1 ? '' : 's'}, {b.availableCount} available
            </span>
          </li>
        ))}
        {bundles.length === 0 && <li className="px-4 py-3 text-ink-muted">No bundles yet.</li>}
      </ul>
    </AdminShell>
  )
}
