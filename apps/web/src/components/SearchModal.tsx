'use client'

import type { Product } from '@kineris/shared'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, type KeyboardEvent } from 'react'
import { Modal } from './Modal'
import { ProductImage } from './ProductImage'
import { useOverlay } from '@/contexts/OverlayContext'
import { formatGBP } from '@/lib/money'
import { useProducts } from '@/lib/useProducts'

const squash = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, '')
const cheapestVariant = (p: Product) => [...p.variants].sort((a, b) => a.priceMinorUnits - b.priceMinorUnits)[0]

export function SearchModal() {
  const { openOverlay, setOpenOverlay } = useOverlay()
  const open = openOverlay === 'search'
  const router = useRouter()
  const products = useProducts(open)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  // Match on letters and digits only, so "bpc157", "BPC 157" and "tb-500" all find their compound.
  // Names starting with the query rank above names merely containing it.
  const results = useMemo(() => {
    const q = squash(query)
    if (!q) return []
    const scored: { p: Product; score: number }[] = []
    for (const p of products) {
      const names = [p.name, ...p.synonyms].map(squash)
      const score = names.some((n) => n.startsWith(q))
        ? 0
        : names.some((n) => n.includes(q))
          ? 1
          : squash(p.category).includes(q)
            ? 2
            : -1
      if (score >= 0) scored.push({ p, score })
    }
    return scored.sort((a, b) => a.score - b.score).map((x) => x.p)
  }, [products, query])

  const hasQuery = query.trim() !== ''
  // With nothing typed, offer the first few compounds as a starting point.
  const list = hasQuery ? results : products.slice(0, 6)
  const current = Math.min(active, Math.max(0, list.length - 1))

  function close() {
    setOpenOverlay(null)
    setQuery('')
    setActive(0)
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (list.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((current + 1) % list.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((current - 1 + list.length) % list.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      router.push(`/products/${list[current].slug}`)
      close()
    }
  }

  return (
    <Modal open={open} onClose={close} label="Search the catalogue">
      <div className="flex h-dvh w-[min(100vw,36rem)] flex-col bg-surface max-sm:pt-[var(--ruo-h,2rem)] sm:h-[min(80vh,40rem)] sm:rounded-md sm:border sm:border-border">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-ink-hint">
            <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM21 21l-4.3-4.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <input
            autoFocus
            role="combobox"
            aria-expanded={list.length > 0}
            aria-controls="search-results"
            placeholder="Search compounds, synonyms..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={onKeyDown}
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-hint"
          />
          <button type="button" onClick={close} aria-label="Close search" className="text-ink-hint hover:text-ink">
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
            {hasQuery ? `${results.length} ${results.length === 1 ? 'result' : 'results'}` : 'Popular compounds'}
          </p>
          {hasQuery && results.length === 0 && (
            <p className="text-sm text-ink-hint">
              No matches. Try the compound name or a short form like &ldquo;BPC&rdquo;, or{' '}
              <Link href="/shop" onClick={close} className="text-accent">
                browse the catalogue
              </Link>
              .
            </p>
          )}
          <ul id="search-results" role="listbox" className="space-y-1">
            {list.map((p, i) => {
              const v = cheapestVariant(p)
              return (
                <li key={p.id} role="option" aria-selected={i === current}>
                  <Link
                    href={`/products/${p.slug}`}
                    onClick={close}
                    onMouseEnter={() => setActive(i)}
                    className={`flex items-center gap-3 rounded-sm px-2 py-2 no-underline ${i === current ? 'bg-surface-sunken' : ''}`}
                  >
                    <ProductImage slug={p.slug} name={p.name} size={v?.size} formula={p.molecularFormula} className="h-12 w-12 shrink-0" sizes="48px" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-ink">{p.name}</span>
                      <span className="block truncate text-xs text-ink-hint">{p.variants.map((x) => x.size).join(' · ')}</span>
                    </span>
                    <span className="data-figure text-sm text-ink-muted">from {formatGBP(v?.priceMinorUnits ?? 0)}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </Modal>
  )
}
