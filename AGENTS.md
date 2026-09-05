# AGENTS.md

Guidance for coding agents working in this repository.

## Project Overview

This is a Next.js archive for one or more Go tournament sites, using static export by default or a standalone server
for dynamic presets. The running archive is selected by a configuration
preset under `configurations/`.

The app combines:

- event-specific config, translations, logos, optional hero backgrounds, data, and SGF files under `events/[event-id]/`
- archive-level single-event and multi-event presets under `configurations/`
- shared Next.js App Router routes and UI under `src/`
- data loading, H9 parsing, standings, stats, and SGF helpers under `src/data`, `src/libs`, and `tools/`
- a prebuild asset pipeline under `tools/assets/` that writes production JSON, SGFs, previews, and ZIPs to `public/`

Use the current code and `package.json` as the source of truth. Some older docs or notes may lag behind the actual
scripts.

## Repository Layout

- `src/app/` - Next.js App Router pages and static route handlers.
- `src/components/` - UI, table, stats, navigation, viewer, and goban components.
- `src/components/home/` - hero, tournament cards, medalists, and archive statistics.
- `src/components/search/` - archive search, result options, indicators, and select styles.
- `src/globals.css` - shared light/dark palette inputs and derived semantic color tokens.
- `src/libs/themes.ts` - shared `SELECT_THEME` mapping for `react-select`.
- `src/data/` - tournament YAML/H9 loading, stage parsing, standings, tiebreakers, stats, sitemap data.
- `src/libs/` - shared utilities including H9 parsing, SGF helpers, dates, sorting, category logic, and endpoints.
- `src/schema/` - normalized and input data types.
- `src/i18n/` - locale constants, translation loading, and server helpers.
- `configurations/` - archive-level presets that decide event grouping, route prefixes, and shared asset flags.
- `events/[event-id]/` - per-event `config.ts`, `Logo.tsx`, optional hero background, i18n JSON, YAML/H9 data, and SGF files.
- `public/` - root hosting files plus generated `data/` and `sgf/` assets created by `npm run prebuild`.
- `tools/` - extraction, templates, SGF cleanup, SGF matcher, and the internal SGF parser used by tooling.

Path aliases:

- `@/*` -> `src/*`
- `@tools/*` -> `tools/*`
- `@events/*` -> `events/*`

## Commands

Install dependencies:

```bash
npm install
```

Development servers:

```bash
npm run dev
npm run dev:honte
npm run dev:europe
npm run dev:poland
npm run dev:pgc
npm run dev:wagc
npm run dev:kpmc
```

Use explicit environment variables for the same modes, or for events without convenience scripts:

```bash
EVENT=epc npm run dev
CONFIG=europe npm run dev
```

Static builds:

```bash
npm run build
npm run build:honte
npm run build:europe
npm run build:poland
npm run build:pgc
```

Use explicit environment variables for the same modes, or for builds without convenience scripts:

```bash
EVENT=wagc npm run build
EVENT=kpmc npm run build
CONFIG=europe npm run build
```

Check `package.json` before relying on convenience scripts; only frequently used events and presets have dedicated
commands.

Build helpers:

```bash
npm run builder
```

Configuration selection:

- `CONFIG=<name>` loads `configurations/<name>.yml`.
- If `CONFIG` is not set and `EVENT=<event-id>` is set, the app loads `configurations/single.yml`.
- If neither `CONFIG` nor `EVENT` is set, the app loads `configurations/multi.yml`.

Route mode is based on the resolved preset: one configured event enables `*.single.*` route files, and multiple
configured events enable `*.multi.*` route files. Single-event public pages and assets use `/:locale`, `/data/...`, and
`/sgf/...`; multi-event pages and assets use `/:eventPrefix/:locale`, `/data/:eventPrefix/...`, and
`/sgf/:eventPrefix/...`.

`npm run build` runs `prebuild` first. Single-event builds write root `public/data` and `public/sgf` assets; multi-event
builds write `public/data/<prefix>` and `public/sgf/<prefix>` assets. Preset entries marked `external: true` appear in
selectors but are skipped for internal routes and generated assets.

Presets with `dynamic: true` use Next.js standalone output instead of `out/`; the selected configuration is embedded
in the build. Asset prebuild still runs. See `README.md` for standalone asset copying and startup instructions.

Checks:

```bash
npm run lint
npm run fmt
npm run test
```

Formatting:

```bash
npm run fmt:write
```

There is no `npm run tsc` script in `package.json`. If a standalone typecheck is needed, use the local TypeScript binary
directly, for example `.\node_modules\.bin\tsc.cmd --noEmit` on Windows.

## Coding Conventions

- TypeScript is strict and ESM-based.
- Prefer named function declarations over arrow functions assigned to variables at the top level of a file.
  Inline callbacks can remain arrow functions.
- Put the most important functions and public entrypoints near the top of files, after imports and required types.
  Place supporting helpers below their callers, taking advantage of function declaration hoisting.
- Use existing path aliases instead of deep relative imports when the surrounding code does.
- Keep imports compatible with the configured `oxfmt` ordering.
- Formatting uses `oxfmt` with single quotes, semicolons, trailing commas where configured, and `printWidth` 120.
- When writing or updating complex Tailwind class lists, use a multiline template literal grouped by purpose
  (layout, spacing and typography, colors, hover, focus), as in `src/components/ui/Button.tsx`.
  Keep short class lists inline and class names complete and static for Tailwind detection. Use `clsx` only when
  combining classes or applying conditions, not merely to group static styles. Do not add styling libraries,
  custom syntax, or runtime helpers for readability.
- Linting uses Oxlint with type-aware checks.
- Tests use `node:test` and `node:assert/strict`.
- Keep changes scoped. This repo has large data and SGF trees; avoid unrelated reformatting or bulk edits.
- Do not edit generated output in `.next/`, `out/`, `public/data/`, or `public/sgf/`.

### Feature libraries and UI boundaries

- Group related domain logic under `src/libs/<feature>/` when it spans distinct responsibilities. Give each module
  a cohesive purpose and a name that describes its behavior. Let actual responsibilities determine the split;
  keep small standalone helpers in single files and avoid empty layers or a fixed module template.
- Use `index.ts` as the feature's public entrypoint, exporting the functions and types consumers need. Prefer
  `@/libs/<feature>` in consumers and direct sibling imports inside the feature to avoid circular barrel imports.
  Keep feature-specific shared types in a local `schema.ts`; keep shared input/API types in `src/schema/`.
- Design library outputs around what consumers need to render and act on. Return plain data with the derived values,
  display content, and navigation targets the feature requires. Share these output types with consumers and avoid
  redundant representations or conversion layers. Reuse existing helpers and pass contextual dependencies explicitly.
- Keep rendering, styles, focus, and interaction wiring in components and hooks. Keep domain calculations independent
  of JSX and React hooks. Separate pure transformations from side effects such as navigation and persistence.
  When a feature needs a store, let it own state transitions and derived models so components do not repeat them.
- Separate work by when its inputs change: prepare reusable data once per relevant input change, then derive results
  from current interaction state. Memoize where this avoids repeated work, including every dependency that affects
  the result. Keep pure transformations non-mutating and result ordering deterministic.

### Test organization

- Colocate tests with the behavior they cover using `<module>.test.ts`. Split or move tests with their implementation;
  assertions belong to the module responsible for the behavior, including when that module is a shared helper.
- Test observable results and invariants rather than implementation details. Import the responsible module directly
  for focused tests and use the public entrypoint for integration tests. Cover interactions between modules without
  duplicating their full test suites.
- Keep simple test data local. Extract shared fixtures only when multiple suites reuse substantial setup; a few
  repeated constants do not need an abstraction. Preserve existing coverage during structural refactors and add
  regression checks for changed behavior.

## Event And Data Notes

Each event lives under `events/[event-id]/` and usually contains:

- `config.ts`
- `Logo.tsx`
- optional `background.jpg` or `background.png` (JPG takes precedence)
- `i18n/en.json` and `i18n/pl.json`
- `data/*.yml`
- optional H9 `.txt` files in `data/`
- optional SGF files under `sgf/`

Tournament YAML files are parsed through `src/data/load.ts` and `src/data/stages.ts`. Stage types include
`classification`, `tournament`, `league`, `ladder-table`, `round-robin-table`, and `final`.

The `tournament` stage imports H9 text files through the H9 parser in `src/libs/h9.ts` and related loading code in
`src/data/h9tournament.ts`. H9 player places are important because SGF matching and imported game IDs rely on them.

When editing YAML or H9 data:

- preserve existing event-specific conventions
- verify referenced `sgf:` paths exist relative to `events/[event-id]/sgf/`
- avoid changing player display names unless the task explicitly requires it
- treat local YAML player IDs as edition-local, not global identifiers

## SGF Workflow

SGF files live under `events/[event-id]/sgf/`, usually grouped by year.

Relevant tooling:

```bash
npm run sgf
```

Matcher flags include:

- `-y` / `--year` - process one year
- `-d` / `--dry` - dry run
- `-f` / `--force` - overwrite existing `sgf:` props
- `-s` / `--strict` - report stricter SGF content issues
- `-v` / `--verbose` - print per-stage detail

The internal SGF parser is in `tools/sgf/`. The matcher is in `tools/sgfMatcher/`. Be conservative with matcher output
contracts: small wording and formatting details are often part of the expected behavior.

Production SGF assets are generated by `tools/assets/` into `public/sgf` or `public/sgf/<prefix>` for multi-event
presets. Development SGF responses are handled by the single-event and multi-event `route.*.dev.ts` handlers. Cleaned
SGFs, raw SGFs, preview formats, and ZIPs are exposed depending on event or preset config.

## Frontend Notes

The UI uses React 19, Next 16, Tailwind CSS 4, and shared semantic color variables. Prefer existing shared UI
components and table components before adding new patterns.

For event-specific visuals, use the event's `Logo.tsx`, optional hero background, and translation JSON files. Event
`colors.css` files are no longer used. Keep event branding out of shared components unless the task is explicitly
event-scoped. Hero loading lives in `src/data/background.ts`; presentation lives in `src/components/home/`.

When modifying table or stats behavior, check both regular and virtualized table paths where applicable:

- `src/components/table/StatsTable.tsx`
- `src/components/table/VirtualStatsTable.tsx`
- `src/components/table/TableRow.tsx`

### Tournament overview tables

- `src/components/pages/TournamentsPage.tsx` serves the event-scoped `/:locale/tournaments` and
  `/:eventPrefix/:locale/tournaments` routes through thin single/multi wrappers. It loads existing tournament data
  and passes compact rows to `src/components/TournamentsTable.tsx`.
- Row aggregation and sorting live in `src/libs/tournaments.ts`, with focused coverage in
  `src/libs/tournaments.test.ts`. Format displayed date ranges on the server and pass the strings to the client:
  Node and browser Intl implementations can produce different whitespace and cause hydration mismatches.
- Exclude announcement editions. Category tables use category podiums and stage-level participant membership,
  deduplicate participants and games, and exclude BYE games. Their headings link to category pages. Keep SGF counts
  out of category tables; game-record metadata and category filters do not need extending for this page.
- Hide Stages independently in each table when all its rows have the same count. Country follows `showCountry`;
  non-category tables show SGFs only when the event has them. Preserve numeric/date sorting, surname sorting,
  direction-aware ordering within shared-place cells, and missing values last.
- Keep page links in `src/libs/urls.ts` and the side-menu entry in `src/data/sitemap.ts`. SGF counts use the existing
  year filter and navigation-aware `Link`; player links use canonical player IDs.
- Both homepage card variants pass the stats URL and label into `TournamentGrid`. Preserve its sixth-card 2:1
  vertical allocation across the horizontal divider, narrow-screen stacked buttons, and the below-grid stats link
  when the card is absent. The expansion threshold remains more than nine editions, with five preview cards.

## Color Guidelines

### Palette ownership

- Start in `src/globals.css`. The six palette inputs are `archive-page`, `archive-surface`, `archive-text`,
  `archive-shell`, `archive-accent`, and `archive-accent-text`, each with the `--color-` CSS prefix. Light defaults
  live in `@theme`; dark overrides live in `:root[data-theme='dark']`.
- Recolor through these inputs first. Neutral roles derive from page/surface/text; accent roles use `color-mix()`
  and relative `oklch()`. Preserve the derivation instead of replacing each role with an unrelated literal.
  Change a role formula only when its contrast or behavior needs a distinct adjustment.
- Keep component fixes scoped to the affected component or shared primitive. Change a global token only when all
  its consumers should change. Preserve the other theme when a request targets only light or dark mode.
- Reuse an existing semantic role before adding a token. If a new role is necessary, define it centrally and check
  both themes. Avoid component-local hex colors, generic gray/blue utilities, duplicated palette maps, or new
  `--color-event-*` variables for theme-dependent UI.

### Choose colors by role

The names below omit the `archive-` prefix; use it in Tailwind utilities and `--color-archive-*` variables.

| UI role                  | Tokens and usage                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------- |
| Page and raised surfaces | `page`, `surface`, `surface-muted`                                                  |
| Text and separators      | `text`, `text-muted`, `border`, `border-strong`                                     |
| Colored links            | `link`, `link-hover`; do not use the raw accent for readable link text              |
| Filled accents           | `accent-fill`, `accent-fill-hover` with `accent-text`                               |
| Focus indicators         | `focus-ring` for outlines, rings, and focus borders                                 |
| Neutral controls         | `control`, `control-hover` with `text`                                              |
| Selected controls        | Always pair `control-selected` with `control-selected-text`                         |
| Subtle accents           | `accent-soft`, `surface-hover`, `surface-hover-accent`, `surface-tint`              |
| Table states             | `row-hover`, `row-stripe`, `row-stripe-subtle`; preserve regular/virtualized parity |
| Header and footer        | `shell`, `shell-muted` with `shell-text`                                            |
| Go stones                | `stone-black`, `stone-white`, and matching `stone-stroke-*` roles                   |

`accent` is the base hue; `accent-hover` is its decorative hover variant. Do not use one accent token interchangeably
for text, filled backgrounds, and focus rings. The light and dark themes derive these roles differently. Transparent
overlays also depend on the surface underneath them.

### Components and integrations

- Prefer shared `Button`, `PillLink`, `SegmentedControl`, and link components over recreating their state colors.
  For example, a colored text link uses `text-archive-link hover:text-archive-link-hover`; an accent badge uses
  `bg-archive-accent-fill text-archive-accent-text`.
- Use Tailwind semantic utilities in JSX and `var(--color-archive-...)` in inline styles or SVG attributes.
  Icons that should inherit their text color can use `currentColor`.
- Use `SELECT_THEME` from `@/libs/themes` for `react-select`. Follow `FacetSelect` for explicit selected-option
  foreground/background pairs and `src/components/search/searchStyles.ts` for search-specific styles. The select
  theme's `primary` serves focus borders/shadows, so it must not implicitly determine selected-option contrast.
- Keep intentional fixed colors scoped: `shell-text` stays light on the dark shell, and Go stone fills retain their
  black/white meaning across themes. Stone strokes can adapt for contrast. Existing translucent white shell controls,
  image masks, and generated board artwork are separate from the general page palette.
- Preserve the async `ThemeProvider` from `@wrksz/themes/next` and client hooks from `@wrksz/themes/client`.
  Keep `data-theme`, the Auto/system default, local-storage persistence, and `suppressHydrationWarning` on the root
  HTML element. `disableTransitionOnChange` prevents restoration flashes during locale navigation; do not replace
  it with globally disabled hover transitions or a second theme persistence implementation.
- Use `ThemeLogo` and its `data-theme-image` CSS switching for theme-specific logos. Prefer CSS token updates over
  JavaScript branches on the active theme for ordinary colors.

### Validate color changes

Inspect light and dark themes, plus Auto/system behavior when theme handling changes. Check text against its actual
background, including hover, selected, disabled, and keyboard-focus states. Derived colors do not guarantee contrast
after palette edits. For global palette changes, sample headers/footers, cards, links, search and filters, tables,
and the game viewer; for a local fix, check the affected surface and its shared variants. Check locale navigation for
flashes when changing theme restoration. Run `npm run lint` for code changes and report browser validation separately;
lint or formatting alone does not establish visual correctness.

## Validation Guidance

Choose the smallest useful validation for the change:

- Documentation-only changes usually need no command beyond reviewing the diff.
- Shared TypeScript/UI changes: run `npm run lint`; add `npm run test` when behavior is covered by tests.
- Formatting-sensitive changes: run `npm run fmt` or `npm run fmt:write` for touched files.
- SGF parser or matcher changes: run focused `npm run test`, then a relevant matcher command such as
  `npm run sgf wagc -- --year 1995 --dry --force` when the changed rule needs end-to-end confirmation.
- Static route or build output changes: run the relevant build, for example `npm run build:pgc`,
  `EVENT=wagc npm run build`, or `CONFIG=poland npm run build`.
