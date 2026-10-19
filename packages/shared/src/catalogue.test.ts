import assert from 'node:assert/strict'
import test from 'node:test'
import { BUNDLES, bundleSavings, bundleSinglesTotalMinorUnits, FULL_CATALOGUE, type PricedCartLine } from './catalogue.ts'
import { checkCompliance } from './compliance.ts'

const price = (slug: string) => FULL_CATALOGUE.find((e) => e.slug === slug)!.variants[0]!.priceMinorUnits
const line = (slug: string, size: string, quantity: number): PricedCartLine => ({ slug, size, quantity, unitPriceMinorUnits: price(slug) })

test('the launch range is the 6 SKU catalogue', () => {
  assert.deepEqual(
    FULL_CATALOGUE.map((e) => e.slug),
    ['bpc-157', 'tb-500', 'ghk-cu', 'kpv', 'ss-31', 'bacteriostatic-water'],
  )
})

test('product copy passes the compliance word check', () => {
  for (const e of FULL_CATALOGUE) {
    for (const text of [e.name, e.description, e.researchArea, ...e.synonyms, e.specs.form, e.specs.storageConditions]) {
      assert.deepEqual(checkCompliance(text), [], `${e.slug}: "${text}"`)
    }
  }
})

test('every bundle is cheaper than its singles and only uses catalogue vials', () => {
  for (const b of BUNDLES) {
    for (const c of b.components) {
      assert.ok(FULL_CATALOGUE.find((e) => e.slug === c.slug)?.variants.some((v) => v.size === c.size), `${b.slug}: ${c.slug} ${c.size}`)
    }
    assert.ok(b.priceMinorUnits < bundleSinglesTotalMinorUnits(b), b.slug)
  }
})

test('five BPC-157 vials get the 5-pack price', () => {
  assert.equal(bundleSavings([line('bpc-157', '5mg', 5)]).savingMinorUnits, 480)
  assert.equal(bundleSavings([line('bpc-157', '5mg', 4)]).savingMinorUnits, 0)
})

test('one of each in the trio gets the trio price', () => {
  const r = bundleSavings([line('bpc-157', '5mg', 1), line('tb-500', '2mg', 1), line('ghk-cu', '50mg', 1)])
  assert.equal(r.savingMinorUnits, 290)
  assert.deepEqual(r.applied.map((a) => a.slug), ['bpc-157-tb-500-ghk-cu-trio'])
})

test('the best combination wins, never a worse first match', () => {
  // 5 + 5 qualifies for the combo bundle (1455) or two 5-packs (480 + 480); the customer gets the larger saving.
  const r = bundleSavings([line('bpc-157', '5mg', 5), line('tb-500', '2mg', 5)])
  assert.equal(r.savingMinorUnits, 1455)
  assert.deepEqual(r.applied.map((a) => a.slug), ['bpc-157-tb-500-bundle'])
  // With one more BPC-157 vial the extra vial stays a single; the trio needs a GHK-Cu.
  assert.equal(bundleSavings([line('bpc-157', '5mg', 6), line('tb-500', '2mg', 5)]).savingMinorUnits, 1455)
})

test('vials outside any bundle get no saving', () => {
  assert.equal(bundleSavings([line('kpv', '10mg', 3), line('bacteriostatic-water', '10ml', 2)]).savingMinorUnits, 0)
})
