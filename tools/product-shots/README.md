# Product shots

Generates the vial images used on product pages (`apps/web/public/products/<slug>-<size>.webp`,
1200x1200, white background, square to match the `aspect-square` image slots).

```sh
python3 tools/product-shots/build.py                 # every SKU in products.json
python3 tools/product-shots/build.py bpc-157 pt-141  # only these slugs
```

Needs Python 3 with `Pillow` and `numpy`, plus a Chromium (`CHROME_PATH`, or auto-detected).

## How it works

The vial is an AI-generated studio photo (`assets/vial-plate.png`, made with Higgsfield) with a
**blank** label. AI models mangle small text, so no label text is AI-generated. `build.py`:

1. typesets a flat label in headless Chromium using the real Sora/Manrope fonts and the real
   Kineris logo lockup (brand kit colours: Pine Ink / Bone / Jade / Ember / Stone),
2. wraps it around the plate with a cylindrical map so type foreshortens toward the glass edge,
3. takes the plate's own lighting for shading and sheen, so the print reads as on the glass,
4. crops square and writes WebP.

## Adding or changing a product

Edit `products.json` (`name` is one string per line, `sub` is the optional line under the name,
`sizes` makes one image per size) and re-run. The label region coordinates in `build.py`
(`X0/X1/Y0/Y1`) are measured on this specific plate; if the plate is replaced, re-measure them.

## Keeping it in sync with the catalogue

Image filenames use the catalogue's slug and size (`packages/shared/src/catalogue.ts`), so
`products.json` must list the same slugs and sizes. `pnpm --filter @kineris/web test` checks both
directions (every catalogue size has an image, every image has a catalogue entry) and fails if they
drift. `name` and `sub` in `products.json` are the label wording only, they can differ from the
catalogue's longer display names.

## Label rules

- No purity or "99%" claims on the label: the site only states what a batch CoA backs up.
- No "human" wording (banned by `packages/shared/src/compliance.ts`), the label says
  "For research use only".
- "Lyophilised powder" is printed on every label; confirm it is true for the whole range.
