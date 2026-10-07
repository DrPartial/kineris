/**
 * NOT Kineris's real catalogue. Section 7 of the instruction pack describes
 * 19 peptides + 2 lab supplies, but the actual product tables (names,
 * prices, sizes) did not survive the paste into this conversation, only
 * the section headers and surrounding notes came through, with nothing
 * between them. This is a placeholder list of real, common research-peptide
 * names (the kind UK Peptides-style suppliers typically carry) standing in
 * so the schema and seed data have something real to render against.
 *
 * Replace this file with the actual 19 + 2 before this goes anywhere near
 * production, do not assume these are the real product names or sizes.
 *
 * PT-141 is included since the pack's own text discusses it as part of the
 * range (with its own flag: "has a strong human-use association... OPEN:
 * whether it stays in the launch range"), so it's represented here too,
 * pending that same decision.
 */

export interface CatalogueEntry {
  slug: string
  name: string
  category: 'peptide' | 'lab-supply'
  sizes: string[]
}

export const PEPTIDE_CATALOGUE: CatalogueEntry[] = [
  { slug: 'bpc-157', name: 'BPC-157', category: 'peptide', sizes: ['5mg', '10mg'] },
  { slug: 'tb-500', name: 'TB-500', category: 'peptide', sizes: ['5mg', '10mg'] },
  { slug: 'ghk-cu', name: 'GHK-Cu', category: 'peptide', sizes: ['50mg', '100mg'] },
  { slug: 'semax', name: 'Semax', category: 'peptide', sizes: ['10mg', '30mg'] },
  { slug: 'selank', name: 'Selank', category: 'peptide', sizes: ['10mg', '30mg'] },
  { slug: 'epitalon', name: 'Epitalon', category: 'peptide', sizes: ['10mg', '50mg'] },
  { slug: 'mots-c', name: 'MOTS-c', category: 'peptide', sizes: ['10mg'] },
  { slug: 'cjc-1295-no-dac', name: 'CJC-1295 (no DAC)', category: 'peptide', sizes: ['2mg', '5mg'] },
  { slug: 'cjc-1295-dac', name: 'CJC-1295 (with DAC)', category: 'peptide', sizes: ['2mg', '5mg'] },
  { slug: 'ipamorelin', name: 'Ipamorelin', category: 'peptide', sizes: ['2mg', '5mg'] },
  { slug: 'tesamorelin', name: 'Tesamorelin', category: 'peptide', sizes: ['5mg', '10mg'] },
  { slug: 'hexarelin', name: 'Hexarelin', category: 'peptide', sizes: ['2mg', '5mg'] },
  { slug: 'ghrp-2', name: 'GHRP-2', category: 'peptide', sizes: ['5mg', '10mg'] },
  { slug: 'ghrp-6', name: 'GHRP-6', category: 'peptide', sizes: ['5mg', '10mg'] },
  { slug: 'pt-141', name: 'PT-141', category: 'peptide', sizes: ['10mg'] },
  { slug: 'aod-9604', name: 'AOD-9604', category: 'peptide', sizes: ['2mg', '5mg'] },
  { slug: 'igf-1-lr3', name: 'IGF-1 LR3', category: 'peptide', sizes: ['1mg'] },
  { slug: 'kisspeptin-10', name: 'Kisspeptin-10', category: 'peptide', sizes: ['5mg'] },
  { slug: 'pinealon', name: 'Pinealon', category: 'peptide', sizes: ['10mg', '50mg'] },
]

export const LAB_SUPPLY_CATALOGUE: CatalogueEntry[] = [
  { slug: 'bacteriostatic-water', name: 'Bacteriostatic Water', category: 'lab-supply', sizes: ['10ml', '30ml'] },
  { slug: 'sterile-filters', name: 'Sterile Filters (0.22µm)', category: 'lab-supply', sizes: ['pack of 10'] },
]

export const FULL_CATALOGUE: CatalogueEntry[] = [...PEPTIDE_CATALOGUE, ...LAB_SUPPLY_CATALOGUE]
