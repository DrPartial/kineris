'use client'

import type { Product } from '@kineris/shared'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/AdminShell'
import { api, ApiError } from '@/lib/api'

interface DraftLine {
  variantId: string
  quantity: number
}

export default function NewBundlePage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [slug, setSlug] = useState('')
  const [name, setName] = useState('')
  const [lines, setLines] = useState<DraftLine[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api<Product[]>('/api/admin/products').then(setProducts)
  }, [])

  function toggleVariant(variantId: string, checked: boolean) {
    setLines((prev) =>
      checked ? [...prev, { variantId, quantity: 1 }] : prev.filter((l) => l.variantId !== variantId),
    )
  }

  function setQuantity(variantId: string, quantity: number) {
    setLines((prev) => prev.map((l) => (l.variantId === variantId ? { ...l, quantity } : l)))
  }

  async function submit() {
    setError(null)
    try {
      const bundle = await api<{ id: string }>('/api/admin/bundles', {
        method: 'POST',
        body: JSON.stringify({ slug, name, published: false, components: lines }),
      })
      if (bundle.id) router.push('/bundles')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.')
    }
  }

  return (
    <AdminShell>
      <h1 className="text-xl font-semibold text-ink">Add bundle</h1>
      {/* Bundle names: pack section 7 says to avoid benefit-style names like "Recovery stack" or "Glow". */}

      <div className="mt-6 max-w-md space-y-4">
        <div>
          <label className="mb-1 block text-sm text-ink-muted">Slug (URL)</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-sm border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-muted">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-sm border border-border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <p className="mb-2 text-sm text-ink-muted">Components</p>
          <div className="max-h-80 space-y-3 overflow-y-auto rounded-sm border border-border p-3">
            {products.map((p) => (
              <div key={p.id}>
                <p className="text-xs font-medium text-ink-hint">{p.name}</p>
                {p.variants.map((v) => {
                  const line = lines.find((l) => l.variantId === v.id)
                  return (
                    <label key={v.id} className="mt-1 flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!!line}
                        onChange={(e) => toggleVariant(v.id, e.target.checked)}
                      />
                      {v.size}
                      {line && (
                        <input
                          type="number"
                          min={1}
                          value={line.quantity}
                          onChange={(e) => setQuantity(v.id, Number(e.target.value))}
                          className="w-16 rounded-sm border border-border px-1 py-0.5"
                        />
                      )}
                    </label>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={submit}
          disabled={lines.length === 0}
          className="rounded-sm bg-accent px-4 py-2 text-sm font-medium text-bone hover:bg-accent-hover disabled:opacity-50"
        >
          Create bundle
        </button>
      </div>
    </AdminShell>
  )
}
