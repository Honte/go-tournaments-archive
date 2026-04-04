# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Polish Go Championships Archive — a static Next.js site displaying historical tournament data (1979–present) at https://mp.go.art.pl. Supports Polish and English via locale-based routing (`/pl`, `/en`). Builds to pure static HTML/CSS/JS for deployment.

## Commands

```bash
npm run dev          # Start dev server (Turbopack) at http://localhost:3000
npm run build        # Build static output to /out
npm run start        # Serve the /out directory
npm run lint         # ESLint
npm run tsc          # Type check without emitting
```

**Data/asset tools** (run as needed, not part of regular dev):

```bash
npm run extract:mp-db    # Extract tournament data from MySQL DB
npm run build:templates  # Build SVG templates for game boards
npm run build:svgs       # Generate SVG files
npm run build:pngs       # Convert SVGs to PNGs
npm run fix:sgfs         # Clean SGF game files
```

## Architecture

### Routing

- `src/app/page.tsx` — redirects root to `/pl`
- `src/app/[locale]/page.js` — tournament list page
- `src/app/[locale]/[year]/page.js` — single tournament detail
- `src/app/[locale]/stats/` — statistics page
- `src/app/data/[year]/route.ts` — API route that serves tournament data as JSON

### Data Pipeline

Tournament data lives in `public/data/[year].yml` (YAML, one file per year). At runtime:

1. `src/data/load.ts` reads and parses YAML files
2. `src/data/games.ts` parses game strings (format: `id1-id2 id1:B+2.5`)
3. `src/data/players.ts` parses player info including rank, country, EGD ID
4. `src/data/table.js`, `tableLadder.js`, `tableWithoutRounds.js` compute standings with tiebreakers (wins, SOS, SODOS, SOSOS, direct, starting, rank)
5. `src/data/stats.js` aggregates cross-tournament statistics
6. `src/data/index.ts` exports the main data access functions

### Schema

Core types are in `src/schema/data.ts`:

- **Tournament** — year, location, players, stages, games
- **Stage** — one of four types: `league`, `ladder-table`, `final`, `round-robin-table`
- **Game** — two players, result, optional props (SGF, YouTube, OGS, AI analysis, board images)
- **Player** — name, rank, country, EGD ID

### i18n

- Locales defined in `src/i18n/consts.ts`
- Server-side translations via `src/i18n/server.ts`
- Translation utility in `src/i18n/translator.ts`

### Environment

- Development: SGF files served from `/sgf/` (relative)
- Production: SGF files at `https://mp.go.art.pl/sgf/` (absolute)

### Path Alias

`@/*` maps to `./src/*` (configured in `tsconfig.json`).

### Styling

Tailwind CSS 4 with custom config:

- `pgc` grid template: `min-content` + 3 columns
- `xs` breakpoint at 420px
- Custom border animation via CSS variables

### Tools Directory

`tools/` contains standalone TypeScript scripts for one-off data management tasks (database extraction, SGF fixing, SVG/PNG generation). These are not part of the Next.js app.
