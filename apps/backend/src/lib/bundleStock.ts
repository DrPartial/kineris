/**
 * Pack section 5: "Bundles draw down the single vials they contain (they are
 * not separate stock). A bundle shows as out of stock when any component
 * can't fill it, and its 'Only X remaining' is based on how many complete
 * bundles the stock can make." A bundle's own stock count is never read or
 * written directly, it's always this computation over its components.
 */
export interface BundleComponentStock {
  variantId: string
  quantity: number
  variantStock: number
}

/** How many complete bundles the current component stock can make. */
export function availableBundleCount(components: readonly BundleComponentStock[]): number {
  if (components.length === 0) return 0
  return Math.min(...components.map((c) => Math.floor(c.variantStock / c.quantity)))
}

export function isBundleInStock(components: readonly BundleComponentStock[]): boolean {
  return availableBundleCount(components) > 0
}
