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

## Phase 1 — Foundation hardening
- [x] Dark / light theme (wired, toggle, persisted)
- [x] "Remember dynamics" — client-side persistence utility + hydrated/where used
- [x] Health/liveness indicator in header — replaced with inverted "alarm page": a banner that appears only when the API is down (client-side `/health` ping; nothing shown when healthy)
- [ ] Per-route SEO metadata helper

---

## Phase 2 — Home dashboard
- [ ] `< +page.server.ts >` loaders aggregating dashboard data
- [ ] Stats strip (`/books/status`, background `refresh=true`)
- [ ] New / Latest shelf (`/books/latest/5`)
- [ ] Random picks shelf (`/books/random/5`) + "换一批" shuffle
- [ ] Day widgets: WOTD + QOTD (homepage only)
- [ ] On-this-day books (`/books/today`)
- [ ] Recently visited (`/books/last_visited/10`)
- [ ] Dashboard empty / loading / error states

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