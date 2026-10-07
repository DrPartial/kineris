/**
 * Kineris's real launch range, and only this range -- confirmed by Harvey.
 * Every name, size and price below is taken directly from that list, not a
 * placeholder. Descriptions are factual and compound-specific: what each
 * substance is and how it's classified, never an effect, benefit, or
 * application claim, and every one of them has been checked against
 * COMPLIANCE_BANNED_TERMS (pack 2.3) before being added here.
 *
 * CAS number, molecular formula and molecular weight are deliberately left
 * unset for all 16: the exact CAS depends on the specific salt/form actually
 * supplied (e.g. an acetate salt carries a different CAS than the free
 * peptide), and that should come from the real manufacturer/CoA paperwork,
 * not be guessed here. Fill these in from the real supplier data before
 * launch; see docs/PROJECT_NOTES.md.
 */

export interface CatalogueVariant {
  size: string
  priceMinorUnits: number
}

export interface CatalogueEntry {
  slug: string
  name: string
  synonyms: string[]
  description: string
  variants: CatalogueVariant[]
}

export const PEPTIDE_CATALOGUE: CatalogueEntry[] = [
  {
    slug: 'bpc-157',
    name: 'BPC-157',
    synonyms: ['Body Protection Compound-157'],
    description:
      'BPC-157 is a synthetic peptide fragment based on a sequence identified in gastric juice, studied in laboratory settings for its stability and receptor activity.',
    variants: [
      { size: '5mg', priceMinorUnits: 1695 },
      { size: '10mg', priceMinorUnits: 2995 },
    ],
  },
  {
    slug: 'tb-500',
    name: 'TB-500 (Thymosin Beta-4 acetate)',
    synonyms: ['Thymosin Beta-4 acetate', 'TB-500'],
    description:
      'TB-500 is the synthetic, shortened form of Thymosin Beta-4, a naturally occurring peptide involved in actin regulation, supplied here as an acetate salt.',
    variants: [
      { size: '2mg', priceMinorUnits: 1595 },
      { size: '5mg', priceMinorUnits: 2995 },
    ],
  },
  {
    slug: 'ghk-cu',
    name: 'GHK-Cu (copper peptide)',
    synonyms: ['Copper peptide', 'GHK-Cu'],
    description:
      'GHK-Cu is a copper-binding tripeptide (Gly-His-Lys) naturally present in plasma, studied for its role in copper transport and cellular signalling.',
    variants: [{ size: '50mg', priceMinorUnits: 2495 }],
  },
  {
    slug: 'cjc-1295',
    name: 'CJC-1295 (no DAC / Mod GRF 1-29)',
    synonyms: ['Mod GRF 1-29', 'CJC-1295 no DAC'],
    description:
      'CJC-1295 without DAC, also known as Mod GRF 1-29, is a synthetic analogue of growth hormone-releasing hormone used in laboratory research into the growth hormone axis.',
    variants: [{ size: '5mg', priceMinorUnits: 2495 }],
  },
  {
    slug: 'ipamorelin',
    name: 'Ipamorelin',
    synonyms: [],
    description:
      'Ipamorelin is a selective pentapeptide and ghrelin receptor agonist, studied for its targeted activity at the growth hormone secretagogue receptor.',
    variants: [{ size: '5mg', priceMinorUnits: 1995 }],
  },
  {
    slug: 'sermorelin',
    name: 'Sermorelin acetate',
    synonyms: ['Sermorelin'],
    description:
      'Sermorelin is a 29-amino-acid fragment of growth hormone-releasing hormone, supplied as an acetate salt for research into growth hormone secretion pathways.',
    variants: [{ size: '5mg', priceMinorUnits: 2795 }],
  },
  {
    slug: 'tesamorelin',
    name: 'Tesamorelin',
    synonyms: [],
    description:
      'Tesamorelin is a synthetic analogue of growth hormone-releasing hormone, modified for increased stability, used in laboratory studies of the growth hormone axis.',
    variants: [
      { size: '2mg', priceMinorUnits: 2795 },
      { size: '10mg', priceMinorUnits: 5495 },
    ],
  },
  {
    slug: 'igf-1-lr3',
    name: 'IGF-1 LR3',
    synonyms: ['Long R3 IGF-1'],
    description:
      'IGF-1 LR3 is a long-acting analogue of insulin-like growth factor 1, engineered with an extended amino acid sequence for prolonged activity in research settings.',
    variants: [{ size: '1mg', priceMinorUnits: 5495 }],
  },
  {
    slug: 'mots-c',
    name: 'MOTS-c',
    synonyms: [],
    description:
      'MOTS-c is a mitochondrial-derived peptide encoded within the mitochondrial genome, studied for its role in metabolic signalling pathways.',
    variants: [{ size: '10mg', priceMinorUnits: 2995 }],
  },
  {
    slug: 'nad',
    name: 'NAD+',
    synonyms: ['Nicotinamide adenine dinucleotide'],
    description:
      'NAD+ (nicotinamide adenine dinucleotide) is a coenzyme present in all living cells, central to redox reactions and cellular energy metabolism, supplied here for laboratory research.',
    variants: [{ size: '500mg', priceMinorUnits: 5995 }],
  },
  {
    slug: 'epitalon',
    name: 'Epitalon',
    synonyms: ['Epithalon'],
    description:
      'Epitalon is a synthetic tetrapeptide (Ala-Glu-Asp-Gly) based on the naturally occurring peptide epithalamin, studied for its interaction with telomerase activity.',
    variants: [{ size: '10mg', priceMinorUnits: 1950 }],
  },
  {
    slug: 'selank',
    name: 'Selank',
    synonyms: [],
    description:
      'Selank is a synthetic heptapeptide analogue of the immunomodulatory peptide tuftsin, studied in neuropharmacological research.',
    variants: [{ size: '5mg', priceMinorUnits: 1595 }],
  },
  {
    slug: 'semax',
    name: 'Semax',
    synonyms: [],
    description:
      'Semax is a synthetic heptapeptide derived from a fragment of adrenocorticotropic hormone, studied for its activity in the central nervous system.',
    variants: [{ size: '5mg', priceMinorUnits: 1895 }],
  },
  {
    slug: 'dsip',
    name: 'DSIP',
    synonyms: ['Delta Sleep-Inducing Peptide'],
    description:
      'DSIP (Delta Sleep-Inducing Peptide) is a naturally occurring nonapeptide first isolated from rabbit brain tissue, studied for its neuromodulatory activity.',
    variants: [{ size: '5mg', priceMinorUnits: 1395 }],
  },
  {
    slug: 'thymosin-alpha-1',
    name: 'Thymosin Alpha-1',
    synonyms: ['Ta-1'],
    description:
      'Thymosin Alpha-1 is a synthetic 28-amino-acid peptide derived from the thymus-associated protein prothymosin alpha, studied for its interaction with immune signalling pathways.',
    variants: [{ size: '5mg', priceMinorUnits: 2995 }],
  },
  {
    slug: 'pt-141',
    name: 'PT-141 (Bremelanotide)',
    synonyms: ['Bremelanotide', 'PT-141'],
    description:
      'PT-141, also known as Bremelanotide, is a synthetic cyclic heptapeptide analogue of alpha-melanocyte-stimulating hormone, studied for its activity at melanocortin receptors.',
    variants: [{ size: '10mg', priceMinorUnits: 2095 }],
  },
]

export const FULL_CATALOGUE: CatalogueEntry[] = PEPTIDE_CATALOGUE
