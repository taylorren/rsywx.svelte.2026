# Frontend integration investigation checklist

Reviewed: 2026-09-05  
Projects: `rsywx` (SvelteKit frontend) and `api.rsywx.2026` (PHP/Slim backend).

These tasks describe findings from the current working trees, including
uncommitted changes. They are not completed fixes or confirmation of the live
deployment. Shared issue IDs correspond to the
[backend checklist](../api.rsywx.2026/INTEGRATION-REVIEW.md).

## Connection baseline

Server loaders and same-origin proxies call
`https://api.rsywx.com/api/v1` by default with the server-only `X-API-Key`.
Local frontend/backend key settings match; core endpoint paths, tag-search
mapping, and pagination fields align. Do not copy credentials into this
document or test fixtures.

The browser calls `/health` directly through `src/lib/health.ts`.
WordPress featured-image enrichment additionally calls the WordPress REST API
from the server-side API client.

## INT-01: Make environment targets explicit

**Evidence:** `src/lib/env.ts` defaults to the public API, not the sibling
checkout. The backend Apache example still references its 2025 directory.

- [ ] Coordinate identification of the revision behind the public API domain.
- [ ] Document explicit development/staging `RSYWX_API_BASE` values.
- [ ] Keep `VITE_RSYWX_API_ROOT` aligned with the selected backend so health
  checks do not monitor a different environment.
- [ ] Document server-side runtime/environment requirements rather than
  treating the application as a static-only API consumer.

**Acceptance:** each environment uses its intended backend and health target,
without unintentionally sending local development traffic to production.

## INT-02: Preserve arbitrary search strings

**Evidence:** `src/lib/api.ts:199-201` correctly encodes values, but backend
decoding turns `C++` into `C  ` and slash-containing values can cause a 404.

- [ ] Coordinate a query-parameter search contract with the backend while
  preserving existing public frontend search URLs.
- [ ] Update the client after backend support exists; do not work around the
  issue with repeated percent-encoding.
- [ ] Cover `C++`, slashes, literal percent sequences, Chinese text, spaces,
  tags, and paginated searches.

**Acceptance:** user-entered text reaches the backend unchanged and existing
frontend search links continue to work.

## INT-03: Record actual views instead of server fetches

**Evidence:** `src/app.html:30` enables hover preloading, while every backend
detail GET records a visit. The tag proxy fetches detail again at
`src/routes/api/books/[bookid]/tags/+server.ts:67`.
`src/lib/api.ts:73-75` sends the API key but no visitor address.

- [ ] Agree on explicit visit-event semantics and migrate with the backend.
- [ ] Record actual views rather than hover preloads or tag-refresh requests;
  define navigation, refresh, and retry behavior.
- [ ] If geolocation is retained, use SvelteKit's trusted client-address
  mechanism with an agreed backend trust boundary.
- [ ] Cover hovering without navigation, actual navigation, page refresh,
  tag submission, and duplicate/retried events.

**Acceptance:** prefetch and tag refreshes create no visits; actual views use
the intended counting and address semantics.

## INT-04: Correct the embedded book-review model

**Evidence:** `src/lib/types.ts` declares `BookDetail.reviews` as
`ReadingItem[]`, but backend embedded reviews lack `bookid`, `book_title`,
and `cover_uri`. The detail template at
`src/routes/books/[bookid].html/+page.svelte:291-292` consequently requests
`/covers/undefined.jpg`.

- [ ] Introduce a distinct embedded-review type unless the backend explicitly
  enriches its response.
- [ ] Render a valid image using the parent book's cover or the agreed review
  image field, with appropriate alternative text and fallback.
- [ ] Cover books with and without reviews.

**Acceptance:** review links and thumbnails render without undefined
identifiers or assumptions inherited from reading-list responses.

## INT-05: Implement the documented remote cover fallback

**Evidence:** local cover paths are hard-coded in
`src/lib/components/BookTile.svelte:30`,
`src/routes/books/[bookid].html/+page.svelte:116`,
`src/routes/reviews/[[page]]/+page.svelte:56`, and
`src/routes/on-this-day/+page.svelte:39`.
The README promises fallback to API `cover_uri`, but these paths omit it.

- [ ] Agree on public API cover availability and asset synchronization.
- [ ] Reuse a consistent local cover -> API `cover_uri` -> placeholder fallback
  across book-image surfaces, avoiding retry loops.
- [ ] Include `cover_uri` in component props where needed.
- [ ] Cover local success, local failure with remote success, and both sources
  failing; align README wording with the implementation.

**Acceptance:** an available remote cover displays when the local file is
missing, and complete image failure produces a stable placeholder.

## INT-06: Reject upstream failures consistently

**Evidence:** `paginatedRequest()`, `booksToday()`, `visitHistory()`, and
`wpPostsToday()` in `src/lib/api.ts` ignore HTTP status and only reject
explicit `success: false`. Non-envelope JSON 502 responses can become
undefined pagination or empty results. The unused server-side `health()`
also incorrectly unwraps the top-level health object as `data`; the active
browser helper uses the correct shape.

- [ ] Consolidate response handling while preserving pagination, date, and
  period metadata.
- [ ] Check HTTP status and required envelope fields, preserving meaningful
  status information in errors.
- [ ] Distinguish genuine empty results from failures in loaders/UI and log
  failures using an agreed server-side pattern.
- [ ] Correct or remove the duplicate server-side health helper.
- [ ] Cover valid empty responses, explicit API errors, non-envelope JSON
  failures, HTML gateway errors, and malformed successful responses.

**Acceptance:** failures remain explicit errors rather than empty datasets
or rendering crashes; valid metadata and HTTP error semantics survive.

## INT-07: Align TypeScript types with the wire format

**Evidence:** `BookDetail` inherits numeric `translated` and string `price`,
but backend detail uses boolean and numeric values. `WpPostsToday.date_info`
reuses book `DateInfo` even though WordPress metadata has a different shape.
Type assertions do not validate these differences.

- [ ] Split endpoint-specific types for detail/list records, embedded reviews,
  and WordPress/book date metadata.
- [ ] Coordinate any backend normalization before changing shared contracts.
- [ ] Update `doc/API.md` and type comments to reflect actual endpoint formats.
- [ ] Add contract assertions or boundary validation for consumed fields.

**Acceptance:** models and documentation match actual field types,
nullability, optionality, and metadata; assertions do not conceal drift.
