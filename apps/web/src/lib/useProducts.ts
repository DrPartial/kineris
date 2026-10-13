'use client'

import type { Product } from '@kineris/shared'
import { useEffect, useState } from 'react'
import { api } from './api'

// One fetch of the catalogue shared by everything client-side that needs variant details (cart
// drawer, search). The catalogue is small and read-only, so a per-page-load cache is plenty.
let cache: Product[] | null = null
let inflight: Promise<Product[]> | null = null

function load(): Promise<Product[]> {
  if (cache) return Promise.resolve(cache)
  inflight ??= api<Product[]>('/api/products')
    .then((p) => (cache = p))
    .finally(() => {
      inflight = null
    })
  return inflight
}

export function useProducts(enabled = true): Product[] {
  const [products, setProducts] = useState<Product[]>(cache ?? [])
  useEffect(() => {
    if (!enabled || cache) {
      if (cache && products.length === 0) setProducts(cache)
      return
    }
    let live = true
    load()
      .then((p) => live && setProducts(p))
      .catch(() => {})
    return () => {
      live = false
    }
  }, [enabled, products.length])
  return products
}
