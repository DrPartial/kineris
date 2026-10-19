import type { ShippingOption } from './types.ts'

/**
 * Royal Mail only, UK addresses only, prices confirmed by Sean (October 2026).
 * Only Special Delivery may be described as "guaranteed"; Tracked 24 is an aim.
 */
export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'royal-mail-tracked-48',
    label: 'Royal Mail Tracked 48',
    priceMinorUnits: 395,
    etaLabel: '2-3 working days',
  },
  {
    id: 'royal-mail-tracked-24',
    label: 'Royal Mail Tracked 24',
    priceMinorUnits: 495,
    etaLabel: 'Next working day (aim, not guaranteed)',
  },
  {
    id: 'royal-mail-special-delivery-1pm',
    label: 'Royal Mail Special Delivery Guaranteed by 1pm',
    priceMinorUnits: 1095,
    etaLabel: 'Next working day by 1pm, guaranteed',
  },
]

/** Free Tracked 48 when the goods total (after bundle savings) is over this. */
export const FREE_SHIPPING_THRESHOLD_MINOR_UNITS = 10000
export const FREE_SHIPPING_OPTION_ID = 'royal-mail-tracked-48'

/** The price an option actually costs for a given goods total. */
export function shippingPriceMinorUnits(option: ShippingOption, goodsTotalMinorUnits: number): number {
  if (option.id === FREE_SHIPPING_OPTION_ID && goodsTotalMinorUnits > FREE_SHIPPING_THRESHOLD_MINOR_UNITS) return 0
  return option.priceMinorUnits
}

/**
 * Same-day dispatch cut-off, UK time, Monday to Friday: two hours before
 * Royal Mail's 4.30pm Post Office deadline (Sean's internal buffer). On
 * half-day closing Royal Mail's cut-off drops to 11am, so this moves too;
 * bank holidays are not modelled here yet.
 */
export const DISPATCH_CUTOFF = { hour: 14, minute: 30, label: '2.30pm' } as const

export const UK_ONLY_COUNTRY_CODE = 'GB'
