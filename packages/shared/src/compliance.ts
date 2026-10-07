/**
 * The banned-word list from the Kineris Labs instruction pack, section 2.3.
 * MHRA ignores "research use only" labels if the site reads as implying human
 * use, so this list exists to keep that language out of every page, not just
 * the obvious ones (storage/shipping copy can drift into it just as easily as
 * a product description).
 *
 * "stack" is listed in the pack specifically as "stack (as a product combo)"
 * so it's kept as a plain entry here since the checker has no way to tell that
 * sense apart from others; a flag on "stack" should be read by a human before
 * acting on it, not auto-rejected.
 *
 * Matching is exact-word/phrase, not stemmed: "muscle" will not catch
 * "muscles", the way "heal" and "healing" only both work because the pack
 * lists both forms itself. Good enough to catch deliberate or careless use
 * of the listed language, not a substitute for a human reading the copy.
 */
export const COMPLIANCE_BANNED_TERMS = [
  'dose',
  'dosage',
  'dosing',
  'inject',
  'injection',
  'injectable',
  'subcutaneous',
  'protocol',
  'cycle',
  'stack',
  'human',
  'patient',
  'user results',
  'weight loss',
  'fat loss',
  'fat burning',
  'muscle',
  'gains',
  'healing',
  'heal',
  'repair',
  'recovery',
  'anti-aging',
  'anti-ageing',
  'libido',
  'tanning',
  'sleep aid',
  'before and after',
  'testimonial',
] as const

export type ComplianceBannedTerm = (typeof COMPLIANCE_BANNED_TERMS)[number]

function escapeForRegExp(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// \b sits at the transition between a \w character and anything else (or a
// string edge), so it works the same at a space ("before and after") or a
// hyphen ("anti-aging") as it does at a plain word's own edges.
const TERM_PATTERNS: [ComplianceBannedTerm, RegExp][] = COMPLIANCE_BANNED_TERMS.map((term) => [
  term,
  new RegExp(`\\b${escapeForRegExp(term)}\\b`, 'i'),
])

/**
 * Every banned term found in `text`, in the order COMPLIANCE_BANNED_TERMS
 * lists them (not the order they appear in the text), so the stable output makes
 * this safe to assert on directly in a test or a saved admin warning.
 */
export function checkCompliance(text: string): ComplianceBannedTerm[] {
  const found: ComplianceBannedTerm[] = []
  for (const [term, pattern] of TERM_PATTERNS) {
    if (pattern.test(text)) found.push(term)
  }
  return found
}

export function isCompliant(text: string): boolean {
  return checkCompliance(text).length === 0
}
