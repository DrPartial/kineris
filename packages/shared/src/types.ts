/**
 * Plain domain types shared by the storefront and admin apps, independent of
 * Prisma's generated client (which only the backend depends on) so neither
 * frontend app needs a database driver in its bundle. The backend's API
 * responses are expected to match these shapes; it's the contract, not a
 * copy of the Prisma schema's own field set (e.g. no internal IDs beyond the
 * public ones these apps actually need).
 */

export type ProductCategory = 'peptide' | 'bundle' | 'lab-supply'

export interface Product {
  id: string
  slug: string
  name: string
  synonyms: string[]
  category: ProductCategory
  casNumber: string | null
  molecularFormula: string | null
  molecularWeight: string | null
  form: string | null
  storageConditions: string | null
  published: boolean
  lowStockThreshold: number
  variants: ProductVariant[]
  currentBatch: Batch | null
}

export interface ProductVariant {
  id: string
  productId: string
  size: string
  priceMinorUnits: number
  currency: 'GBP'
  purity: string | null
  stock: number
}

export interface Batch {
  id: string
  productId: string
  batchNumber: string
  coaFileUrl: string | null
  isCurrent: boolean
  createdAt: string
}

export interface BundleComponent {
  variantId: string
  quantity: number
  /** The component's own variant, included so a bundle page can show and price itself without a second fetch. */
  variant: Pick<ProductVariant, 'size' | 'priceMinorUnits' | 'stock' | 'productId'>
}

export interface Bundle {
  id: string
  slug: string
  name: string
  components: BundleComponent[]
  /** Derived, not stored: the floor of each component's (stock / quantity). */
  availableCount: number
}

/** Sum of each component's own price times how many of it the bundle needs. */
export function bundlePriceMinorUnits(bundle: Pick<Bundle, 'components'>): number {
  return bundle.components.reduce((sum, c) => sum + c.variant.priceMinorUnits * c.quantity, 0)
}

export interface CartLine {
  variantId: string
  quantity: number
}

export interface RuoDeclaration {
  termsAccepted: boolean
  ruoAccepted: boolean
  acceptedAt: string
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled'

export interface OrderItem {
  variantId: string
  batchId: string
  quantity: number
  unitPriceMinorUnits: number
}

export interface Order {
  id: string
  customerEmail: string
  status: OrderStatus
  items: OrderItem[]
  shippingOptionId: string
  discountCode: string | null
  totalMinorUnits: number
  declaration: RuoDeclaration
  trackingNumber: string | null
  createdAt: string
}

export interface DiscountCode {
  code: string
  percentOff: number | null
  amountOffMinorUnits: number | null
  active: boolean
}

/** Placeholder, non-carrier-integrated shipping choices, pack section 6 is OPEN on exact pricing. */
export interface ShippingOption {
  id: string
  label: string
  priceMinorUnits: number
  etaLabel: string
}
