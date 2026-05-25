# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Next.js)
npm run build     # Production build
npm run start     # Run production build locally
npm run lint      # ESLint

# Stock price updater (runs continuously, requires scripts/.env with SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
cd scripts && ./run_updater.sh
```

There are no tests. There is no single-test runner.

## Architecture

**Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, Supabase (Postgres + Realtime + Auth), Chart.js.

### App structure

All pages live under `src/app/` using the App Router. Every page is a `'use client'` component. Global layout (`src/app/layout.tsx`) wraps everything in `<AuthProvider>` → `<Navbar>` → `<main>` → `<Footer>`.

Pages: `/` (home), `/about`, `/courses`, `/chapters`, `/medical`, `/partnerships`, `/simulator`, `/auth`, `/account`, `/settings`.

### Auth

`src/contexts/AuthContext.tsx` provides `{ user, session, profile, authLoading, signOut, refreshProfile }` via `useAuth()`. It initializes from Supabase's `getSession()` and listens for changes with `onAuthStateChange`. The `profiles` table (separate from `auth.users`) stores `full_name`, `email`, `photo_url`, `dob`.

**Dark mode** is set via a blocking inline script in `<head>` (`DarkModeScript.tsx`) that reads `localStorage.darkMode` before paint. The `dark` class is toggled on `<html>`. Never use `prefers-color-scheme` — the site always defaults to light unless the user has explicitly toggled.

### Supabase tables

- `stocks` — live market data, updated by the Python script. Realtime-enabled.
- `stock_history` — per-symbol JSONB array of `{ date, price }` objects, capped at 5 years.
- `game_state` — per-user portfolio simulator state (`cash`, `holdings` JSONB). Realtime-enabled.
- `profiles` — user profile data linked to `auth.users` by UUID.

RLS is enabled on all tables. `stocks` and `stock_history` are public read. `game_state` and `profiles` are user-scoped. The Python updater uses the `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS).

### Simulator page

`src/app/simulator/page.tsx` is the most complex page. It:
1. Loads market data from `stocks` in paginated 500-row batches, caching a lite version in `localStorage`.
2. Subscribes to Supabase Realtime for live stock updates via a channel named `'public:stocks'`.
3. Subscribes to `game_state` changes for the authenticated user via `'game_state_updates'`.

**Critical pattern for Supabase Realtime in `useEffect`:** Always declare the channel variable in the outer `useEffect` scope (not inside the async loader), then assign it during the async work. Return the cleanup `() => supabase.removeChannel(channel)` from `useEffect` directly — not from the async function — otherwise React never registers the cleanup and Supabase throws on remount.

### Styling

Tailwind v4 is used with a custom theme defined in `src/app/globals.css` via `@theme {}`. Color tokens:

| Token | Value | Alias |
|---|---|---|
| `primary` | `#2b4224` | `forest` |
| `primary-light` | `#3d6133` | `sage` |
| `mint` | `#8eba7e` | — |
| `secondary` / `gold-light` | `#c9ccb4` | — |
| `cream` | `#edf0e4` | — |
| `charcoal` | `#1c1f1a` | — |
| `warm-white` | `#f5f6f0` | — |

Fonts: `font-serif` → Playfair Display, `font-sans` → DM Sans (default body), `font-mono` → DM Mono.

Two glassmorphism classes for the navbar: `.glass-nav` (default) and `.glass-nav-scrolled` (after scrolling 20px). Both have dark overrides.

### Navbar centering

The navbar uses Framer Motion. **Do not use Tailwind's `left-1/2 -translate-x-1/2` pattern alongside Framer Motion** — Framer Motion's inline `transform` overrides the Tailwind transform class. Instead use `style={{ left: '50%', x: '-50%' }}` on `motion.nav` so Framer Motion composes both values into a single transform.

### USMap component

`src/components/USMap.tsx` contains all 50 states + territories as inline SVG path data (~1800 lines). Many path entries have empty `code` and `name` (sub-paths for states with disconnected regions). Use array index as key fallback: `key={state.code || state.name || idx}`.

**Do not use `whileHover={{ scale }}` on `motion.path` elements** — scaling an SVG path from its bounding-box center doesn't align with the geographic shape, making highlights visually inaccurate. Use CSS `transition: fill` instead, which follows the exact path boundary.

### Shared components

- `RevealOnScroll` — Framer Motion `whileInView` wrapper with `viewport={{ once: true }}`.
- `PageHero` — standard hero section with eyebrow label, large serif title, description.
- `SectionHeader` — reusable section label + title + subtitle block.

### Stock price updater (Python)

`scripts/update_prices.py` runs a continuous loop using `yfinance` + `yahoo_fin`. It polls all NYSE/NASDAQ tickers in batches of 50, upserts into Supabase `stocks`, and once per day after market close (3 PM CST) appends closing prices to `stock_history`. Requires `scripts/.env` with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Use `scripts/run_updater.sh` to launch with the managed virtualenv.
