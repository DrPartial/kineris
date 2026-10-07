import type { ShippingOption } from './types.ts'

/**
 * Pack section 6: "Suggested options for the draft, using Royal Mail via
 * Click & Drop... OPEN: exact shipping prices, carriers, dispatch cut-off
 * time, and whether there's a free-shipping threshold. Use placeholders."
 * These are exactly that: real enough to build the checkout flow against,
 * not real prices. Replace before launch.
 */
export const SHIPPING_OPTIONS: ShippingOption[] = [
  { id: 'royal-mail-tracked-48', label: 'Royal Mail Tracked 48', priceMinorUnits: 395, etaLabel: '2-3 working days' },
  { id: 'royal-mail-tracked-24', label: 'Royal Mail Tracked 24', priceMinorUnits: 595, etaLabel: 'Next working day' },
]

export const UK_ONLY_COUNTRY_CODE = 'GB'
