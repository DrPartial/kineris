'use client'

import type { Product } from '@kineris/shared'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/AdminShell'
import { api } from '@/lib/api'

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[] | null>(null)

  useEffect(() => {
    api<Product[]>('/api/admin/products').then(setProducts)
  }, [])

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">Products</h1>
        <Link
          href="/products/new"
          className="rounded-sm bg-accent px-4 py-2 text-sm font-medium text-white no-underline hover:bg-accent-hover"
        >
          Add product
        </Link>
      </div>

      {products && (
        <table className="mt-6 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-ink-hint">
              <th className="py-2 font-normal">Name</th>
              <th className="py-2 font-normal">Category</th>
              <th className="py-2 font-normal">Variants</th>
              <th className="py-2 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border">
                <td className="py-2">
                  <Link href={`/products/${p.id}`} className="text-ink no-underline hover:text-accent">
                    {p.name}
                  </Link>
                </td>
                <td className="py-2 text-ink-muted">{p.category}</td>
                <td className="py-2 text-ink-muted">{p.variants.length}</td>
                <td className="py-2">
                  <span className={p.published ? 'text-accent' : 'text-ink-hint'}>
                    {p.published ? 'Published' : 'Hidden'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminShell>
  )
}
