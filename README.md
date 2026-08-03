# Go Tournaments Archive

A configurable Go tournament archive built as a static Next.js site. The same app can render one tournament archive or a
multi-event archive selected by configuration presets under `configurations/`. Supports multiple languages (`en` and
`pl` by default) through locale routes when enabled by each event config, and tournament data is stored in YAML and H9
text files under `events/[event-id]/data/` and game records in SGF files under `events/[event-id]/sgf/`.

The site supports tournament lists, edition detail pages, stage standings, game lists with SGF links, an all-games SGF
browser, per-edition SGF ZIP downloads, generated board previews, all-time player statistics, country statistics for
international events, and category medal tables for events that define age or other categories.

## Live sites

- [European Go Championships Archives](https://eurogofed.org/archives/) (`egc`, `epc`, `epq`, `esgc`, `ewgc` and `eygc`)
- [World Amateur Go Championships Archive](https://wagc.go.art.pl) (`wagc`)
- [Polish Go Championships Archive](https://mp.go.art.pl) (`pgc`)
- [Polish Youth Go Championships Archive](https://mpj.go.art.pl) (`pygc`)
- [Polish Women's Go Championships Archive](https://mpk.go.art.pl) (`pwgc`)
- [Polish Academic Go Championships Archive](https://amp.go.art.pl) (`pagc`)
- [Korea Prime Minister Cup](https://kpmc.go.art.pl) (`kpmc`)

## Events

Available event directories:

| Event ID | Archive                           | Notes                                                                            |
| -------- | --------------------------------- | -------------------------------------------------------------------------------- |
| `egc`    | European Go Championships         | Locale `en`, country stats                                                       |
| `epc`    | European Pro Go Championships     | Locale `en`                                                                      |
| `epq`    | European Pro Qualification        | Locale `en`                                                                      |
| `esgc`   | European Student Go Championships | Locale `en`, country stats                                                       |
| `ewgc`   | European Women Go Championships   | Locale `en`, country stats                                                       |
| `eygc`   | European Youth Championships      | Locale `en`, country stats, category stats for `u21`, `u20`, `u18`, `u16`, `u12` |
| `hrgc`   | Croatian Go Championships         | Locale `en`                                                                      |
| `nlk`    | Dutch Go Championships            | Locale `en`                                                                      |
| `iegc`   | Irish Go Championships            | Locale `en`                                                                      |
| `kpmc`   | Korea Prime Minister Cup          | Locales `en`, `pl`, country stats                                                |
| `pagc`   | Polish Academic Go Championships  | Locales `pl`, `en`                                                               |
| `pgc`    | Polish Go Championships           | Locales `pl`, `en`                                                               |
| `pwgc`   | Polish Women Go Championships     | Locales `pl`, `en`                                                               |
| `pygc`   | Polish Youth Go Championships     | Locales `pl`, `en`, category stats for `u21`, `u20`, `u18`, `u16`, `u15`, `u12`  |
| `wagc`   | World Amateur Go Championships    | Locales `en`, `pl`, country stats                                                |
| `wgl`    | Warsaw Go League                  | Locales `pl`, `en`                                                               |

Event-specific config, translations, colors, logo, data, and SGF files live in `events/[event-id]/`.

## Configuration modes

Runtime configuration is preset-based:

- `CONFIG=<name>` loads `configurations/<name>.yml`.
- If `CONFIG` is not set and `EVENT=<event-id>` is set, the app loads `configurations/single.yml` and substitutes
  `${EVENT}` with that event id.
- If neither `CONFIG` nor `EVENT` is set, the app loads `configurations/multi.yml`.

The resolved preset also decides which Next.js route files are active. One configured event enables the `*.single.*`
route tree. Multiple configured events enable the `*.multi.*` route tree. See
[`configurations/README.md`](configurations/README.md) for preset schema and merge rules.

## Prerequisites

- Node.js 24 LTS
- MySQL access only for `npm run extract:mp-db`

## Development

Install dependencies:

```bash
npm install
```

Run the default multi-event archive at [http://localhost:3000](http://localhost:3000):

```bash
npm run dev
```

Run a preset or a single-event archive with a convenience script:

```bash
npm run dev:honte
npm run dev:europe
npm run dev:poland
npm run dev:pgc
npm run dev:wagc
npm run dev:kpmc
```

Run the same modes, or any event without a convenience script, by setting the environment explicitly:

```bash
EVENT=epc npm run dev
CONFIG=europe npm run dev
```

Useful checks:

```bash
npm run lint         # Run Oxlint with type checking
npm run fmt          # Check formatting
npm run fmt:write    # Write formatting changes
npm run test         # Run tests
```

## Build and deploy

By default the app uses `output: 'export'`, so `npm run build` emits static files to `out/`. The `public/index.php` file
is also copied into the export for PHP-based static hosting setups that need a root redirect to the best supported
locale.

Build the default multi-event archive:

```bash
npm run build
```

Build a preset or a single-event archive with a convenience script:

```bash
npm run build:honte
npm run build:europe
npm run build:poland
npm run build:pgc
npm run build:kpmc
```

Build the same modes, or any event without a convenience script, by setting the environment explicitly:

```bash
EVENT=wagc npm run build
CONFIG=europe npm run build
```

Check `package.json` before relying on convenience scripts; only frequently used events and presets have dedicated
commands.

Serve the exported output locally:

```bash
npm run start
```

`npm run build` runs `prebuild` first. The prebuild step generates data JSON, cleaned SGFs, and raw SGFs, plus configured
board previews and ZIP files, into `public/data` and `public/sgf`; `next build` then exports static pages into `out/`.
Single-event builds write root data and SGF assets such as `public/data/tournaments.json` and `public/sgf/list.json`.
Multi-event builds write per-event assets such as `public/data/<prefix>/tournaments.json` and
`public/sgf/<prefix>/list.json`. Preset entries marked `external: true` appear in selectors but are skipped for internal
routes and generated assets.

Presets with `dynamic: true` produce a Next.js standalone server instead of `out/`. The selected preset is embedded in
the build, so `CONFIG` and `EVENT` are not needed at runtime. Player, player-category, and country stats pages are
rendered on demand instead of being generated for every possible path. The asset prebuild is unchanged: production
pages still read the generated JSON files from `public/data`, while the runtime SGF route can additionally render a
preview that was not pre-generated.

After building a dynamic preset, copy the public and client assets into the standalone directory and run the bundled
server:

```bash
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
cd .next/standalone
node server.js
```

Environment variables:

- `CONFIG` selects a configuration preset from `configurations/<name>.yml`.
- `EVENT` selects the event directory only through the default `single.yml` fallback when `CONFIG` is not set.
- `BASE_PATH` is substituted into the selected configuration preset. It sets the static deployment subdirectory and
  Next.js `basePath` only when that preset uses `${BASE_PATH}`, such as `single.yml`.
- `SGF_ASSET_WORKERS` optionally caps the number of worker threads used while generating SGF assets.

Build for a subdirectory deployment:

```bash
BASE_PATH=/archive EVENT=pgc npm run build
```

Named presets can instead define a fixed `basePath`; for example, `europe.yml` builds under `/archives`.

## App routes

The route examples below are shown without a base path. When the selected preset defines `basePath`, public routes and
generated data/assets are served below that prefix, for example `/archive/pl` in single-event mode or
`/archive/pgc/pl` in multi-event mode.

Single-event mode serves one archive at the root. Multi-event mode serves the selector at `/`, redirects
`/:eventPrefix` to that event's best locale, and serves event pages below the configured prefix.

Main static pages:

- `/` - single-event locale redirect, or the multi-event selector page.
- `/:eventPrefix` - multi-event locale redirect for one event.
- `/:locale` or `/:eventPrefix/:locale` - archive overview with winners, medalists, attendants, total stats, and country
  medalists when enabled.
- `/:locale/:year` or `/:eventPrefix/:locale/:year` - tournament detail page with event metadata, awarded players, stage
  tables, and game list.
- `/:locale/stats` or `/:eventPrefix/:locale/stats` - all-time player table.
- `/:locale/stats/:slug` or `/:eventPrefix/:locale/stats/:slug` - individual player statistics, achievements, events,
  and opponents.
- `/:locale/stats/:slug/:category` or `/:eventPrefix/:locale/stats/:slug/:category` - category-scoped player
  statistics when the event defines `categories`.
- `/:locale/stats/country` or `/:eventPrefix/:locale/stats/country` - all-time country table when `showCountry` is
  enabled.
- `/:locale/stats/country/:code` or `/:eventPrefix/:locale/stats/country/:code` - individual country statistics.
- `/:locale/stats/country/:code/:category` or `/:eventPrefix/:locale/stats/country/:code/:category` - category-scoped
  country statistics when the event defines `categories`.
- `/:locale/stats/games` or `/:eventPrefix/:locale/stats/games` - filterable browser of games that have linked SGFs.
- `/:locale/category/:category` or `/:eventPrefix/:locale/category/:category` - category medal/results page when the
  event defines `categories`.

Generated data/assets:

- `/data/tournaments.json` or `/data/:eventPrefix/tournaments.json` - tournament list for one event.
- `/data/:year.json` or `/data/:eventPrefix/:year.json` - tournament data for one year.
- `/data/i18n/:locale.json` or `/data/:eventPrefix/i18n/:locale.json` - merged base and event translations.
- `/data/sitemap/:locale.json` or `/data/:eventPrefix/sitemap/:locale.json` - navigation data.
- `/data/stats/summary.json` or `/data/:eventPrefix/stats/summary.json` - aggregate event summary for the home page.
- `/data/stats/players.json` or `/data/:eventPrefix/stats/players.json` - all player stats keyed by player slug.
- `/data/stats/player/:slug.json` or `/data/:eventPrefix/stats/player/:slug.json` - player stats payload.
- `/data/stats/countries.json` or `/data/:eventPrefix/stats/countries.json` - all country stats keyed by country code.
- `/data/stats/country/:code.json` or `/data/:eventPrefix/stats/country/:code.json` - country stats payload.
- `/data/stats/category/:category.json` or `/data/:eventPrefix/stats/category/:category.json` - category stats payload
  when the event defines `categories`.
- `/sgf/:year.zip` or `/sgf/:eventPrefix/:year.zip` - ZIP archive of cleaned SGFs for one tournament year when
  `generateZips` is enabled.
- `/sgf/.../*.sgf` or `/sgf/:eventPrefix/.../*.sgf` - cleaned SGF.
- `/sgf/.../*.raw.sgf` or `/sgf/:eventPrefix/.../*.raw.sgf` - original SGF.
- `/sgf/.../*.svg`, `/sgf/.../*.png`, `/sgf/.../*.jpg`, or the same paths below `/sgf/:eventPrefix/` - generated board
  previews when enabled by event config.
- `/favicon.svg`, `/apple-icon.png`, `/logo-black.svg`, `/logo-white.svg`, or the same files below `/:eventPrefix/` -
  generated event branding assets.

Production data and SGF files are prebuilt into `public/`. Development-only `route.*.dev.ts` handlers serve equivalent
JSON and SGF responses during `next dev`.

## Project layout

```text
configurations/      # Archive-level presets for single-event and multi-event modes
events/
  [event-id]/
    config.ts
    Logo.tsx
    colors.css
    i18n/<locale>.json
    data/
    sgf/
src/
  app/              # Next.js App Router pages and static route handlers
  components/       # UI, tables, stats, navigation, goban preview components
  data/             # YAML/H9 loaders, standings, tiebreakers, aggregate stats
  i18n/             # Locale types, active event locale helpers, server loader, translator
  libs/             # Shared utilities: dates, H9 parser, SGF/goban parser, sorting, math
  schema/           # Input and normalized data types
public/             # Root hosting files plus generated data/SGF assets from prebuild
tools/              # One-off extraction, SGF cleanup/matching, preview generation helpers
```

Aliases:

- `@/*` maps to `src/*`.
- `@tools/*` maps to `tools/*`.
- `@events/*` maps to `events/*`.

## Event configuration

Each event has `events/[event-id]/config.ts` exporting an `EventDefinition`:

```ts
type EventDefinition = {
  id: string;
  locales: [Locale, ...Locale[]]; // `Locale` is `en` or `pl`
  showCountry?: boolean;
  showBestPlace?: boolean;
  hideGamesWithoutSgf?: boolean;
  categories?: string[];
  unknownRanks?: string[];
};
```

Archive presets in `configurations/*.yml` can add per-event or shared event configuration fields:

```ts
type EventConfig = {
  generateJpgs?: boolean;
  generatePngs?: boolean;
  generateSvgs?: boolean;
  generateZips?: boolean;
  external?: boolean;
  domain?: string;
  prefix?: string;
  links?: (EventLink | EventLinkGroup)[];
};
```

Common flags:

- `id` must match the directory name under `events/`.
- `locales` defines which locale-prefixed routes and translation JSON files are generated for the event. The first item
  is the default locale used by redirects and default metadata.
- `showCountry` enables country columns, country medalists, and country stats routes.
- `showBestPlace` controls best-place display in stats tables.
- `hideGamesWithoutSgf` hides unlinked games in game lists for SGF-focused archives.
- `categories` enables category medal aggregation and category pages.
- `unknownRanks` lists rank strings that should be treated as unknown during rank parsing for the event.
- `prefix` controls the public route segment and generated asset subdirectory in multi-event presets.
- `external` keeps an event visible in selector data but skips internal route/static asset generation.
- `domain` is used for external selector links and absolute URLs.
- `basePath` belongs to the top-level archive preset, not an event entry or shared `config`; it is propagated to each
  resolved event for generated data and asset URLs.
- `trailingSlash` also belongs to the top-level archive preset and controls Next.js static route output.
- `links` adds extra event navigation links.
- `generateSvgs`, `generatePngs`, `generateJpgs` select preview variants emitted from SGF files during prebuild.
- `generateZips` emits `/sgf/:year.zip` or `/sgf/:eventPrefix/:year.zip` archives and shows a ZIP download action next
  to the games heading for tournaments with linked SGFs.

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
- `top` lists medalists. Values can use local player IDs, player names, or EGD IDs. A comma-separated value or YAML
  array means shared medal/place, for example `id3,id4` or `[id3, id4]`.
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

Player keys in tournament YAML are local to one edition. The loader maintains event-wide player identities, using EGD
numbers when present and player names otherwise. Add an optional `events/[event-id]/players.yml` registry when a player
needs a stable ID, canonical display name, country, historical original name, or SGF-matcher nickname:

```yaml
players:
  - id: jane-smith
    name: Jane Smith
    country: PL
    egd: 12345
    original: Jane A. Smith
    nickname:
      - GoJane
```

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

### `classification`

Final classification without games. Use it when an edition only has a final ranking. `order` accepts player IDs or
full player strings; nested arrays mark players sharing the same place. If the top-level `top` field is missing,
medalists are derived from the first three places.

```yaml
- type: classification
  date: 1996-10-26 - 1996-10-27
  order:
    - id1
    - - Player Two 1d (PL)
      - Player Three 2k (DE) |12345
    - id4
```

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
    - votes
  columns:
    - votes
  findSharedPlaces: true
  customBreakers:
    votes:
      order: desc
      hidden: false
      translations:
        en: Votes
        pl: Głosy
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
id1-id2 jigo
id1-id2 jigo black:id2
id1-id2 id1:!
id1-id2 id1:B+R sgf:2026/game.sgf yt:https://youtube.com/watch?v=abc
```

Result notes:

- `B+...` means black won; `W+...` means white won.
- `jigo` means a draw. It can be followed by the same properties as a decisive game.
- When a result does not identify the players' colors, use `black:<player-id>` or `white:<player-id>`. The referenced ID
  must be one of the game's players; the other player is assigned the opposite color. A color property that contradicts
  a `B` or `W` result is rejected.
- Scores can be numeric or `R` for resignation, `T` for timeout, `?` for unknown.
- `!` marks a walkover.
- H9-imported games may use loose results such as `+`, `-`, or `=`. In a round column, a non-zero opponent followed by
  `=` is a jigo; zero-opponent variants such as `0=` and `0=/` mean that no game was played.

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

SGF parsing, cleanup, and stringifying are handled by the internal parser in `tools/sgf/`. The `Sgf.clean()` helper is
used when serving cleaned SGFs and generating previews: it keeps the longest branch, strips comments, applies archive
root metadata, and emits compact SGF output. Raw SGFs remain available through `/sgf/.../*.raw.sgf`.

Available SGF tools:

```bash
npm run sgf        # Match SGFs to event
```

The matcher accepts:

```bash
npm run sgf <event>
npm run sgf -- --event <event>
npm run sgf -- -e <event>
EVENT=<event> npm run sgf
npm run sgf <event> -- --year 2025
npm run sgf <event> -- -y 2025
npm run sgf <event> -- --dry
npm run sgf <event> -- --force
npm run sgf <event> -- --verbose
npm run sgf <event> -- --strict
```

- The first positional argument selects the event to match. By default, `sgf` uses the `EVENT` env variable when no positional event nor `-e` / `--event` option is passed.
- Use npm's `--` separator before matcher options such as `--year` or `--dry`.
- `-y` / `--year` limits matching to one year.
- `-d` / `--dry` prints the matching summary without writing YAML. Combine it with `--force` to recheck already matched SGFs.
- `-f` / `--force` overwrites existing `sgf:` props.
- `-v` / `--verbose` prints per-stage matching details.
- `-s` / `--strict` reports SGF content issues such as the longest branch not being the main branch.

By default, the matcher keeps output compact: it prints a total summary and then lists unmatched games with their
reasons. Use `--verbose` when you need the full per-stage counts that include found, reused, newly matched, and unmatched
SGFs.

SGF previews and per-edition ZIP downloads are generated by `tools/assets/` during `npm run prebuild` into `public/sgf`
or `public/sgf/<prefix>`. Development uses the single-event and multi-event `route.*.dev.ts` SGF handlers for on-demand
responses. Enable output formats per event or preset with `generateSvgs`, `generatePngs`, `generateJpgs`, and
`generateZips`. ZIP files contain the same cleaned SGF content served by `/sgf/.../*.sgf` or
`/sgf/:eventPrefix/.../*.sgf`.

## Data and asset tools

These scripts are for one-off data maintenance:

```bash
npm run extract:mp-db          # Extract PGC data from MySQL and convert to YAML
npm run builder                # Interactive build helper for selecting EVENT and BASE_PATH
npm run players:update <event> # Add missing event-player registry entries
npm run players:egd <event>    # Enrich an event-player registry from EGD data
```

Relevant tool modules:

- `tools/assets/` prebuilds `public/data` and `public/sgf` before static export, using event-prefix subdirectories in
  multi-event presets.
- `tools/extract.ts` imports legacy MySQL data.
- `tools/sgfMatcher/` matches SGF files back to games and writes YAML.
- `tools/sgf/` parses, cleans, and stringifies SGF files before serving.
- `tools/svg.ts`, `tools/img.ts` generate board previews.

## Adding a new event

1. Create `events/[event-id]/`.
2. Add `config.ts`, `Logo.tsx`, `colors.css`, and translation JSON files for every locale listed in `config.ts`.
3. Add `data/[year].yml` files, plus H9 `.txt` files or Markdown descriptions if needed.
4. Add SGF files under `sgf/` if the archive exposes game records.
5. Add the event to `configurations/multi.yml` or another preset if it should appear in a multi-event archive.
6. Add matching `dev:[event-id]` and `build:[event-id]` scripts only if this should be a first-class convenience
   command.
7. Build a single-event archive with `EVENT=[event-id] npm run build`, or build a preset with
   `CONFIG=[preset-name] npm run build`.

## Tech stack

- Next.js 16 static export
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack Table and React Query
- YAML tournament data
- H9 tournament import parser
- Internal SGF parser with generated board previews via `@sabaki/go-board`, SVGO, Sharp, and Resvg
- ZIP generation via `fflate`
