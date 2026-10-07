'use client'

import type { Product } from '@kineris/shared'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Modal } from './Modal'
import { useOverlay } from '@/contexts/OverlayContext'
import { api } from '@/lib/api'
import { formatGBP } from '@/lib/money'

const CATEGORY_LABEL: Record<Product['category'], string> = {
  peptide: 'Peptides',
  'lab-supply': 'Lab Supplies',
  bundle: 'Bundles',
}

export function SearchModal() {
  const { openOverlay, setOpenOverlay } = useOverlay()
  const open = openOverlay === 'search'
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (open && products.length === 0) {
      api<Product[]>('/api/products').then(setProducts)
    }
  }, [open, products.length])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.synonyms.some((s) => s.toLowerCase().includes(q)) || p.category.includes(q),
    )
  }, [products, query])

  const grouped = useMemo(() => {
    const map = new Map<Product['category'], Product[]>()
    for (const p of results) {
      const list = map.get(p.category) ?? []
      list.push(p)
      map.set(p.category, list)
    }
    return map
  }, [results])

  function close() {
    setOpenOverlay(null)
    setQuery('')
  }

  return (
    <Modal open={open} onClose={close} label="Search the catalogue">
      <div className="flex h-dvh w-[min(100vw,36rem)] flex-col bg-surface sm:h-[min(80vh,40rem)] sm:rounded-md sm:border sm:border-border">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-ink-hint">
            <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM21 21l-4.3-4.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <input
            autoFocus
            placeholder="Search compounds, synonyms..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-hint"
          />
          <button type="button" onClick={close} aria-label="Close search" className="text-ink-hint hover:text-ink">
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {query.trim() === '' && <p className="text-sm text-ink-hint">Search by compound name or synonym.</p>}
          {query.trim() !== '' && results.length === 0 && <p className="text-sm text-ink-hint">No matches.</p>}

          {Array.from(grouped.entries()).map(([category, items]) => (
            <div key={category} className="mb-6">
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-hint">{CATEGORY_LABEL[category]}</h3>
              <ul className="space-y-1">
                {items.map((p) => {
                  const cheapest = p.variants.reduce(
                    (min, v) => (v.priceMinorUnits < min ? v.priceMinorUnits : min),
                    p.variants[0]?.priceMinorUnits ?? 0,
                  )
                  return (
                    <li key={p.id}>
                      <Link
                        href={`/products/${p.slug}`}
                        onClick={close}
                        className="flex items-center justify-between rounded-sm px-2 py-2 no-underline hover:bg-surface-sunken"
                      >
                        <span>
                          <span className="text-sm text-ink">{p.name}</span>
                          <span className="ml-2 text-xs text-ink-hint">{p.variants.map((v) => v.size).join(', ')}</span>
                        </span>
                        <span className="data-figure text-sm text-ink-muted">from {formatGBP(cheapest)}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}
