import type { TrustIcon } from '@/components/TrustIconRow'

/**
 * The headline purity claim (Sean, 19 October 2026). It must match the independent CoAs
 * before launch: the specs list TB-500 at >=98% and no batch has been tested yet.
 */
export const PURITY_CLAIM = '99.9%'

/** The five-point trust line shared by the homepage hero and the footer (Sean, 19 October 2026). */
export const SITE_TRUST: { icon: TrustIcon; label: string }[] = [
  { icon: 'check', label: `${PURITY_CLAIM} purity` },
  { icon: 'flask', label: 'Independent lab testing' },
  { icon: 'coa', label: 'Tissue & repair specialists' },
  { icon: 'pin', label: 'UK supplier' },
  { icon: 'truck', label: 'Next day delivery' },
]
