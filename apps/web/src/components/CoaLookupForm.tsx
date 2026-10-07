'use client'

import { useState, type FormEvent } from 'react'
import { api, ApiError } from '@/lib/api'

interface BatchResult {
  batchNumber: string
  coaFileUrl: string | null
  product: { name: string }
}

export function CoaLookupForm() {
  const [batchNumber, setBatchNumber] = useState('')
  const [result, setResult] = useState<BatchResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setSearching(true)
    setError(null)
    setResult(null)
    try {
      const batch = await api<BatchResult>(`/api/coa-lookup?batchNumber=${encodeURIComponent(batchNumber)}`, {
        method: 'GET',
      })
      setResult(batch)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong looking that up.')
    } finally {
      setSearching(false)
    }
  }

  return (
    <div>
      <form onSubmit={submit} className="flex gap-2">
        <input
          required
          placeholder="Batch number, e.g. KL-2026-014"
          value={batchNumber}
          onChange={(e) => setBatchNumber(e.target.value)}
          className="flex-1 rounded-sm border border-border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={searching}
          className="rounded-sm bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          Look up
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {result && (
        <div className="mt-4 rounded-sm border border-border bg-surface p-4 text-sm">
          <p className="text-ink">
            {result.product.name}, batch <span className="data-figure">{result.batchNumber}</span>
          </p>
          {result.coaFileUrl ? (
            <a href={result.coaFileUrl} className="mt-2 inline-block text-accent hover:text-accent-hover">
              Download Certificate of Analysis (PDF)
            </a>
          ) : (
            <p className="mt-2 text-ink-hint">Certificate of Analysis for this batch: available on request.</p>
          )}
        </div>
      )}
    </div>
  )
}
