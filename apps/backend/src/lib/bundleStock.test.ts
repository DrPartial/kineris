import assert from 'node:assert/strict'
import test from 'node:test'
import { availableBundleCount, isBundleInStock } from './bundleStock.ts'

test('available count is the floor of the scarcest component', () => {
  const components = [
    { variantId: 'a', quantity: 1, variantStock: 10 },
    { variantId: 'b', quantity: 2, variantStock: 9 }, // floor(9/2) = 4
    { variantId: 'c', quantity: 1, variantStock: 20 },
  ]
  assert.equal(availableBundleCount(components), 4)
})

test('any component at zero makes the whole bundle unavailable', () => {
  const components = [
    { variantId: 'a', quantity: 1, variantStock: 5 },
    { variantId: 'b', quantity: 1, variantStock: 0 },
  ]
  assert.equal(availableBundleCount(components), 0)
  assert.equal(isBundleInStock(components), false)
})

test('a bundle with no components is never in stock', () => {
  assert.equal(availableBundleCount([]), 0)
  assert.equal(isBundleInStock([]), false)
})

test('a component needing more than one vial per bundle rounds down, not up', () => {
  // 7 vials in stock, 3 needed per bundle -> 2 complete bundles, not 3.
  const components = [{ variantId: 'a', quantity: 3, variantStock: 7 }]
  assert.equal(availableBundleCount(components), 2)
})
