'use client'

import type { CoaListing } from '@kineris/shared'
import { useEffect, useState, type FormEvent } from 'react'
import { COACard } from './COACard'
import { api, ApiError } from '@/lib/api'

export function CoaLookupForm({ initialBatchNumber }: { initialBatchNumber?: string }) {
  const [batchNumber, setBatchNumber] = useState(initialBatchNumber ?? '')
  const [result, setResult] = useState<CoaListing | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)

  async function lookup(value: string) {
    setSearching(true)
    setError(null)
    setResult(null)
    try {
      const batch = await api<CoaListing>(`/api/coa-lookup?batchNumber=${encodeURIComponent(value)}`, { method: 'GET' })
      setResult(batch)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong looking that up.')
    } finally {
      setSearching(false)
    }
  }

  // Deep-link support (e.g. a future QR code on a vial label pointing at
  // /quality?batch=KL-2026-001) auto-runs the lookup on load.
  useEffect(() => {
    if (initialBatchNumber) lookup(initialBatchNumber)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBatchNumber])

  function submit(e: FormEvent) {
    e.preventDefault()
    lookup(batchNumber)
  }

  return (
    <div>
      <form onSubmit={submit} className="flex gap-2">
        <input
          required
          placeholder="Batch number, e.g. KL-2026-001"
          value={batchNumber}
          onChange={(e) => setBatchNumber(e.target.value)}
          className="flex-1 rounded-sm border border-border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={searching}
          className="rounded-sm bg-accent px-4 py-2 text-sm font-medium text-bone hover:bg-accent-hover disabled:opacity-50"
        >
          Look up
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {result && (
        <div className="mt-4">
          <COACard batch={result} />
        </div>
      )}
    </div>
  )
}
