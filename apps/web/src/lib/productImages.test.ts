import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { FULL_CATALOGUE } from '@kineris/shared'
import { PRODUCT_IMAGE_SIZES } from './product-images.generated.ts'
import { productImageSrc } from './productImages.ts'

const PUBLIC_DIR = path.resolve(import.meta.dirname, '../../public')

test('every catalogue product and size has a product image on disk', () => {
  for (const entry of FULL_CATALOGUE) {
    for (const { size } of entry.variants) {
      const src = productImageSrc(entry.slug, size)
      assert.ok(src, `no product image for ${entry.slug} ${size}; run tools/product-shots/build.py`)
      assert.ok(existsSync(path.join(PUBLIC_DIR, src)), `${src} is in the manifest but missing from public/`)
    }
  }
})

test('every product image belongs to a catalogue product and size', () => {
  const live = new Map(FULL_CATALOGUE.map((e) => [e.slug, e.variants.map((v) => v.size)]))
  for (const [slug, sizes] of Object.entries(PRODUCT_IMAGE_SIZES)) {
    assert.ok(live.has(slug), `product image for unknown catalogue slug "${slug}"`)
    for (const size of sizes) {
      assert.ok(live.get(slug)?.includes(size), `product image ${slug}-${size} has no matching catalogue size`)
    }
  }
})

test('an unknown size falls back to no image, never another strength', () => {
  assert.equal(productImageSrc('bpc-157', '20mg'), null)
  assert.equal(productImageSrc('bpc-157', '10 MG'), '/products/bpc-157-10mg.webp')
  assert.equal(productImageSrc('bpc-157'), '/products/bpc-157-5mg.webp')
  assert.equal(productImageSrc('not-a-product', '5mg'), null)
})
