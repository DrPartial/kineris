'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { AdminShell } from '@/components/AdminShell'
import { api, ApiError } from '@/lib/api'

export default function NewProductPage() {
  const router = useRouter()
  const [slug, setSlug] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState<'peptide' | 'lab_supply'>('peptide')
  const [error, setError] = useState<string | null>(null)
  const [issues, setIssues] = useState<Record<string, string[]> | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setIssues(null)
    try {
      const product = await api<{ id: string }>('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({ slug, name, category, published: false }),
      })
      router.push(`/products/${product.id}`)
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const body = err.body as { issues?: Record<string, string[]> } | null
        setIssues(body?.issues ?? null)
        setError('Compliance check failed, see flagged fields below.')
      } else {
        setError(err instanceof ApiError ? err.message : 'Something went wrong.')
      }
      setSubmitting(false)
    }
  }

  return (
    <AdminShell>
      <h1 className="text-xl font-semibold text-ink">Add product</h1>
      <form onSubmit={submit} className="mt-6 max-w-md space-y-4">
        <div>
          <label className="mb-1 block text-sm text-ink-muted">Slug (URL)</label>
          <input
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-sm border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-muted">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-sm border border-border px-3 py-2 text-sm"
          />
          {issues?.name && (
            <p className="mt-1 text-xs text-red-600">Flagged terms: {issues.name.join(', ')}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-muted">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
            className="w-full rounded-sm border border-border px-3 py-2 text-sm"
          >
            <option value="peptide">Peptide</option>
            <option value="lab_supply">Lab supply</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-sm bg-accent px-4 py-2 text-sm font-medium text-bone hover:bg-accent-hover disabled:opacity-50"
        >
          Create product
        </button>
      </form>
    </AdminShell>
  )
}
