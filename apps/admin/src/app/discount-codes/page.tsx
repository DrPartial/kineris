'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/AdminShell'
import { api } from '@/lib/api'

interface DiscountCode {
  id: string
  code: string
  internalDescription: string | null
  percentOff: number | null
  amountOffMinorUnits: number | null
  minimumOrderValueMinorUnits: number | null
  usageLimitType: 'unlimited' | 'single_use_per_customer' | 'total_redemption_cap'
  totalRedemptionCap: number | null
  perCustomerLimit: number
  validityType: 'ongoing' | 'fixed_duration' | 'date_range'
  startsAt: string | null
  endsAt: string | null
  status: 'scheduled' | 'active' | 'paused' | 'ended'
  autoIssued: boolean
  stacking: 'allow' | 'disallow'
  restrictedToEmail: string | null
  active: boolean
  redemptionCount: number
}

const STATUS_STYLE: Record<DiscountCode['status'], string> = {
  scheduled: 'text-ink-hint',
  active: 'text-accent',
  paused: 'text-ink-muted',
  ended: 'text-ink-hint',
}

export default function PromotionsPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([])
  const [code, setCode] = useState('')
  const [percentOff, setPercentOff] = useState('')
  const [perCustomerLimit, setPerCustomerLimit] = useState('1')
  const [minimumOrderValue, setMinimumOrderValue] = useState('')

  function load() {
    api<DiscountCode[]>('/api/admin/discount-codes').then(setCodes)
  }

  useEffect(load, [])

  async function create() {
    await api('/api/admin/discount-codes', {
      method: 'POST',
      body: JSON.stringify({
        code: code.toUpperCase(),
        percentOff: Number(percentOff),
        perCustomerLimit: Number(perCustomerLimit) || 1,
        minimumOrderValueMinorUnits: minimumOrderValue ? Math.round(Number(minimumOrderValue) * 100) : undefined,
        active: true,
        status: 'active',
      }),
    })
    setCode('')
    setPercentOff('')
    setPerCustomerLimit('1')
    setMinimumOrderValue('')
    load()
  }

  async function toggleActive(c: DiscountCode) {
    await api(`/api/admin/discount-codes/${c.id}`, { method: 'PATCH', body: JSON.stringify({ active: !c.active }) })
    load()
  }

  async function endNow(c: DiscountCode) {
    await api(`/api/admin/discount-codes/${c.id}/end`, { method: 'POST' })
    load()
  }

  return (
    <AdminShell>
      <h1 className="text-xl font-semibold text-ink">Promotions</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Discount codes, including the per-subscriber codes the welcome-modal flow issues automatically.
      </p>

      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-ink-hint">
            <th className="py-2 font-normal">Code</th>
            <th className="py-2 font-normal">Discount</th>
            <th className="py-2 font-normal">Limit</th>
            <th className="py-2 font-normal">Redemptions</th>
            <th className="py-2 font-normal">Status</th>
            <th className="py-2 font-normal">Source</th>
            <th className="py-2 font-normal" />
          </tr>
        </thead>
        <tbody>
          {codes.map((c) => (
            <tr key={c.id} className="border-b border-border">
              <td className="py-2">
                <span className="data-figure text-ink">{c.code}</span>
                {c.internalDescription && <p className="text-xs text-ink-hint">{c.internalDescription}</p>}
                {c.restrictedToEmail && <p className="text-xs text-ink-hint">Restricted to {c.restrictedToEmail}</p>}
              </td>
              <td className="py-2 text-ink-muted">
                {c.percentOff ? `${c.percentOff}%` : c.amountOffMinorUnits ? `${c.amountOffMinorUnits / 100} GBP` : '-'}
              </td>
              <td className="py-2 text-ink-muted">
                {c.usageLimitType === 'unlimited' && 'Unlimited'}
                {c.usageLimitType === 'single_use_per_customer' && 'Once per customer'}
                {c.usageLimitType === 'total_redemption_cap' && `Cap: ${c.totalRedemptionCap ?? '-'}`}
              </td>
              <td className="data-figure py-2 text-ink">{c.redemptionCount}</td>
              <td className="py-2">
                <span className={STATUS_STYLE[c.status]}>{c.status}</span>
              </td>
              <td className="py-2 text-ink-muted">{c.autoIssued ? 'Auto-issued' : 'Manual'}</td>
              <td className="py-2 text-right">
                <button type="button" onClick={() => toggleActive(c)} className="mr-3 text-xs text-ink-muted hover:text-ink">
                  {c.active ? 'Deactivate' : 'Activate'}
                </button>
                {c.status === 'active' && (
                  <button type="button" onClick={() => endNow(c)} className="text-xs font-medium text-accent hover:text-accent-hover">
                    End now
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex flex-wrap items-end gap-2">
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
        <div>
          <label className="mb-1 block text-xs text-ink-hint">Per-customer limit</label>
          <input
            type="number"
            value={perCustomerLimit}
            onChange={(e) => setPerCustomerLimit(e.target.value)}
            className="w-24 rounded-sm border border-border px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-hint">Minimum order (GBP)</label>
          <input
            type="number"
            value={minimumOrderValue}
            onChange={(e) => setMinimumOrderValue(e.target.value)}
            placeholder="Optional"
            className="w-32 rounded-sm border border-border px-2 py-1.5 text-sm"
          />
        </div>
        <button type="button" onClick={create} className="rounded-sm bg-accent px-3 py-2 text-sm font-medium text-bone hover:bg-accent-hover">
          Add code
        </button>
      </div>
    </AdminShell>
  )
}
