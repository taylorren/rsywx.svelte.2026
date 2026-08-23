# 任氏有无轩 — RSYWX Frontend

The private library of the Ren family, presented as a SvelteKit + Tailwind CSS
frontend. Browse a 1,800+ book collection, read reviews, discover what was
bought "on this day" in past years, and explore reading statistics — all served
from the RSYWX backend API.

![Tech](https://img.shields.io/badge/SvelteKit-2-ff3e00) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8) ![Flowbite Svelte](https://img.shields.io/badge/Flowbite_Svelte-1-6b7280) ![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6)

---

## Features

- **藏书 / Book browser** — full collection listing (20 books/page), search by
  title / author / tag, and a book detail page with cover, facts, and tags.
  Clean path-based URLs (`/books/author/安徒生`); legacy query-param URLs
  redirect automatically.
- **读书 / Reviews** — paginated reading journal feed from WordPress.
- **博客 / On this day** — blog posts and books bought this day N years ago.
- **统计 / Stats** — collection stats, reading summary, and a dependency-free
  SVG visit-trend chart.
- **Home dashboard** — stats strip, latest / random / recently-visited shelves,
  Word-of-the-day & Quote-of-the-day widgets.
- **Dark / light theme** — flash-free toggle, persisted in `localStorage`.
- **Health guard** — a banner appears only when the API is unreachable.
- **Semantic SEO** — per-route titles & descriptions, zh-CN locale.

## Tech stack

| Layer        | Choice                                        |
| ------------ | --------------------------------------------- |
| Framework    | SvelteKit 2 (Svelte 5 runes) + TypeScript     |
| Styling      | Tailwind CSS v4 (CSS-token theming)           |
| Components   | Flowbite Svelte                               |
| Package mgr  | pnpm                                          |
| Data         | REST client against `https://api.rsywx.com`   |

## Getting started

Prerequisites: **Node.js 20+** and **pnpm**.

```sh
# 1. Install dependencies
pnpm install

# 2. Configure the API (server-only; see .env.example)
cp .env.example .env
#   → fill in RSYWX_API_KEY

# 3. Start the dev server
pnpm dev                 # http://localhost:5173

# Serve on your LAN (for phones/tablets on the same network)
pnpm dev:lan             # http://0.0.0.0:5173
```

### Environment variables

| Variable              | Required | Description                                             |
| --------------------- | -------- | ------------------------------------------------------- |
| `RSYWX_API_KEY`       | prod     | API key sent as `X-API-Key` to the backend (server-only) |
| `RSYWX_API_BASE`      | no       | Versioned API base; defaults to `https://api.rsywx.com/api/v1` |
| `VITE_RSYWX_API_ROOT` | no       | Public root for the client-side `/health` ping; defaults to `https://api.rsywx.com` |

> **Security note** — `.env` is git-ignored. Server-only variables are read via
> `$env/dynamic/private` in `src/lib/env.ts` and never reach the browser bundle.

## Scripts

| Command             | Purpose                                        |
| ------------------- | ---------------------------------------------- |
| `pnpm dev`          | Start the Vite dev server                      |
| `pnpm dev:lan`      | Dev server bound to `0.0.0.0` (LAN access)     |
| `pnpm build`        | Production build                               |
| `pnpm preview`      | Preview the production build locally           |
| `pnpm check`        | `svelte-check` type/lint validation            |
| `pnpm check:watch`  | `svelte-check` in watch mode                   |

## Project structure

```
src/
├── lib/
│   ├── api.ts            # Typed API client (books, readings, wp, stats)
│   ├── env.ts            # Server-only env access (fail-fast in prod)
│   ├── types.ts          # Wire models matching the live API
│   ├── storage.ts        # SSR-safe typed localStorage wrapper
│   ├── seo.ts            # Per-route SEO metadata helper
│   └── components/       # BookTile, BooksList, Shelf, StatsStrip,
│                         # Pagination, VisitTrend, DayWidgets, HealthGuard…
└── routes/
    ├── +page.svelte      # Home dashboard (shelves + widgets)
    ├── books/            # Listing, search, detail
    │   └── [bookid].html/
    ├── reviews/          # Reading journal, paginated
    ├── on-this-day/      # Blog + books bought today N years ago
    ├── stats/            # Collection stats + visit-trend chart
    └── api/dashboard/    # Server-only proxies for dashboard widgets
```

## API reference

The frontend consumes the RSYWX REST API — see [`doc/API.md`](doc/API.md) for
endpoints, authentication (`X-API-Key` header), and response shapes.

## Notes

- **Book covers** are intentionally **not** committed to the repo
  (`static/covers/` is git-ignored, ~672 MB). The detail/tile components fall
  back to the API's remote `cover_uri` when a local cover is missing.
- The health endpoint lives at the API **root** (`https://api.rsywx.com/health`),
  outside the versioned `/api/v1` prefix — it needs no auth.

## License

The site is published under [CC BY-NC-ND-SA 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/).
© 1989–2026 任氏有无轩.
