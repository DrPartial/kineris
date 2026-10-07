import type { Bundle, Product } from '@kineris/shared'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

/**
 * Server-side fetchers, used from Server Components. These run in Node, not
 * the browser, so the backend's CORS allowlist (which only governs
 * browser-initiated requests) doesn't apply here, unlike src/lib/api.ts's
 * client-side fetch wrapper.
 */
export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/api/products`, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

export async function fetchProduct(slug: string): Promise<Product | null> {
  const res = await fetch(`${API_URL}/api/products/${slug}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export async function fetchBundles(): Promise<Bundle[]> {
  const res = await fetch(`${API_URL}/api/bundles`, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

export async function fetchBundle(slug: string): Promise<Bundle | null> {
  const res = await fetch(`${API_URL}/api/bundles/${slug}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}
