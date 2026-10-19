import type { Product } from '@kineris/shared'
import { bundleSavings, FREE_SHIPPING_THRESHOLD_MINOR_UNITS } from '@kineris/shared'

export interface ResolvedVariant {
  variantId: string
  productSlug: string
  productName: string
  molecularFormula: string | null
  size: string
  priceMinorUnits: number
  stock: number
}

export function resolveVariants(products: Product[]): Map<string, ResolvedVariant> {
  const map = new Map<string, ResolvedVariant>()
  for (const p of products) {
    for (const v of p.variants) {
      map.set(v.id, {
        variantId: v.id,
        productSlug: p.slug,
        productName: p.name,
        molecularFormula: p.molecularFormula,
        size: v.size,
        priceMinorUnits: v.priceMinorUnits,
        stock: v.stock,
      })
    }
  }
  return map
}

/**
 * The cart's money, priced the same way the backend prices an order
 * (apps/backend/src/routes/orders.ts): singles subtotal, minus automatic
 * bundle savings, gives the goods total that free delivery and discount
 * codes are measured against.
 */
export function priceCart(lines: { variantId: string; quantity: number }[], variants: Map<string, ResolvedVariant>) {
  const resolved = lines
    .map((line) => ({ line, variant: variants.get(line.variantId) }))
    .filter((r): r is { line: (typeof lines)[number]; variant: ResolvedVariant } => r.variant !== undefined)

  const subtotal = resolved.reduce((sum, r) => sum + r.variant.priceMinorUnits * r.line.quantity, 0)
  const bundles = bundleSavings(
    resolved.map((r) => ({
      slug: r.variant.productSlug,
      size: r.variant.size,
      quantity: r.line.quantity,
      unitPriceMinorUnits: r.variant.priceMinorUnits,
    })),
  )
  const goodsTotal = subtotal - bundles.savingMinorUnits
  const toFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD_MINOR_UNITS + 1 - goodsTotal)

  return { resolved, subtotal, bundles, goodsTotal, toFreeShipping }
}
