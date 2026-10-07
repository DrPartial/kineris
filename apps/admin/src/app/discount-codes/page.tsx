'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/AdminShell'
import { api } from '@/lib/api'

interface DiscountCode {
  id: string
  code: string
  percentOff: number | null
  amountOffMinorUnits: number | null
  active: boolean
}

export default function DiscountCodesPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([])
  const [code, setCode] = useState('')
  const [percentOff, setPercentOff] = useState('')

  function load() {
    api<DiscountCode[]>('/api/admin/discount-codes').then(setCodes)
  }

  useEffect(load, [])

  async function create() {
    await api('/api/admin/discount-codes', {
      method: 'POST',
      body: JSON.stringify({ code: code.toUpperCase(), percentOff: Number(percentOff), active: true }),
    })
    setCode('')
    setPercentOff('')
    load()
  }

  async function toggleActive(c: DiscountCode) {
    await api(`/api/admin/discount-codes/${c.id}`, { method: 'PATCH', body: JSON.stringify({ active: !c.active }) })
    load()
  }

  return (
    <AdminShell>
      <h1 className="text-xl font-semibold text-ink">Discount codes</h1>

      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-ink-hint">
            <th className="py-2 font-normal">Code</th>
            <th className="py-2 font-normal">Discount</th>
            <th className="py-2 font-normal">Active</th>
          </tr>
        </thead>
        <tbody>
          {codes.map((c) => (
            <tr key={c.id} className="border-b border-border">
              <td className="data-figure py-2 text-ink">{c.code}</td>
              <td className="py-2 text-ink-muted">
                {c.percentOff ? `${c.percentOff}%` : c.amountOffMinorUnits ? `${c.amountOffMinorUnits / 100} GBP` : '-'}
              </td>
              <td className="py-2">
                <button type="button" onClick={() => toggleActive(c)} className={c.active ? 'text-accent' : 'text-ink-hint'}>
                  {c.active ? 'Active' : 'Inactive'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex items-end gap-2">
        <div>
          <label className="mb-1 block text-xs text-ink-hint">Code</label>
          <input value={code} onChange={(e) => setCode(e.target.value)} className="w-32 rounded-sm border border-border px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-hint">Percent off</label>
          <input
            type="number"
            value={percentOff}
            onChange={(e) => setPercentOff(e.target.value)}
            className="w-24 rounded-sm border border-border px-2 py-1.5 text-sm"
          />
        </div>
        <button type="button" onClick={create} className="rounded-sm bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover">
          Add code
        </button>
      </div>
    </AdminShell>
  )
}
