# RSYWX — Frontend Build Task List

Status legend:
- [ ] = not started
- [x] = done
- [~] = in progress / partially done

---

## Phase 0 — Foundation ✅
- [x] Scaffold SvelteKit + TypeScript + pnpm
- [x] Wire Tailwind CSS v4 + Flowbite Svelte (verified build)
- [x] Theme tokens (`src/app.css` @theme — paper/leaf palette, serif display)
- [x] Server-only env access (`src/lib/env.ts`) + `.env.example`
- [x] Typed API client + models (`src/lib/api.ts`, `src/lib/types.ts`)
- [x] Site shell: header (nav + brand) + 4-element footer
- [x] Dev server exposed on LAN (`dev:lan`, host 0.0.0.0)

---

## Phase 1 — Foundation hardening ✅
- [x] Dark / light theme — CSS tokens + `.dark` class (`app.css`), flash-free inline script (`app.html`), `ThemeToggle` in header, persisted via `$lib/storage`
- [x] "Remember dynamics" — typed localStorage wrapper `$lib/storage.ts` (`getStore`/`setStore`/`stored`, SSR-safe) with keys for theme, on-this-day date, collapsed shelves, browser filter
- [x] Health/liveness — inverted safeguard: `HealthGuard` banner shown only when the API is down (client-side `/health` ping; nothing when healthy)
- [ ] Per-route SEO metadata helper

---

## Phase 2 — Home dashboard ✅
- [x] `+page.server.ts` loader aggregating dashboard widgets in parallel (each try/catch so one failure never kills the page)
- [x] Stats strip (`/books/status`) — verified: 1,826 books render
- [x] New / Latest shelf (`/books/latest/5`)
- [x] Random picks shelf (`/books/random/5`)
- [x] Day widgets: WOTD + QOTD (homepage only, not footer)
- [x] On-this-day books (`/books/today`) — verified: "29 年前" + real titles render
- [x] Recently visited (`/books/last_visited/10`)
- [~] Empty / loading / error states — empty states done; `HealthGuard` covers outage; full polish later
- [x] Ground-truth type fixes against live API (translated=number, price=string, today array shape)

---

## Phase 3 — Book browser + detail
- [ ] `/books` search (author/title/tag) + pagination (`/books/list`)
- [ ] `/books/[bookid]` detail page (visit-increment fetch only here)
- [ ] Book tile component (cover, title, author, tags, region)
- [ ] Related shelf (deferred — `/books/related` is PENDING on backend)

---

## Phase 4 — Reviews + On-this-day
- [ ] `/reviews` feed (paginated `/readings/reviews`)
- [ ] Previous-next pagination component
- [ ] `/on-this-day` (WordPress `/wp/posts/today` + books)

---

## Phase 5 — Collection stats
- [ ] `/stats` page (`/books/status`, `/reading/summary`, `/books/visit_history` chart)
- [ ] Visit-trend chart component

---

## Phase 6 — Polish
- [ ] Light/dark refinement pass
- [ ] Motion + reduced-motion
- [ ] Accessibility (a11y) pass
- [ ] Final build + `svelte-check` clean