# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A multi-event Go tournament archive — a static Next.js site supporting multiple events (e.g. Polish Go Championships, WAGC). The active event is selected via the `EVENT` environment variable (defaults to `pgc`). Supports Polish and English via locale-based routing (`/pl`, `/en`). Builds to pure static HTML/CSS/JS for deployment.

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
npm run sgf:fix          # Clean SGF game files
npm run sgf:match        # Match SGF files to tournament games
```

## Architecture

### Routing

- `src/app/page.tsx` — redirects root to `/pl`
- `src/app/[locale]/layout.tsx` — locale-aware layout (header, nav, footer, client hydration)
- `src/app/[locale]/page.tsx` — tournament list page with medalists, winners, stats panels
- `src/app/[locale]/[year]/page.tsx` — single tournament detail: stages, results, games list
- `src/app/[locale]/stats/page.tsx` — all-time statistics page
- `src/app/[locale]/stats/[slug]/page.tsx` — individual player stats (achievements, opponents)
- `src/app/data/[year]/route.ts` — API route that serves tournament data as JSON
- `src/app/sgf/[...path]/route.ts` — serves SGF, SVG, and PNG files with correct MIME types

### Events Directory

Each event lives in `events/[event-id]/` and contains:

- `config.ts` — `EventConfig` with `id`, `domain`, `sgfUrlPrefix`, `defaultLocale`, `defaultCountry`, and optional `showCountry` (shows country column in tables)
- `Logo.tsx` — event-specific logo component
- `colors.css` — event-specific CSS color variables
- `i18n/pl.json`, `i18n/en.json` — event-specific translations
- `data/[year].yml` — one YAML file per tournament year
- `sgf/` — SGF game files and SVG board previews

`events/index.ts` exports the active event ID (`process.env.EVENT || 'pgc'`).  
`events/schema.ts` defines the `EventConfig` type.

Path aliases in `next.config.js` (via `turbopack.resolveAlias`):

- `@event` → `events/index.ts` (active event ID)
- `@event/schema` → `events/schema.ts`
- `@event/*` → `events/[active-event]/*` (e.g. `@event/config` resolves to the active event's `config.ts`)

### Data Pipeline

Tournament data lives in `events/[event-id]/data/[year].yml` (YAML, one file per year). At runtime:

1. `src/data/load.ts` reads and parses YAML files from `events/${EVENT}/data/`
2. `src/data/games.ts` parses game strings (format: `id1-id2 id1:B+2.5`)
3. `src/data/players.ts` parses player info including rank, country, EGD ID; generates slugified IDs
4. `src/data/table.ts`, `tableLadder.ts`, `tableWithoutRounds.ts`, `final.ts` compute standings with tiebreakers (wins, SOS, SODOS, SOSOS, direct, starting, rank)
5. `src/data/h9tournament.ts` parses H9 format tournament files (`.txt`) into stage data; used for WAGC and EGD-sourced tournaments
6. `src/data/stats.ts` aggregates cross-tournament statistics
7. `src/data/rank.ts` converts rank strings (5k, 1d, 2p) to numeric values for sorting
8. `src/data/sgfs.ts` loads SGF files from `events/${EVENT}/sgf/` for a tournament
9. `src/data/index.ts` exports the main data access functions (`getTournaments()`, `getStats()`)

### Schema

Core types are in `src/schema/data.ts`:

- **Tournament** — year, location, date span, players map, stages, games map, top (medalists)
- **Stage** — one of four types: `league`, `ladder-table`, `final`, `round-robin-table`
- **Game** — two players (black/white), result string, optional props (SGF, PNG, SVG, YouTube, OGS, AI)
- **Player** — id, name, rank (e.g. `5k`, `1d`, `5p`), country code, EGD ID
- **TableResult** — place, wins, SOS, SODOS, SOSOS, starting position, rank, games array
- **Breaker** enum — WINS, SOS, SODOS, SOSOS, STARTING_POSITION, DIRECT_MATCH, RANK, SCORE
- **Stats** / **StatsPlayer** / **StatsPlayerResult** — cross-tournament aggregate statistics

### Utility Libraries

`src/libs/` contains shared utilities used across components and data layer:

- `breakers.ts` — `isScoringBreaker()` type guard for tiebreaker types
- `goban.ts` — SGF parsing to board state: `sgfToBoard()`, `iterateStones()`
- `h9.ts` — H9 international tournament format parser: `loadH9()`, `parseH9()`
- `join.ts` — React utility: `jsxJoin()` for interspersing arrays
- `math.ts` — `between()` min/max clamp
- `stage.ts` — `getStageName()` / `getStageNameFromType()` with i18n support
- `table.ts` — `toPercentage()` for score calculation

### Components

- `src/components/ui/` — reusable primitives: Button, H1, H2, ExternalLink, PlayerLink, PlayerName (name + rank + country), PlayerCell (player with optional country column)
- `src/components/table/` — stage-specific table renderers: GoResultsTable (interactive wrapper via go-results-highlighter), TableLeague, TableLadder, TableWithoutRounds, StatsTable
- `src/components/stats/` — player stats views: Achievements, Events, Opponents
- `src/components/navigation/` — TopNavigation, YearsNavigation, LocaleNavigation
- `src/components/goban/` — Go board visualization (Goban.tsx + SVG assets)
- `src/components/Country.tsx` — displays a country code with a localized tooltip (respects `showCountry` from EventConfig)
- `src/components/Client.tsx` — client-side hydration with JSON-stringified translations

### i18n

- Locales defined in `src/i18n/consts.ts` (`SUPPORTED_LOCALES = ['pl', 'en']`)
- Server-side translations via `src/i18n/server.ts`
- Translation utility in `src/i18n/translator.ts` — supports nested key access and `%{0}` template replacement

### Environment

- `EVENT` — selects the active event directory (default: `pgc`). Set to `wagc` to build the WAGC archive.
- `SGF_URL_PREFIX` — overrides the event's `sgfUrlPrefix` from `config.ts`. If unset, the value from `config.ts` is used.

### Path Alias

`@/*` maps to `./src/*` (configured in `tsconfig.json`).

### Styling

Tailwind CSS 4 with custom config:

- `pgc` grid template: `min-content` + 3 columns
- `xs` breakpoint at 420px
- Custom border animation via CSS variables

### Tools Directory

`tools/` contains standalone TypeScript scripts for one-off data management tasks. These are not part of the Next.js app:

- `extract.ts` — MySQL database extraction; converts tournament data to YAML; cleans SGFs
- `templates.ts` — generates SGF file templates from tournament data
- `svgs.ts` — converts SGF files to SVG board images
- `pngs.ts` — converts SVG board images to PNG (512×512) using Puppeteer
- `fix.ts` — fixes SGF property names (RB→BR, RW→WR); warns about missing players
- `svg.ts` — core `generateSvg()` function using @sabaki/go-board; 1024×1024 output with SVGO optimization
- `sgf.ts` — `cleanSgf()` function; traverses SGF tree, removes comments, applies root params
