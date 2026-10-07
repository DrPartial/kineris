import Image from 'next/image'
import { productImageSrc } from '@/lib/productImages'
import { ImagePlaceholder } from './ImagePlaceholder'

/**
 * A product's vial photo (apps/web/public/products, built by tools/product-shots), or the branded
 * ImagePlaceholder for anything without photography yet (e.g. the lab supplies). The photos are on
 * pure white, so they sit seamlessly on the white cards.
 */
export function ProductImage({
  slug,
  name,
  size,
  formula,
  className = '',
  bordered = true,
  priority = false,
  sizes,
}: {
  slug: string
  name: string
  size?: string
  formula?: string | null
  className?: string
  bordered?: boolean
  priority?: boolean
  sizes?: string
}) {
  const src = productImageSrc(slug, size)
  if (!src) return <ImagePlaceholder label={name} formula={formula} className={className} />

  return (
    <div className={`overflow-hidden rounded-lg bg-white ${bordered ? 'border border-border' : ''} ${className}`}>
      <Image
        src={src}
        alt={`Kineris ${name}${size ? ` ${size}` : ''} research vial`}
        width={1200}
        height={1200}
        sizes={sizes}
        priority={priority}
        className="h-full w-full object-cover"
      />
    </div>
  )
}
