'use client'

import type { Product } from '@kineris/shared'
import { useMemo, useState } from 'react'
import { ProductCard } from './ProductCard'

type Sort = 'featured' | 'price-asc' | 'price-desc' | 'name'

const SORTS: { value: Sort; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A to Z' },
]

const cheapest = (p: Product) => Math.min(...p.variants.map((v) => v.priceMinorUnits))
const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

/** Instant, client-side sort and filter over the (small) catalogue; no round trip per change. */
export function ShopGrid({ products }: { products: Product[] }) {
  const [sort, setSort] = useState<Sort>('featured')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [query, setQuery] = useState('')

  const shown = useMemo(() => {
    const q = squash(query)
    let list = products.filter((p) => !inStockOnly || p.variants.some((v) => v.stock > 0))
    if (q) list = list.filter((p) => [p.name, ...p.synonyms].some((n) => squash(n).includes(q)))
    if (sort === 'price-asc') list = [...list].sort((a, b) => cheapest(a) - cheapest(b))
    else if (sort === 'price-desc') list = [...list].sort((a, b) => cheapest(b) - cheapest(a))
    else if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [products, sort, inStockOnly, query])

  const filtered = inStockOnly || query !== ''

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3 border-y border-border py-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name…"
          aria-label="Filter products by name"
          className="min-w-0 flex-1 rounded-sm border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-hint sm:max-w-xs"
        />
        <label className="flex items-center gap-2 text-sm text-ink-muted">
          <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
          In stock only
        </label>
        <label className="ml-auto flex items-center gap-2 text-sm text-ink-muted">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-sm border border-border bg-surface px-2 py-2 text-sm text-ink"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-3 text-xs text-ink-hint" aria-live="polite">
        {shown.length} {shown.length === 1 ? 'product' : 'products'}
        {filtered && products.length !== shown.length ? ` of ${products.length}` : ''}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {shown.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {shown.length === 0 && (
          <div className="col-span-full py-8 text-sm text-ink-muted">
            {products.length === 0 ? (
              'No products in this category yet.'
            ) : (
              <>
                No products match.{' '}
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setInStockOnly(false)
                  }}
                  className="font-semibold text-accent underline underline-offset-2"
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
