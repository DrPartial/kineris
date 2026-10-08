# Kineris Labs, project notes

What was built in this first local pass, every OPEN item from the instruction pack and the
default chosen for it, and what's deliberately not done yet. Read this before showing the site to
Sean or Connor, and update it as real decisions replace these defaults.

## The product catalogue is real (as of October 2026)

`packages/shared/src/catalogue.ts` holds Kineris's actual 16-product launch range, confirmed by
Harvey, this and only this. Names, sizes and GBP prices are taken directly from his list, not
placeholders. Product descriptions are real copy, checked against `COMPLIANCE_BANNED_TERMS`
before being added.

**CAS number, molecular formula, and molecular weight are still deliberately unset for every
product.** The exact CAS depends on the specific salt/form actually supplied (an acetate salt
carries a different CAS than the free peptide), so guessing one and presenting it as fact would
be worse than leaving it blank. Fill these in from the real manufacturer/CoA paperwork before
launch, the Specifications tab already renders whatever fields are present and skips the rest.

Purity (`≥98% (HPLC)`) and storage conditions remain the standard spec claim common across
the research-peptide supply industry, not a batch-specific result, that distinction already
exists architecturally: `ProductVariant.purity` is the general spec, `Batch.purity` is the real,
per-batch tested figure (or an honest "pending" state) shown on the CoA card.

## Every OPEN item from the pack, and the default taken

| Pack section | OPEN item | Default taken here |
| --- | --- | --- |
| 2.5 | CoA source: independent lab vs. supplier | Neither assumed; the CoA block (product page + Quality page) shows a placeholder note either way, no lab name hardcoded. |
| 5 | Low-stock threshold | 5 units, editable per product in admin (`lowStockThreshold` field). |
| 6 | Exact shipping prices, carriers, cut-off time, free-shipping threshold | Two placeholder Royal Mail Tracked options in `packages/shared/src/shipping.ts`, prices clearly fake. |
| 7 | Per-product sizes/prices | **Resolved October 2026**: real values from Harvey's launch-range list, see above. CAS/formula/weight remain open, need real supplier data. |
| 7 | Whether PT-141 stays in the launch range | **Resolved October 2026**: yes, it's on Harvey's real list. |
| 7 | Bundle names, whether bundles get a discount | No bundles seeded yet (the real bundle list didn't survive the paste either); admin can create bundles, default is no automatic bundle discount, matching the pack's own stated default. |

## Stack and what's running where

- `apps/web` (port 3000): the storefront, Next.js App Router.
- `apps/backend` (port 4000): the API, Fastify + Prisma + PostgreSQL.
- `apps/admin` (port 3002): the admin panel, Next.js App Router, separate auth from the storefront.
- `packages/shared`: types, the analytics event-name constants, the compliance word-checker, the
  placeholder catalogue, and shipping options, shared by the other three.

One language (TypeScript) throughout, unlike the Go backend used elsewhere, since this is a much
smaller store and a single language keeps a mostly-solo build simple. Flagged in case backend
language parity with that other project is wanted instead; nothing here makes switching hard, the
API surface is the contract, not the language it's written in.

## What's deliberately not done yet

- **Real Stripe payments.** Checkout creates a real order and decrements real stock, but no payment
  is actually taken, there's no live/test Stripe key yet. See `apps/backend/src/routes/orders.ts`'s
  own comment on exactly where a real PaymentIntent would need to go before the order/stock commit,
  not after.
- **Google / Apple sign-in.** Email and password only. Pack section 8 lists both as required;
  flagged rather than faked.
- **Cloud file storage.** CoA PDFs and any future product imagery save to
  `apps/backend/uploads/` on disk. Fine for local dev, not for a real deploy.
- **Real shipping carrier integration.** The two shipping options at checkout are flat placeholder
  prices, not a live Royal Mail Click & Drop rate lookup.
- **Analytics providers.** The five shared event names from pack section 4 (`view_item`,
  `add_to_cart`, `begin_checkout`, `purchase`, `sign_up`) exist as constants in
  `packages/shared/src/analytics.ts`, and the right call sites are commented with where they'd
  fire, but no PostHog/GA4/Meta SDK is installed, so nothing is actually being tracked yet.
- **Dark mode.** The storefront and admin are light-mode only. The brief asks for "clinical,
  precise and trustworthy," which one considered palette serves better than a half-built second
  theme; revisit if that changes.
- **Logo and visual polish.** Both deliberately deferred, Harvey's own call, logo to be done
  separately once this foundation is approved.
- **The automated compliance word-check CI pass the pack mentions ("we'll build an automated check
  for these later").** The checker itself (`packages/shared/src/compliance.ts`) is built and wired
  into the admin's product-save path (name, synonyms, form, storage conditions are checked before
  saving, section 2.3), with its own test suite confirming every banned word is caught. What's not
  built yet is a CI step that scans the whole site's copy on every change, that's a GitHub-stage
  concern once this is pushed anywhere.

## Local setup

```sh
# once
brew install postgresql@16
brew services start postgresql@16
createdb kineris

pnpm install

cp apps/backend/.env.example apps/backend/.env   # fill in DATABASE_URL if different
cp apps/web/.env.example apps/web/.env.local
cp apps/admin/.env.example apps/admin/.env.local

pnpm db:migrate
pnpm db:seed

pnpm dev   # starts backend:4000, web:3000, admin:3002 together
```

Seeded admin login: `admin@kineris.local` / `change-me-now`, change this before anyone else gets
the admin URL.

## Verification run on this pass

- `pnpm --filter @kineris/shared test`: compliance checker and its edge cases.
- `pnpm --filter @kineris/backend test`: the bundle-stock derivation (pack 5's draw-down rule).
- Backend, storefront and admin all typecheck.
- Full local run: home, shop, a product page, cart, checkout (blocked until both RUO declarations
  are ticked), order confirmation, account sign-up/sign-in/order history, the Quality page's batch
  lookup, and the admin dashboard/products/orders/discount-codes/bundles screens, all exercised
  against the seeded placeholder catalogue.

## Trust/CoA rebuild pass (October 2026)

Prompted by an AI audit benchmarking the storefront against a US competitor. Rebuilt the
homepage, product page, and Quality/CoA page around real, computed trust data instead of
invented claims, and closed the old CoA "available on request" dead end. Specifics:

- `Batch` gained `purity` and `reportedAt` fields (per-batch, not per-product), via migration
  `20261007175157_add_batch_coa_fields`. The admin batch-upload form now has inputs for both.
- New public endpoints: `GET /api/coas` (every current batch, for the Quality page's "Recent
  CoAs" feed) and `GET /api/stats` (compound count, average purity, fastest dispatch label, all
  computed live from the database/shared config, never hardcoded; a stat is simply omitted from
  the homepage if there's no real data behind it yet).
- **`apps/backend/prisma/fixtures/sample-coa.pdf`** is a dev-only fixture: a hand-built PDF
  watermarked "SAMPLE CERTIFICATE OF ANALYSIS, PLACEHOLDER, NOT A REAL LABORATORY RESULT,"
  attached by the seed script to exactly one product's batch so the fully-populated CoA card UI
  is visible locally. **Delete this fixture and stop seeding it before any production deploy**,
  every other batch correctly shows the honest "CoA pending" state instead.
- Trust-bar and badge copy is deliberately restricted to what's true today: "Batch & lot
  tracked," "Certificate of Analysis per batch," "UK dispatch," "RUO checkout declaration." It
  does **not** claim "Independent Lab Verified" or name a testing lab, since the pack's own OPEN
  item (whether CoAs come from an independent lab or the supplier) is still unresolved, and the
  Quality page's placeholder note about it was kept rather than replaced with an invented
  methodology section.
- Deferred to a follow-up (per Harvey's own scope call, not built in this pass): QR-code batch
  verification labels, a solution-concentration calculator, a downloadable per-product "Research
  Packet" PDF, and a bundle comparison table. The `/quality?batch=` deep-link (for a future QR
  code to point at) and a "tested N days ago" freshness line on every CoA card were built now,
  since both were cheap and needed no new page.
- No Lighthouse/Core Web Vitals score was run, since no browser automation tool was available in
  this session. Treat performance/SEO scoring as unverified until someone runs it by hand.

## Brand system applied (October 2026)

Applied the Kineris brand kit (`~/Desktop/kineris-brand-kit`) across both `apps/web` and
`apps/admin`: palette (Pine Ink/Bone/Jade/Ember/Sage Mist/Stone), Sora (headings) + Manrope
(body) via `next/font/google`, the three-petal logo, and the 8/12/20px flat shape language.

- Both apps' `globals.css` define the raw palette plus the same semantic token names the
  codebase already used (`--color-ink`, `--color-accent`, etc.), so every component that
  already referenced a token picked up the rebrand automatically, with zero hardcoded hex found
  anywhere in `apps/*/src` to fix.
- The footer is the one deliberately dark surface (Harvey's call over the light-footer
  alternative), Pine Ink background with the reversed logo. Built via a new `.on-dark` class in
  `globals.css` that flips the ink/border/accent tokens for its descendants, rather than
  threading a dark-mode prop through `TrustIconRow`.
- **Caught and fixed two guide violations before they shipped**: the brand guide explicitly bans
  gradients and drop shadows, but `ImagePlaceholder` had a gradient background and
  `CookieConsentBanner` had a shadow, both left over from before the brand kit existed, now flat.
- **Caught and fixed a real contrast failure**: Ember as a text color on a light background is
  about 2.9:1, below the 4.5:1 the guide itself requires. Fixed by using Ember only as a
  background fill with Pine Ink text instead (the "Only N remaining" stock badge and the
  `WELCOME10` code chip), per the guide's own "Bone/Ember/Sage Mist carry Pine Ink text" rule.
  Every other palette pairing actually used on the site (Jade+Bone text, Pine Ink+Bone, Stone on
  Bone) passes 4.5:1 or better.
- Radius tokens (`--radius-sm/md/lg` = 8/12/20px) are remapped once in `@theme`, so every
  existing `rounded-sm` class sitewide picked up 8px automatically. Card-level containers
  (`ProductCard`, `COACard`, homepage section cards) and the large `ImagePlaceholder` panels were
  then individually promoted to `rounded-md`/`rounded-lg` to match the guide's small-control vs.
  card vs. large-panel distinction; this pass wasn't exhaustive across every one of the ~29 files
  using `rounded-sm`, just the highest-visual-impact ones.
- Favicons use Next's file-convention (`app/icon.svg`, `app/apple-icon.png`), auto-wired with no
  manual `<head>` editing.
- Incidental fix while verifying the homepage visually: `StatCounter` sized every stat the same
  large display size, which was fine for "21" and "98%" but made a worded stat ("Next working
  day") wrap across three lines. It now uses a smaller, non-monospace size for longer values.

## Accounts, order status, checkout equality, and promotions (October 2026)

Harvey pasted a very detailed spec for mobile nav, an account modal, order status/tracking,
equal-weight checkout options, and a promotions system with a gated WELCOME10 flow. It was
written against an idealized stack (Payload CMS, Stripe, Google/Apple OAuth, Klaviyo/Resend, a
block-based A/B page builder) that doesn't exist here. Everything below was translated onto the
real stack (Fastify + Prisma + Next, no OAuth, no email provider, no block system) rather than
built against the imagined one.

- **`DiscountCode` was extended in place, not replaced with a parallel "Promotion" model** --
  it already was that collection (code + percent/amount off, wired into checkout), it just
  needed usage-limit/validity-window/status fields. New `DiscountRedemption` (makes per-customer
  and total caps actually enforceable, gives a real redemption count) and `WelcomeSubscriber`
  (the arrival-modal flow's subscriber record) models sit alongside it.
- **The WELCOME10 arrival flow issues a real per-subscriber code** (`WELCOME10-XXXXX`, bound to
  that one email via `restrictedToEmail`), not the old publicly-readable static string -- a code
  visible in page source can't actually be single-use. The code is never returned over the API,
  only "we've sent it" -- verified directly against the database during this pass, not just
  trusted. The general `WELCOME10` code on the homepage CTA still exists for anyone who doesn't
  want to leave an email, now reached through a button that opens the gated modal rather than
  shown as plaintext.
- **A bad discount code now rejects the whole order** (specific reason: not found / inactive /
  expired / usage limit reached / minimum order not met / restricted to a different email),
  replacing the old silent fall-through to zero discount, which would have charged full price
  without ever telling the customer why.
- **`OrderStatus` deliberately has no "Processing"/"Pending payment" state.** With no real Stripe
  webhook wired up, nothing would ever set one, so it would be a fake, unreachable status.
  `delivered` and `refunded` were added instead, since both are real, admin-settable actions.
- **Google/Apple sign-in render as visibly disabled "(coming soon)" buttons**, present but inert,
  since no OAuth app registration exists yet. `@fastify/rate-limit` was added (new dependency)
  and applied only to the three real enumeration/abuse surfaces (order-status lookup,
  welcome-signup, discount-code validation), not site-wide.
- **Not built**: a block-based A/B testing page system (no such architecture exists in this
  project; retrofitting one is a separate, much larger undertaking than this task), real
  OAuth, and real email sending for the welcome/dispatch flows (both stubbed with a log line,
  same convention as the existing dispatch-email hook).
- **A real, if indirect, UI bug was caught and fixed along the way**: the header's right-side
  icon cluster (search + Account + Cart) no longer fit next to the enlarged logo at narrow
  mobile widths, and `TrustIconRow`'s flex/grid items had no `min-w-0`, so a long label like
  "Certificate of Analysis per batch" could refuse to shrink. Both fixed; verified against a
  real mobile viewport via Chrome DevTools Protocol with proper device-metrics emulation, not
  the plain `--screenshot --window-size` CLI flag, which does not reflow text the way a real
  mobile viewport does and produced a misleading "overflow" artifact that cost real time to
  rule out during this pass.

## Real launch catalogue replaces the placeholder (October 2026)

Harvey supplied Kineris's actual 16-product launch range (name, size, price for each), and said
explicitly: this and only this. `packages/shared/src/catalogue.ts` was rewritten around it;
`Product` gained a `description` field (migration `20261007212838_add_product_description`),
and every description was written fresh and checked against `COMPLIANCE_BANNED_TERMS`
programmatically, not just read over, before being added.

- `apps/backend/prisma/seed.ts` now prunes anything not in the real range on every run: the 10
  placeholder products that didn't make the list (both CJC-1295 variants, Hexarelin, GHRP-2,
  GHRP-6, AOD-9604, Kisspeptin-10, Pinealon, and the two lab-supply placeholders) are gone from
  local dev, along with their test orders/variants/batches. **Caught and fixed twice while
  verifying this**: the seed script's `upsert` only ever adds or updates fields it's given, so a
  product kept across catalogue versions (e.g. Epitalon, which used to list a 50mg size that
  isn't real) silently kept its old variant sizes and its old fake CAS/formula values sitting
  right next to the new real ones, until the script was changed to explicitly prune stale
  variant sizes and null out CAS/formula/weight on every reseed, not just on create.
- The `lab_supply` category stays in the schema (nothing to gain from ripping out working
  infrastructure), it just has zero products in it for now, same as the already-built `Bundles`
  tab. Both read as empty on the storefront rather than being hidden.
- No CAS numbers, molecular formulas, or molecular weights were filled in, on purpose, see the
  top of this file for why.

## Product page images (October 2026)

One vial image per SKU (19 images, 16 products) in `apps/web/public/products/`, named
`<slug>-<size>.webp` (1200x1200, white, square to fit the `aspect-square` slots). Tooling lives in
`tools/product-shots/` (see its README); editing `products.json` and re-running regenerates
everything, including `apps/web/src/lib/product-images.generated.ts`, the manifest the site reads.

- The glass/cap is an AI-generated (Higgsfield) vial with a blank label; **all label text is
  typeset from the real brand fonts and logo**, never AI-generated, so every SKU is identical in
  layout and spelling.
- The labels carry no purity claim and no "human" wording, per the compliance rules above.
- **Wired into the site**: `ProductCard` shows the cheapest size's vial; the product page shows the
  vial for the *selected* size (shared state via `VariantSelection.tsx`, since the label prints the
  strength). A product or size without a matching photo falls back to `ImagePlaceholder` rather
  than showing another strength's label.
- **Images are keyed by the catalogue's slug + size**, so `tools/product-shots/products.json` must
  match `packages/shared/src/catalogue.ts`. `apps/web/src/lib/productImages.test.ts` fails if any
  catalogue product/size has no image (or an image has no catalogue entry), so adding a product or
  size without regenerating the shots is caught by `pnpm --filter @kineris/web test`.
- Verified by running the real storefront against a mock of the product API built from the real
  catalogue (Postgres wasn't available): shop grid, product page, size-switch image swap, the
  placeholder fallback and a 390px mobile viewport all behaved, with no horizontal overflow.

## Home page rebuild (October 2026)

Rebuilt `apps/web/src/app/page.tsx` around cinematic footage generated with Higgsfield from the real
vial renders. Flow: full-bleed looping hero video (trust strip as a bar along its bottom), big
evenly aligned stats, the range (8 product cards), a "one vial, one batch, one record" macro
section, a Certificate-of-Analysis section beside a lab-bench still, the three-step flow, and the
10% offer card. All copy is the site's existing, already-approved wording (no new claims) and was
run through `checkCompliance`.

- **Assets** (`apps/web/public/home/`): `hero-1080.mp4` (666 KB) and `hero-720.mp4` (224 KB), an
  8 s loop (start and end frame identical), plus `hero-poster.webp` (frame 0 of the video, so the
  still-to-motion hand-off is invisible), `macro.webp` and `lab.webp`.
- **Hero behaviour** (`components/home/HeroVideo.tsx`): the video is requested only after mount,
  720p on phones, 1080p otherwise, and not at all for visitors with `prefers-reduced-motion` (they
  keep the poster). Below `lg` the footage is a band at the top with the text on solid dark under it
  (overlaying text on the vials was unreadable on phones). The tint over the footage is flat, per
  the brand kit's no-gradient rule.
- **Imagery rules kept**: objects only, no people or lifestyle scenes (pack 2.4).
- **Text in generated scenes is checked, not trusted.** Nano Banana keeps the real labels remarkably
  well, but tiny print can slip. Every frame used was inspected at 100%: the hero's sharp front vial
  reads exactly (kineris, LYOPHILISED POWDER, BPC-157, 10 mg, FOR RESEARCH USE ONLY; the second
  vial is defocused by design). Two generated scenes were **rejected for misspelled micro-text**
  ("LYOPHILISES", "aestate", "LYOPHILIJSED"): a six-vial range lineup and a pedestal shot. Any new
  scene needs the same 100% check on every visible label before it ships.
- **Pipeline note**: this environment's network policy blocks Higgsfield's upload host, so reference
  images were imported by URL instead (`media_import_url` on the raw GitHub URLs of the product
  images in this public repo). Output downloads work normally.
- **Check before launch**: the stat strip is computed live, but two of its inputs are still
  placeholders. "Avg. purity, current batches" averages the seeded batch purities (placeholder
  values such as 98.4%), and "Fastest UK dispatch: Next working day, guaranteed by 1pm" comes from the
  placeholder shipping config (it describes a Royal Mail Special Delivery *delivery* guarantee, not
  dispatch). Neither should go live until it is backed by real CoA and carrier data.
- **Verified** against a mock of the product API built from the real catalogue (Postgres wasn't
  available): desktop 1440, mobile 390, reduced-motion, no horizontal overflow, no console errors.
  The sandbox's Chromium cannot decode H.264, so playback was proven with a temporary VP9 stand-in
  (desktop gets the 1080p file, mobile the 720p, time advances); the shipped H.264 files themselves
  (yuv420p, faststart) were not decoded in a browser here, so give the hero one look in Chrome and
  Safari.

## Sign-out bug fix (October 2026)

Every bodyless POST/PATCH call through the shared `api()` wrapper (`apps/web/src/lib/api.ts` and
`apps/admin/src/lib/api.ts`) was broken: it unconditionally sent `Content-Type: application/json`
even with no request body, and Fastify's default JSON parser rejects that combination
(`FST_ERR_CTP_EMPTY_JSON_BODY`, a 400). Reported as "sign out isn't working," reproduced in a real
browser rather than just read in code (curl without an explicit Content-Type header had been
masking it during earlier verification passes), and traced to the real root cause rather than
patched at the call site.

Affected every bodyless call, not just sign-out: customer sign-out, admin sign-out, admin "Mark
delivered," admin "Mark refunded," and the promotions "End now" action. Fixed once in both copies
of `api()`: the `Content-Type` header is now only set when `init.body` is actually present. All
five call sites were re-verified live (sign-out through a real browser click via CDP for both the
storefront and admin app; the other three via a direct request matching the fixed client's
headers), not just assumed fixed because the code looked right.

## Cart count and cart images (October 2026)

Two issues reported together: the header kept showing "Cart (1)" with nothing in the actual cart,
and cart lines had no product image.

- **Root cause of the count bug**: `CartContext` persists raw `{variantId, quantity}` lines to
  localStorage with no server-side validation, ever. The cart *page* already resolved lines
  against real fetched products and silently dropped anything that didn't match (left over from a
  deleted product or an old catalogue swap), but the header's count was computed straight from the
  raw localStorage lines, with no such check -- so a stale line from before the real-catalogue
  cutover kept counting in the header forever while the cart page correctly showed empty.
- **Fix**: `CartContext` now fetches the real product list once after hydration and prunes any
  line whose variant no longer exists, persisting the cleaned-up cart back to localStorage. Every
  reader of `lines` (header, bottom nav, cart page, checkout) now agrees on the same real count,
  instead of the cart page being the only place that got it right. A failed fetch never wipes the
  cart, it only prunes on a confirmed product list.
- **Cart images**: `apps/web/src/app/cart/page.tsx` now renders each line's `ProductImage` (the
  same component the shop grid and product page already use), falling back to the branded
  placeholder for anything without photography.
- Verified live: injected a stale variant id into localStorage via Chrome DevTools Protocol,
  confirmed the header showed the correct count after the prune and the bad entry was gone from
  localStorage; added a real item through the UI and confirmed its photo renders on the cart page.
