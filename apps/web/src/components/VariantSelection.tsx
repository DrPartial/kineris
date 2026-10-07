'use client'

import type { ProductVariant } from '@kineris/shared'
import { createContext, useContext, useState, type ReactNode } from 'react'
import { ProductImage } from './ProductImage'

interface VariantSelectionValue {
  selectedId: string | undefined
  select: (id: string) => void
}

const VariantSelectionContext = createContext<VariantSelectionValue | null>(null)

/**
 * Shares the chosen size between the size buttons (AddToCartForm) and the product image, which
 * shows the vial for that exact size since the label prints the strength.
 */
export function VariantSelectionProvider({
  variants,
  children,
}: {
  variants: ProductVariant[]
  children: ReactNode
}) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id)
  return (
    <VariantSelectionContext.Provider value={{ selectedId, select: setSelectedId }}>
      {children}
    </VariantSelectionContext.Provider>
  )
}

export function useVariantSelection() {
  return useContext(VariantSelectionContext)
}

export function ProductHeroImage({
  slug,
  name,
  formula,
  variants,
}: {
  slug: string
  name: string
  formula: string | null
  variants: ProductVariant[]
}) {
  const shared = useVariantSelection()
  const variant = variants.find((v) => v.id === shared?.selectedId) ?? variants[0]
  return (
    <ProductImage
      slug={slug}
      name={name}
      size={variant?.size}
      formula={formula}
      className="aspect-square"
      priority
      sizes="(min-width: 1024px) 480px, 100vw"
    />
  )
}
