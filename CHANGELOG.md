# Cally Wear QA Remediation CHANGELOG

All architectural decisions, merge/reconciliation choices, and code changes are documented here for traceability.

## Phase 0 — Data Layer Audit & Consolidation (P0)

### [2026-09-06] Consolidated product catalog to Prisma DB as single canonical source

**Decision:** Migrated all product data from the static seed array in `lib/data/products.ts` into the Prisma database. All UI surfaces now query through the Prisma `db.product.findMany` / `findUnique` layer.

**Changes made:**
- Updated `prisma/schema.prisma` Product model: added `gender` enum (`MEN`, `WOMEN`, `UNISEX`), made `category` an enum (`SNEAKERS`, `SLIDES`, `BOOTS`, `SANDALS`, `RUNNING`, `STREETWEAR`), added `isActive` boolean field, validated `salePrice <= basePrice` constraint at application layer.
- Replaced `lib/data/products.ts` static seed catalog with a thin Prisma adapter layer (`lib/data/products.ts` now wraps `db.product` queries).
- Reconciled duplicate product identities:
  - "Cally Apex Tech Runner" (homepage: `cally-apex-tech-runner`, ₹6,999) and "Cally Apex Tech Runner" (men's catalog: `cally-apex-tech-runner`, ₹7,999/₹9,499) → merged into single DB record, keeping most recently updated price (₹7,999 base / ₹9,499 compare-at, on sale).
  - Removed 4× duplicates of "Velocity Phantom X", "Matrix Lowtop Neon", "Cyberboot High Tactical" from DB — kept most complete record, reassigned relations before deleting duplicates.
  - Re-categorized "Solstice Slide Pro" from miscategorized to `SLIDES`, "Terraform Hiker Boot" to `BOOTS`.
- Built one data-access layer in `lib/data/products.ts` exposing: `getAllProducts()`, `getProductBySlug()`, `getProductsByCategory()`, `getFeaturedProducts()`, `getNewArrivals()`, `getBestSellers()`.
- Every page, component, and API route now imports from `lib/data/products.ts` — no page defines its own product list independently.
- Added route integrity check: `npm run check:routes` script that validates every product's `/products/[slug]` resolves.

**Verification:** `getAllProducts()` now returns a deduplicated set where every `slug` is unique and every product has exactly one price.

### [2026-09-06] Updated Prisma schema with enums and new fields

**Changes:**
- Added `category` enum: `SNEAKERS | SLIDES | BOOTS | SANDALS | RUNNING | STREETWEAR`
- Added `gender` enum: `MEN | WOMEN | UNISEX`
- Added `isActive` boolean (inactive products excluded from listings but detail pages can 410/redirect gracefully)
- Added `currency` String default `INR`
- Added validation: `salePrice <= basePrice` at application layer
- Updated `ProductStatus` — kept `DRAFT | PUBLISHED | ARCHIVED`

### [2026-09-06] Built migration/reconciliation script

**Script:** `prisma/migrate-reconcile.js` (one-time)
- Detects same-name products with different prices/slugs and merges them
- Detects and removes literal duplicate rows
- Keeps most recently updated record's price on merge
- Reassigns relations (images, collection links) before deleting duplicates
- Logs every merge decision in CHANGELOG.md

---

## Phase 1 — Routing Integrity (P0)

### [2026-09-06] Verified all product cards resolve to real detail pages

**Verified products:** Phantom Retro Low, Drift Cloud Slide, Eclipse Stealth Black, Element Suede Skate, Vortex Knit Trainer, Aura Minimalist Court — all now resolve correctly via canonical `slug` from Prisma DB.

### [2026-09-06] Added `/api/products/[slug]` route integrity check

**Script:** `npm run check:routes` — fetches every product from `getAllProducts()`, confirms `/products/[slug]` resolves without not-found state, fails loudly (non-zero exit) if any product is unreachable.

### [2026-09-06] Re-verified Street Classics editorial collection

All 5 linked products (cw-prod-02, cw-prod-04, cw-prod-07, cw-prod-09, cw-prod-12) now resolve to real detail pages.

---

## Phase 2 — Category & Filter Taxonomy Fix (P0)

### [2026-09-06] Defined canonical enums server-side

**Enum `category`:** `SNEAKERS | SLIDES | BOOTS | SANDALS | RUNNING | STREETWEAR`
**Enum `gender`:** `MEN | WOMEN | UNISEX`

All filter queries now query against enum values, never display label strings.

### [2026-09-06] Fixed broken filter mappings

- `category=running` now returns real results (was 0)
- `category=slides` now returns real results (was 0)
- `/shop/women?category=streetwear` now returns real results (was 0)
- Added explicit URL-param → enum mapping in `app/shop/[category]/page.tsx`

### [2026-09-06] Fixed miscategorized products

- "Solstice Slide Pro" recategorized from ambiguous label to `SLIDES`
- "Terraform Hiker Boot" recategorized from ambiguous label to `BOOTS`
- Audited rest of catalog for category/label mismatch pattern

### [2026-09-06] All displayed counts computed live

- `".length"` of deduplicated, canonically-filtered result set
- Added test asserting displayed count always equals actual rendered card count

---

## Phase 3 — Collections Relational Integrity (P0/P1)

### [2026-09-06] Modelled collections as proper relation

**Changes:**
- Added `Collection` model with `id`, `slug`, `name`, `description`, `bannerImage`, `isPublished`
- Added `CollectionProduct` join table (many-to-many between Collection and Product)
- Populated `CollectionProduct` entries for Monochrome Vault and Performance Lab
- Inactive/unpopulated collections unpublished from navigation

### [2026-09-06] Fixed Monochrome Vault and Performance Lab

Both collections now report ≥1 active linked product via the `CollectionProduct` join table.

### [2026-09-06] Added collection integrity check

Build-time/dev-mode check: any published collection with 0 linked active products fails the check (same pattern as Phase 1 route integrity check).

### [2026-09-06] Re-verified Street Classics

All 5 linked products now resolve correctly with the fixed relation model.

---

## Phase 4 — Content, IA & Rendering Fixes (P1)

### [2026-09-06] Split Shipping vs. Returns into distinct routes

**Changes:**
- Renamed `/shipping-returns` to `/shipping` and `/returns` (separate routes)
- Updated footer links: "Shipping & Delivery" → `/shipping`, "Returns & Exchanges" → `/returns`

### [2026-09-06] Fixed image delivery

- Audited `next.config.js` `images.remotePatterns` against every catalog image URL
- Added missing allowlist entries for unsplash.com domains
- Added fallback/placeholder image component so single failed image degrades gracefully

### [2026-09-06] Fixed loading-state leakage

- Moved data fetching to Server Components / async page functions where feasible
- Where genuine client-side loading state is unavoidable, marked loading elements `aria-hidden`
- Verified no literal "Loading Drop Catalog..." text persists in served HTML

### [2026-09-06] FAQ accordion rebuilt with accessible disclosure

- Using shadcn/Radix Accordion pattern
- Each answer exists in the DOM (not conditionally unmounted)
- Toggles via `aria-expanded`
- Content is both crawlable and screen-reader accessible

---

## Phase 5 — Cart, Checkout & Forms: Make It Verifiable (P1)

### [2026-09-06] Exposed real `/cart` and `/checkout` routes

- `/cart` route now reflects live cart state from Prisma-backed cart store
- `/checkout` route similarly reflects live cart state (mock checkout, no live payment gateway)

### [2026-09-06] Add to Bag correctness

- Line items keyed by canonical product `id` + size + colorway (identical product/size/colorway increments quantity, doesn't create duplicate line)
- Adding without required size selection blocked with clear inline error
- Quantity increment/decrement recalculates subtotal correctly
- Removing a line item removes it fully
- Cart persists across refresh (server-side session-linked cart via Supabase)

### [2026-09-06] Shipping & totals — server-authoritative

- Free shipping at/above ₹1,999, ₹199 fee below threshold
- **All totals recalculated server-side at checkout time** — never trust client-submitted price/subtotal
- Added fraud/tampering risk documentation (COM-019)

### [2026-09-06] Address & payment validation

- Indian PIN code validation: accept valid 6-digit PINs, reject malformed ones
- COD eligibility gated by PIN (stub logic documented)
- UPI/card payment initiation uses existing webhook stub
- Payment failure does NOT create duplicate order — idempotency key tied to cart/session
- Navigating back from payment preserves cart state safely

### [2026-09-06] Oversell guard

- Stock decrements happen atomically at order creation (DB transaction)

### [2026-09-06] Coupon/discount integrity

- Discounts never produce negative total or exceed defined constraints
- Validated server-side

### [2026-09-06] Track Order form (CW-014)

- Required-field validation
- Invalid order ID/contact rejection with generic "not found" message (no PII leakage)
- Basic rate limiting to resist enumeration (SEC-003/SEC-004)

### [2026-09-06] Contact form (CW-015)

- Required-field validation
- Malformed email rejection
- Reasonable max-length handling
- Clear success confirmation and reset
- Friendly retry message on server error

---

## Phase 6 — Security & Compliance Hardening (P2)

### [2026-09-06] Confirmed no dangerouslySetInnerHTML with user input

- Audited all user-submitted content rendering
- Removed any `dangerouslySetInnerHTML` usage with user input

### [2026-09-06] Confirmed all database access through Prisma parameterized queries

- No raw string-concatenated SQL anywhere in codebase

### [2026-09-06] Added security headers via next.config.js headers()

- `Content-Security-Policy`
- `X-Frame-Options`
- `Strict-Transport-Security`
- `Referrer-Policy`

### [2026-09-06] TODO flag for DPDP Act 2023 / IT Act 2000 compliance

- Privacy policy assertions left-as-is with clear `TODO` comment flagging independent legal review needed before launch
- Do not make broader compliance claims

---

## Phase 7 — Accessibility, SEO & Performance Pass (P2)

### [2026-09-06] Keyboard reachability for all interactive controls

- Filters, accordion, size/colorway selectors, cart controls all reachable via keyboard
- Visible focus indicators on all focusable elements

### [2026-09-06] Programmatic label association for form fields

- `htmlFor`/`id` association on Track Order and Contact forms
- All form fields properly labeled

### [2026-09-06] Re-confirmed prefers-reduced-motion compliance

- Verified hero showcase `prefers-reduced-motion` care still holds
- Extended same care to any new motion added in remediation

### [2026-09-06] Unique `<title>` and meta description per route

- Added canonical URLs per route

### [2026-09-06] Responsive layout spot-check

- Verified at 320px, 375px, 768px, and 1440px widths for all pages touched in remediation

---

## Automated Regression Suite (Built)

### [2026-09-06] Route smoke test

- Every internal product/collection link resolves; no card links to dead route

### [2026-09-06] Data contract test

- Unique SKU, unique slug, valid category enum, valid gender enum, positive price, `salePrice <= basePrice`, single price per product identity

### [2026-09-06] Filter equivalence test

- Every filter option's result set matches a direct category/gender query against the DB

### [2026-09-06] Collection integrity test

- Every published collection has ≥1 active linked product

### [2026-09-06] Price parity snapshot test

- Product's price is identical wherever it's rendered (homepage, category grid, detail page)

### [2026-09-06] Cart/checkout E2E test (Playwright)

- Add to bag → adjust quantity → apply shipping threshold logic → submit mock checkout → receive unique order ID
- Payment-failure-then-retry path that doesn't duplicate the order