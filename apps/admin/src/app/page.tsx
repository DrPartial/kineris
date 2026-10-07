'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/AdminShell'
import { api } from '@/lib/api'
import { formatGBP } from '@/lib/money'

interface DashboardData {
  orderCount: number
  customerCount: number
  revenueMinorUnits: number
  lowStock: { productId: string; productName: string; size: string; stock: number; threshold: number }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    api<DashboardData>('/api/admin/dashboard').then(setData)
  }, [])

  return (
    <AdminShell>
      <h1 className="text-xl font-semibold text-ink">Dashboard</h1>

      {data && (
        <>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-sm border border-border bg-surface p-4">
              <p className="text-xs text-ink-hint">Revenue (paid + shipped orders)</p>
              <p className="data-figure mt-1 text-2xl font-semibold text-ink">
                {formatGBP(data.revenueMinorUnits)}
              </p>
            </div>
            <div className="rounded-sm border border-border bg-surface p-4">
              <p className="text-xs text-ink-hint">Orders</p>
              <p className="data-figure mt-1 text-2xl font-semibold text-ink">{data.orderCount}</p>
            </div>
            <div className="rounded-sm border border-border bg-surface p-4">
              <p className="text-xs text-ink-hint">Customers</p>
              <p className="data-figure mt-1 text-2xl font-semibold text-ink">{data.customerCount}</p>
            </div>
          </div>

          <h2 className="mt-8 mb-3 text-sm font-medium text-ink">Low stock</h2>
          {data.lowStock.length === 0 ? (
            <p className="text-sm text-ink-muted">Nothing below its threshold right now.</p>
          ) : (
            <ul className="divide-y divide-border rounded-sm border border-border">
              {data.lowStock.map((item) => (
                <li key={`${item.productId}-${item.size}`} className="flex justify-between px-4 py-2 text-sm">
                  <span className="text-ink">
                    {item.productName} ({item.size})
                  </span>
                  <span className="data-figure text-red-600">
                    {item.stock} left (threshold {item.threshold})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </AdminShell>
  )
}
