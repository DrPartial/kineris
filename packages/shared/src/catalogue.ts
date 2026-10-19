/**
 * Kineris's launch range: the 6-product Tissue & Repair catalogue Sean chose
 * for the MVP (October 2026), and only this range. Prices are GBP inc. VAT.
 *
 * Descriptions are factual and compound-specific: what each substance is and
 * how it's classified, never an effect, benefit, or application claim, and
 * every one has been checked against COMPLIANCE_BANNED_TERMS (pack 2.3).
 *
 * Specifications (CAS, formula, weight, sequence, appearance) are taken from
 * UK Peptides' product pages for launch, as Sean asked, with the values that
 * match the chemistry where those pages contradict themselves. Replace purity
 * and batch data with our own once the independent batch CoAs arrive. TB-500
 * here is full-length Thymosin Beta-4 (43 amino acids, 4963.4 g/mol): confirm
 * the supplier's TB-500 is the same peptide before launch.
 */

export interface CatalogueVariant {
  size: string
  priceMinorUnits: number
  /** Opening stock for the seed, the launch order quantities. */
  launchStock: number
}

export interface CatalogueSpecs {
  casNumber: string | null
  molecularFormula: string
  molecularWeight: string
  sequence: string | null
  /** Shown as the product's "Form" (appearance of the supplied material). */
  form: string
  /** General purity spec; the batch CoA carries the tested figure. */
  purity: string | null
  storageConditions: string
}

export interface CatalogueEntry {
  slug: string
  name: string
  synonyms: string[]
  category: 'peptide' | 'lab_supply'
  /** Neutral research-area label for filters and product pages, never an effect. */
  researchArea: string
  description: string
  specs: CatalogueSpecs
  variants: CatalogueVariant[]
}

const PEPTIDE_STORAGE =
  'Store sealed vials at -20 °C, protected from light and moisture. Shelf life 2 years unopened.'

export const PEPTIDE_CATALOGUE: CatalogueEntry[] = [
  {
    slug: 'bpc-157',
    name: 'BPC-157',
    synonyms: ['Body Protection Compound-157'],
    category: 'peptide',
    researchArea: 'Tissue research',
    description:
      'BPC-157 is a synthetic 15-amino-acid peptide based on a sequence identified in a gastric juice protein, supplied as a lyophilised powder for in-vitro laboratory research.',
    specs: {
      casNumber: '137525-51-0 (free base); 216441-37-1 (acetate)',
      molecularFormula: 'C62H98N16O22',
      molecularWeight: '1419.5 g/mol (free base); 1479.6 g/mol (acetate)',
      sequence: 'Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val',
      form: 'White to off-white lyophilised powder',
      purity: '≥99% (HPLC)',
      storageConditions: PEPTIDE_STORAGE,
    },
    variants: [{ size: '5mg', priceMinorUnits: 1695, launchStock: 120 }],
  },
  {
    slug: 'tb-500',
    name: 'TB-500 (Thymosin Beta-4)',
    synonyms: ['Thymosin Beta-4 acetate', 'TB-500'],
    category: 'peptide',
    researchArea: 'Tissue research',
    description:
      'TB-500 is a synthetic form of Thymosin Beta-4, a naturally occurring 43-amino-acid peptide involved in actin regulation, supplied as an acetate salt.',
    specs: {
      casNumber: null,
      molecularFormula: 'C212H350N56O78S',
      molecularWeight: '4963.4 g/mol',
      sequence: 'Ac-SDKPDMAEIEKFDKSKLKKTETQEKNPLPSKETIEQEKQAGES',
      form: 'White to off-white lyophilised powder',
      purity: '≥98% (HPLC)',
      storageConditions: PEPTIDE_STORAGE,
    },
    variants: [{ size: '2mg', priceMinorUnits: 1595, launchStock: 80 }],
  },
  {
    slug: 'ghk-cu',
    name: 'GHK-Cu (copper peptide)',
    synonyms: ['Copper peptide', 'GHK-Cu'],
    category: 'peptide',
    researchArea: 'Tissue and skin research',
    description:
      'GHK-Cu is a copper-binding tripeptide (Gly-His-Lys) naturally present in plasma, studied for its role in copper transport and cellular signalling.',
    specs: {
      casNumber: '89030-95-5',
      molecularFormula: 'C14H22CuN6O4',
      molecularWeight: '401.9 g/mol',
      sequence: 'Gly-His-Lys (copper complex)',
      form: 'Blue lyophilised solid',
      purity: '≥99% (HPLC)',
      storageConditions: PEPTIDE_STORAGE,
    },
    variants: [{ size: '50mg', priceMinorUnits: 2495, launchStock: 60 }],
  },
  {
    slug: 'kpv',
    name: 'KPV',
    synonyms: ['Lys-Pro-Val'],
    category: 'peptide',
    researchArea: 'Inflammation research',
    description:
      'KPV is a synthetic tripeptide (Lys-Pro-Val) corresponding to the C-terminal sequence of alpha-melanocyte-stimulating hormone, studied in laboratory models of inflammatory signalling.',
    specs: {
      casNumber: null,
      molecularFormula: 'C16H30N4O4',
      molecularWeight: '342.43 g/mol',
      sequence: 'Lys-Pro-Val',
      form: 'White to off-white lyophilised powder',
      purity: '≥99% (HPLC)',
      storageConditions: PEPTIDE_STORAGE,
    },
    variants: [{ size: '10mg', priceMinorUnits: 4795, launchStock: 30 }],
  },
  {
    slug: 'ss-31',
    name: 'SS-31 (Elamipretide)',
    synonyms: ['Elamipretide', 'SS-31'],
    category: 'peptide',
    researchArea: 'Mitochondrial research',
    description:
      'SS-31, also known as Elamipretide, is a synthetic aromatic-cationic tetrapeptide that localises to the inner mitochondrial membrane, studied in mitochondrial research.',
    specs: {
      casNumber: '736992-21-5',
      molecularFormula: 'C32H49N9O5',
      molecularWeight: '639.8 g/mol',
      sequence: 'D-Arg-Dmt-Lys-Phe-NH2',
      form: 'White to off-white lyophilised powder',
      purity: '≥98% (HPLC)',
      storageConditions: PEPTIDE_STORAGE,
    },
    variants: [{ size: '10mg', priceMinorUnits: 5795, launchStock: 20 }],
  },
]

export const LAB_SUPPLY_CATALOGUE: CatalogueEntry[] = [
  {
    slug: 'bacteriostatic-water',
    name: 'Bacteriostatic water',
    synonyms: ['Bac water'],
    category: 'lab_supply',
    researchArea: 'Lab supply',
    description:
      'Sterile water containing 0.9% benzyl alcohol as a bacteriostatic preservative, supplied in a sealed 10ml vial as a laboratory supply.',
    specs: {
      casNumber: '7732-18-5 (water)',
      molecularFormula: 'H2O with 0.9% (9mg/ml) benzyl alcohol',
      molecularWeight: '18.015 g/mol (water)',
      sequence: null,
      form: 'Clear, colourless sterile liquid',
      purity: null,
      storageConditions: 'Store unopened at 15-25 °C; once opened, store at 2-8 °C and use within 28 days.',
    },
    variants: [{ size: '10ml', priceMinorUnits: 595, launchStock: 110 }],
  },
]

export const FULL_CATALOGUE: CatalogueEntry[] = [...PEPTIDE_CATALOGUE, ...LAB_SUPPLY_CATALOGUE]

/**
 * Storefront order, most popular first (UK search volume and competitor product-page
 * traffic, market research 12 Oct). Bac water sits last as an add-on. Anything not
 * listed (e.g. added in admin) follows alphabetically.
 */
export const PRODUCT_DISPLAY_ORDER = ['bpc-157', 'ghk-cu', 'tb-500', 'kpv', 'ss-31', 'bacteriostatic-water']

/** Sorts listings by a slug order, unlisted ones last by name. */
export function sortBySlugOrder<T extends { slug: string; name: string }>(items: T[], order: string[]): T[] {
  const rank = (slug: string) => {
    const i = order.indexOf(slug)
    return i === -1 ? order.length : i
  }
  return [...items].sort((a, b) => rank(a.slug) - rank(b.slug) || a.name.localeCompare(b.name))
}

export function catalogueEntry(slug: string): CatalogueEntry | undefined {
  return FULL_CATALOGUE.find((e) => e.slug === slug)
}

/**
 * Bundles are listings that draw down single-vial stock (pack 5), always
 * separate vials, never a blend, and named by contents only. Each has a fixed
 * price below the singles total; the saving is applied automatically wherever
 * the cart holds the bundle's vials (see bundleSavings), so it can't be lost
 * by editing quantities in the cart.
 */
export interface BundleDefinition {
  slug: string
  name: string
  components: { slug: string; size: string; quantity: number }[]
  priceMinorUnits: number
}

export const BUNDLES: BundleDefinition[] = [
  {
    slug: 'bpc-157-tb-500-bundle',
    name: 'BPC-157 + TB-500 bundle',
    components: [
      { slug: 'bpc-157', size: '5mg', quantity: 5 },
      { slug: 'tb-500', size: '2mg', quantity: 5 },
    ],
    priceMinorUnits: 14995,
  },
  {
    slug: 'bpc-157-5-pack',
    name: 'BPC-157 5-pack',
    components: [{ slug: 'bpc-157', size: '5mg', quantity: 5 }],
    priceMinorUnits: 7995,
  },
  {
    slug: 'tb-500-5-pack',
    name: 'TB-500 5-pack',
    components: [{ slug: 'tb-500', size: '2mg', quantity: 5 }],
    priceMinorUnits: 7495,
  },
  {
    slug: 'bpc-157-tb-500-ghk-cu-trio',
    name: 'BPC-157 + TB-500 + GHK-Cu trio',
    components: [
      { slug: 'bpc-157', size: '5mg', quantity: 1 },
      { slug: 'tb-500', size: '2mg', quantity: 1 },
      { slug: 'ghk-cu', size: '50mg', quantity: 1 },
    ],
    priceMinorUnits: 5495,
  },
]

export function bundleDefinition(slug: string): BundleDefinition | undefined {
  return BUNDLES.find((b) => b.slug === slug)
}

const componentKey = (slug: string, size: string) => `${slug}:${size.toLowerCase().replace(/\s+/g, '')}`

/** Singles total for a bundle, from the catalogue's own prices. */
export function bundleSinglesTotalMinorUnits(bundle: BundleDefinition): number {
  return bundle.components.reduce((sum, c) => {
    const price = catalogueEntry(c.slug)?.variants.find((v) => v.size === c.size)?.priceMinorUnits ?? 0
    return sum + price * c.quantity
  }, 0)
}

export interface PricedCartLine {
  slug: string
  size: string
  quantity: number
  unitPriceMinorUnits: number
}

/**
 * The largest total saving the cart's vials qualify for across all bundles,
 * found exactly (a small memoised search over the bundle-eligible counts),
 * so the customer always gets the best combination, not just the first match.
 * Savings are worked out from the cart's own unit prices, so the server and
 * the storefront agree as long as they price the lines the same way.
 */
export function bundleSavings(lines: PricedCartLine[]): { savingMinorUnits: number; applied: { slug: string; name: string; count: number }[] } {
  const counts = new Map<string, number>()
  const prices = new Map<string, number>()
  for (const l of lines) {
    const key = componentKey(l.slug, l.size)
    counts.set(key, (counts.get(key) ?? 0) + l.quantity)
    prices.set(key, l.unitPriceMinorUnits)
  }

  const usable = BUNDLES.map((b) => ({
    bundle: b,
    parts: b.components.map((c) => ({ key: componentKey(c.slug, c.size), quantity: c.quantity })),
  }))
    .filter(({ parts }) => parts.every((p) => prices.has(p.key)))
    .map(({ bundle, parts }) => ({
      bundle,
      parts,
      saving: parts.reduce((s, p) => s + (prices.get(p.key) ?? 0) * p.quantity, 0) - bundle.priceMinorUnits,
    }))
    .filter((b) => b.saving > 0)

  const keys = [...new Set(usable.flatMap((b) => b.parts.map((p) => p.key)))]
  const memo = new Map<string, { saving: number; picks: number[] }>()

  function best(state: number[], from: number): { saving: number; picks: number[] } {
    const id = `${from}|${state.join(',')}`
    const hit = memo.get(id)
    if (hit) return hit
    let result = { saving: 0, picks: [] as number[] }
    // Bundles are tried in a fixed order and never revisited below `from`, so each multiset of picks is searched once.
    for (let i = from; i < usable.length; i++) {
      const b = usable[i]!
      const next = [...state]
      let fits = true
      for (const p of b.parts) {
        const k = keys.indexOf(p.key)
        next[k] = (next[k] ?? 0) - p.quantity
        if ((next[k] ?? 0) < 0) fits = false
      }
      if (!fits) continue
      const rest = best(next, i)
      if (rest.saving + b.saving > result.saving) result = { saving: rest.saving + b.saving, picks: [i, ...rest.picks] }
    }
    memo.set(id, result)
    return result
  }

  const { saving, picks } = best(
    keys.map((k) => counts.get(k) ?? 0),
    0,
  )
  const applied = new Map<string, { slug: string; name: string; count: number }>()
  for (const i of picks) {
    const b = usable[i]!.bundle
    const entry = applied.get(b.slug) ?? { slug: b.slug, name: b.name, count: 0 }
    entry.count += 1
    applied.set(b.slug, entry)
  }
  return { savingMinorUnits: saving, applied: [...applied.values()] }
}
