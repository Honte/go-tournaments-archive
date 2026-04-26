# Go Tournaments Archive

A multi-event Go tournament archive built as a static Next.js site. The same app can render several tournament archives,
selected at build/dev time with the `EVENT` environment variable. Polish and English are supported through locale routes
(`/pl`, `/en`), and tournament data is stored in YAML and H9 text files under `events/[event-id]/data/`.

The site supports tournament lists, edition detail pages, stage standings, game lists with SGF links and generated board
previews, all-time player statistics, country statistics for international events, and category medal tables for events
that define age or other categories.

## Live sites

- [Polish Go Championships Archive](https://mp.go.art.pl) (`pgc`)
- [World Amateur Go Championships Archive](https://wagc.go.art.pl) (`wagc`)

## Events

Available event directories:

| Event ID | Archive                          | Notes                                                                              |
| -------- | -------------------------------- | ---------------------------------------------------------------------------------- |
| `pgc`    | Polish Go Championships          | Default event, Polish default locale, SGF previews                                 |
| `wagc`   | World Amateur Go Championships   | English default locale, country stats, JPG previews                                |
| `kpmc`   | Korea Prime Minister Cup         | English default locale, country stats, JPG previews                                |
| `pwgc`   | Polish Women Go Championships    | Polish default locale                                                              |
| `pagc`   | Polish Academic Go Championships | Polish default locale                                                              |
| `pygc`   | Polish Youth Go Championships    | Polish default locale, category stats for `u21`, `u20`, `u18`, `u16`, `u15`, `u12` |

`EVENT` defaults to `pgc`. Event-specific config, translations, colors, logo, data, and SGF files live in
`events/[event-id]/`.

## Prerequisites

- Node.js 24 LTS
- MySQL access only for `npm run extract:mp-db`

## Development

Install dependencies:

```bash
npm install
```

Run the default event (`pgc`) at [http://localhost:3000](http://localhost:3000):

```bash
npm run dev
```

Run another event:

```bash
npm run dev:wagc
npm run dev:kpmc
npm run dev:pwgc
npm run dev:pagc
npm run dev:pygc
```

Useful checks:

```bash
npm run tsc          # Type-check without emitting
npm run lint         # Run ESLint
npm run fmt          # Check formatting
npm run fmt:write    # Write formatting changes
```

## Build and deploy

The app uses `output: 'export'`, so `npm run build` emits static files to `out/`. The `public/index.php` file is also
copied into the export for PHP-based static hosting setups that need a root redirect to the best supported locale.

Build the default event:

```bash
npm run build
```

Build a specific event:

```bash
npm run build:pgc
npm run build:wagc
npm run build:kpmc
npm run build:pwgc
npm run build:pagc
npm run build:pygc
```

Serve the exported output locally:

```bash
npm run start
```

Environment variables:

- `EVENT` selects the event directory. Defaults to `pgc`.
- `SGF_URL_PREFIX` overrides the SGF base URL derived from the event domain.

## App routes

Main static pages:

- `/` - redirects to the best browser-supported locale, falling back to the event default locale.
- `/:locale` - archive overview with winners, medalists, attendants, total stats, and country medalists when enabled.
- `/:locale/:year` - tournament detail page with event metadata, awarded players, stage tables, and game list.
- `/:locale/stats` - all-time player table.
- `/:locale/stats/:slug` - individual player statistics, achievements, events, and opponents.
- `/:locale/stats/country` - all-time country table when `showCountry` is enabled.
- `/:locale/stats/country/:code` - individual country statistics.
- `/:locale/category/:category` - category medal/results page when the event defines `categories`.

Generated data/assets routes:

- `/data/:year.json` - tournament data for one year.
- `/data/i18n/:locale.json` - merged base and event translations.
- `/data/sitemap/:locale.json` - navigation data.
- `/data/stats/player/:slug.json` - player stats payload.
- `/data/stats/country/:code.json` - country stats payload.
- `/sgf/.../*.sgf` - cleaned SGF.
- `/sgf/.../*.raw.sgf` - original SGF.
- `/sgf/.../*.svg`, `/sgf/.../*.png`, `/sgf/.../*.jpg` - generated board previews when enabled by event config.
- `/favicon.svg`, `/apple-icon.png`, `/logo-black.svg`, `/logo-white.svg` - generated event branding assets.

## Project layout

```text
events/
  [event-id]/
    config.ts
    Logo.tsx
    colors.css
    i18n/pl.json
    i18n/en.json
    data/
    sgf/
src/
  app/              # Next.js App Router pages and static route handlers
  components/       # UI, tables, stats, navigation, goban preview components
  data/             # YAML/H9 loaders, standings, tiebreakers, aggregate stats
  i18n/             # Locale constants, server loader, translator
  libs/             # Shared utilities: dates, H9 parser, SGF/goban parser, sorting, math
  schema/           # Input and normalized data types
tools/              # One-off extraction, SGF cleanup/matching, preview generation helpers
```

Aliases:

- `@/*` maps to `src/*`.
- `@event` maps to the active event ID (`events/index.ts`).
- `@event/*` maps to `events/[active-event]/*`.

## Event configuration

Each event has `events/[event-id]/config.ts` exporting an `EventConfig`:

```ts
type EventConfig = {
  id: string;
  domain: string;
  defaultLocale: 'pl' | 'en';
  defaultCountry?: string;
  showCountry?: boolean;
  showBestPlace?: boolean;
  generateSvgs?: boolean;
  generatePngs?: boolean;
  generateJpgs?: boolean;
  hideGamesWithoutSgf?: boolean;
  currentEdition?: boolean;
  categories?: string[];
};
```

Common flags:

- `defaultCountry` is applied to players/tournaments without an explicit country.
- `showCountry` enables country columns, country medalists, and country stats routes.
- `showBestPlace` controls best-place display in stats tables.
- `generateSvgs`, `generatePngs`, `generateJpgs` select preview variants emitted from SGF files during static export.
- `hideGamesWithoutSgf` hides unlinked games in game lists for SGF-focused archives.
- `currentEdition` enables the optional homepage banner when the component flag is visible.
- `categories` enables category medal aggregation and `/:locale/category/:category` pages.

## Tournament data

Create one YAML file per edition in `events/[event-id]/data/[year].yml`.

```yaml
location: Poznan
country: PL
referee: John Smith
website:
  - https://example.org/tournament
notes:
  en: Optional note displayed with the edition.
  pl: Opcjonalna notatka widoczna przy edycji.
players:
  id1: Player One 5d (PL) |12345
  id2: Player Two 4d
top:
  - id1
  - id2
stages:
  - type: league
    date: 2026-11-07 - 2026-11-10
    egd: https://www.europeangodatabase.eu/EGD/Tournament_Card.php?&key=T261107A
    time: fischer 60m + 30s
    komi: 6.5
    rules: japanese
    breakers:
      - wins
      - sos
      - sodos
      - direct
    rounds:
      - - id1-id2 id1:B+2.5 sgf:2026/player-one-player-two.sgf
```

Top-level fields:

- `location`, `country`, `referee`, `website`, `notes` describe the edition.
- `players` maps local player IDs to player strings.
- `top` lists medalists. A comma-separated value means shared medal/place, for example `id3,id4`.
- `displayReversed` controls whether stages render newest/last first. Defaults to `true`.
- `stages` contains one or more stage definitions.

Optional Markdown descriptions can be stored next to YAML as `events/[event-id]/data/[year].md` or
`events/[event-id]/data/[year].[locale].md`.

## Player format

```yaml
players:
  id1: Player Name 5d
  id2: Player Name 4d (JP)
  id3: Player Name 3d |12345
  id4: Player Name 2d (PL) |67890
```

Supported ranks use `Xk`, `Xd`, or `Xp`, for example `5k`, `1d`, `2p`.

Player IDs are local to the YAML file. Cross-tournament player stats are linked by normalized name slug.

## Stage fields

All stage types support:

- `name` and `notes` as a string or localized object.
- `date` as a single date, date range, or array of dates/ranges.
- `egd`, `time`, `komi`, `rules`.
- `breakers` for table sorting where applicable.
- `promoted` and `placeOffset` for final-place calculation in aggregate stats.
- `category` for category-specific tournament stages.

Supported breakers are `wins`, `sos`, `mms`, `sodos`, `sosos`, `direct`, `starting`, `rank`, and `score`.

## Stage types

### `league`

Round-robin or round-based table. `rounds` is an array of rounds, each containing game strings.

```yaml
- type: league
  date: 2026-11-07 - 2026-11-10
  order:
    - id1
    - id2
  breakers:
    - wins
    - sos
    - sodos
  rounds:
    - - id1-id2 id1:B+R
```

### `ladder-table`

Swiss/ladder-style table. Requires initial `order`; optional `playoffs` are added after main rounds.

```yaml
- type: ladder-table
  date: 1983-09-30 - 1983-10-02
  order:
    - id1
    - id2
    - id3,id4
  rounds:
    - - id1-id2 id1:B+R
      - id3-id4 id3:B+5.5
  playoffs:
    - id2-id3 id2:W+R
```

### `round-robin-table`

Flat list of games, sorted by score and rank.

```yaml
- type: round-robin-table
  name:
    pl: Turniej o miejsca 5-11
    en: Tournament for places 5-11
  date: 1981-10-28 - 1981-10-30
  games:
    - id1-id2 id1:B+R
    - id2-id3 id3:W+4.5
```

### `final`

Head-to-head final. `includePrevious` can include earlier stage results in the final table.

```yaml
- type: final
  date: 1997-11-29
  requiredWins: 2
  includePrevious: false
  games:
    - id1-id2 id2:W+R
    - id2-id1 id1:B+29.5
```

### `tournament`

Imports an H9 tournament text file from `events/[event-id]/data/`. Used heavily by WAGC, KPMC, youth, women, and
academic archives.

```yaml
- type: tournament
  file: 2025/wagc2025.txt
  date: 2025-05-15 - 2025-05-18
  breakers:
    - wins
    - sos
  scoringColumns:
    - wins
    - sos
  findSharedPlaces: true
  customBreakers:
    sos:
      translations:
        en: SOS
        pl: SOS
```

Useful `tournament` fields:

- `file` points to the H9 `.txt` file under the event data directory.
- `scoringColumns` maps H9 score columns to breakers or category IDs.
- `games` can supplement/override H9 game data with explicit game strings. Player numbers refer to H9 places.
- `findSharedPlaces` derives shared places from matching configured breakers.
- `sharedPlaces` can explicitly map ranges such as `4-6`.
- `customBreakers` defines display names, descriptions, order, and visibility for non-standard score columns.

## Game strings

Format:

```text
[black-or-home-id]-[white-or-away-id] [winner-id]:[result] [props]
```

Examples:

```text
id1-id2 id1:B+2.5
id1-id2 id2:W+R
id1-id2 id1:!
id1-id2 id1:B+R sgf:2026/game.sgf yt:https://youtube.com/watch?v=abc
```

Result notes:

- `B+...` means black won; `W+...` means white won.
- Scores can be numeric or `R` for resignation, `T` for timeout, `?` for unknown.
- `!` marks a walkover.
- H9-imported games may use loose results such as `+`, `-`, or `=`.

Supported properties:

- `sgf:path/to/file.sgf` - path relative to `events/[event-id]/sgf/`.
- `ai:https://...` - AI analysis link.
- `yt:https://...` - YouTube link. Multiple links can be comma-separated.
- `ogs:https://...` - OGS game/review link.
- `round:N` - explicit round metadata for supplemental tournament games.

When an `sgf` prop is present, the app exposes `/sgf/...` routes and attaches configured preview URLs (`svg`, `png`,
`jpg`) to the game data.

## SGF workflow

Place SGF files under `events/[event-id]/sgf/[year]/`.

Available SGF tools:

```bash
npm run sgf:fix:pgc      # Fix SGF property names for PGC files
npm run sgf:match:pgc    # Match PGC SGFs to YAML games and write sgf: props
npm run sgf:match:wagc   # Match WAGC SGFs to imported games
npm run sgf:match:kpmc   # Match KPMC SGFs to imported games
```

The matcher accepts:

```bash
npm run sgf:match:pgc -- -y 2025
npm run sgf:match:pgc -- -f
```

- `-y` / `--year` limits matching to one year.
- `-f` / `--force` overwrites existing `sgf:` props.

SGF previews are generated on demand by `src/app/sgf/[...path]/route.ts` and emitted during `next build` through
`generateStaticParams`. There is no committed preview image build step. Enable output formats per event with
`generateSvgs`, `generatePngs`, and `generateJpgs`.

## Data and asset tools

These scripts are for one-off data maintenance:

```bash
npm run extract:mp-db    # Extract PGC data from MySQL and convert to YAML
npm run build:templates  # Build SGF templates for PGC games
```

Relevant tool modules:

- `tools/extract.ts` imports legacy MySQL data.
- `tools/templates.ts` creates SGF templates.
- `tools/fix.ts` normalizes SGF property names.
- `tools/sgfMatcher/` matches SGF files back to games and writes YAML.
- `tools/sgf.ts` cleans SGF files before serving.
- `tools/svg.ts`, `tools/png.ts`, `tools/jpg.ts` generate board previews.

## Adding a new event

1. Create `events/[event-id]/`.
2. Add `config.ts`, `Logo.tsx`, `colors.css`, `i18n/pl.json`, and `i18n/en.json`.
3. Add `data/[year].yml` files, plus H9 `.txt` files or Markdown descriptions if needed.
4. Add SGF files under `sgf/` if the archive exposes game records.
5. Add matching `dev:[event-id]` and `build:[event-id]` scripts if this should be a first-class event command.
6. Build with `EVENT=[event-id] npm run build`.

## Tech stack

- Next.js 16 static export
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack Table and React Query
- YAML tournament data
- H9 tournament import parser
- SGF parsing and generated board previews via `@sabaki/go-board`, SVGO, Sharp, and Resvg
