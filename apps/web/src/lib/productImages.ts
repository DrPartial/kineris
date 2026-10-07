import { PRODUCT_IMAGE_SIZES } from './product-images.generated'

const normaliseSize = (size: string) => size.toLowerCase().replace(/\s+/g, '')

/**
 * URL of the vial image for a product, or null when it has no photography yet (callers then fall
 * back to ImagePlaceholder). Images are keyed by slug + size because the label prints the strength.
 *
 * With a `size`, only that exact size matches: showing another strength's label next to the wrong
 * price would be misleading, so a missing size falls back to the placeholder, not a near miss.
 * Without a `size`, the product's first image is used.
 */
export function productImageSrc(slug: string, size?: string): string | null {
  const sizes = PRODUCT_IMAGE_SIZES[slug]
  if (!sizes?.length) return null
  if (size === undefined) return `/products/${slug}-${sizes[0]}.webp`
  const wanted = normaliseSize(size)
  return sizes.includes(wanted) ? `/products/${slug}-${wanted}.webp` : null
}
