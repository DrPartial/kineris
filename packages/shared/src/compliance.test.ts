import assert from 'node:assert/strict'
import test from 'node:test'
import { checkCompliance, COMPLIANCE_BANNED_TERMS, isCompliant } from './compliance.ts'

test('every banned term in the pack is caught on its own', () => {
  for (const term of COMPLIANCE_BANNED_TERMS) {
    const found = checkCompliance(`Example copy mentioning ${term} in context.`)
    assert.ok(found.includes(term), `expected "${term}" to be flagged`)
  }
})

test('matching is case-insensitive', () => {
  assert.deepEqual(checkCompliance('For HUMAN use only, never.'), ['human'])
})

test('a hyphenated term is still caught at a string edge', () => {
  assert.ok(checkCompliance('anti-aging formula').includes('anti-aging'))
  assert.ok(checkCompliance('Anti-Ageing').includes('anti-ageing'))
})

test('multi-word phrases are matched as phrases, not just their first word', () => {
  const found = checkCompliance('See our before and after gallery.')
  assert.ok(found.includes('before and after'))
})

test('factual, compliant copy passes clean', () => {
  const copy =
    'BPC-157, 5mg, lyophilised powder, purity ≥98% by HPLC, CAS 137525-51-0, ' +
    'store at -20°C, Batch KL-2026-014, Certificate of Analysis available.'
  assert.equal(isCompliant(copy), true)
  assert.deepEqual(checkCompliance(copy), [])
})

test('a longer word sharing a banned term\'s prefix is not falsely flagged', () => {
  // "human" must not fire inside an unrelated word like "humanity".
  assert.deepEqual(checkCompliance('A note on humanity and research ethics.'), [])
})

test('matching is exact-word, not stemmed: a plain plural is not caught', () => {
  // Documents the known limitation from compliance.ts's own doc comment,
  // so a future change to that behavior shows up here as a deliberate choice.
  assert.deepEqual(checkCompliance('Supports muscles in culture.'), [])
})
