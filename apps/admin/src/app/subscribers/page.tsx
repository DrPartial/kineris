'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/AdminShell'
import { api } from '@/lib/api'

interface Subscriber {
  id: string
  email: string
  consentMarketing: boolean
  source: string
  createdAt: string
  issuedCode: { code: string; status: string } | null
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])

  useEffect(() => {
    api<Subscriber[]>('/api/admin/subscribers').then(setSubscribers)
  }, [])

  return (
    <AdminShell>
      <h1 className="text-xl font-semibold text-ink">Subscribers</h1>
      <p className="mt-1 text-sm text-ink-muted">Everyone who's signed up through the welcome-modal flow.</p>

      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-ink-hint">
            <th className="py-2 font-normal">Email</th>
            <th className="py-2 font-normal">Consent</th>
            <th className="py-2 font-normal">Source</th>
            <th className="py-2 font-normal">Issued code</th>
            <th className="py-2 font-normal">Signed up</th>
          </tr>
        </thead>
        <tbody>
          {subscribers.map((s) => (
            <tr key={s.id} className="border-b border-border">
              <td className="py-2 text-ink">{s.email}</td>
              <td className="py-2 text-ink-muted">{s.consentMarketing ? 'Yes' : 'No'}</td>
              <td className="py-2 text-ink-muted">{s.source}</td>
              <td className="data-figure py-2 text-ink-muted">{s.issuedCode?.code ?? '-'}</td>
              <td className="py-2 text-ink-muted">{new Date(s.createdAt).toLocaleDateString('en-GB')}</td>
            </tr>
          ))}
          {subscribers.length === 0 && (
            <tr>
              <td colSpan={5} className="py-4 text-ink-muted">
                No subscribers yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </AdminShell>
  )
}
