# AGENTS.md

Guidance for coding agents working in this repository.

## Project Overview

This is a static Next.js archive for one or more Go tournament sites. The running archive is selected by a configuration
preset under `configurations/`.

The app combines:

- event-specific config, translations, colors, data, and SGF files under `events/[event-id]/`
- archive-level single-event and multi-event presets under `configurations/`
- shared Next.js App Router routes and UI under `src/`
- data loading, H9 parsing, standings, stats, and SGF helpers under `src/data`, `src/libs`, and `tools/`
- a prebuild asset pipeline under `tools/assets/` that writes production JSON, SGFs, previews, and ZIPs to `public/`

Use the current code and `package.json` as the source of truth. Some older docs or notes may lag behind the actual
scripts.

## Repository Layout

- `src/app/` - Next.js App Router pages and static route handlers.
- `src/components/` - UI, table, stats, navigation, viewer, and goban components.
- `src/data/` - tournament YAML/H9 loading, stage parsing, standings, tiebreakers, stats, sitemap data.
- `src/libs/` - shared utilities including H9 parsing, SGF helpers, dates, sorting, category logic, and endpoints.
- `src/schema/` - normalized and input data types.
- `src/i18n/` - locale constants, translation loading, and server helpers.
- `configurations/` - archive-level presets that decide event grouping, route prefixes, and shared asset flags.
- `events/[event-id]/` - per-event `config.ts`, `Logo.tsx`, `colors.css`, i18n JSON, YAML/H9 data, and SGF files.
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
npm run build:kpmc
```

Use explicit environment variables for the same modes, or for builds without convenience scripts:

```bash
EVENT=wagc npm run build
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
- Use existing path aliases instead of deep relative imports when the surrounding code does.
- Keep imports compatible with the configured `oxfmt` ordering.
- Formatting uses `oxfmt` with single quotes, semicolons, trailing commas where configured, and `printWidth` 120.
- Linting uses Oxlint with type-aware checks.
- Tests use `node:test` and `node:assert/strict`.
- Keep changes scoped. This repo has large data and SGF trees; avoid unrelated reformatting or bulk edits.
- Do not edit generated output in `.next/`, `out/`, `public/data/`, or `public/sgf/`.

## Event And Data Notes

Each event lives under `events/[event-id]/` and usually contains:

- `config.ts`
- `Logo.tsx`
- `colors.css`
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

The UI uses React 19, Next 16, Tailwind CSS 4, and event color variables. Prefer existing shared UI components and table
components before adding new patterns.

For event-specific visuals, use the event's `Logo.tsx`, `colors.css`, and translation JSON files. Do not hard-code one
event's branding into shared components unless the task is explicitly event-scoped.

When modifying table or stats behavior, check both regular and virtualized table paths where applicable:

- `src/components/table/StatsTable.tsx`
- `src/components/table/VirtualStatsTable.tsx`
- `src/components/table/TableRow.tsx`

## Validation Guidance

Choose the smallest useful validation for the change:

- Documentation-only changes usually need no command beyond reviewing the diff.
- Shared TypeScript/UI changes: run `npm run lint`; add `npm run test` when behavior is covered by tests.
- Formatting-sensitive changes: run `npm run fmt` or `npm run fmt:write` for touched files.
- SGF parser or matcher changes: run focused `npm run test`, then a relevant matcher command such as
  `npm run sgf wagc -- --year 1995 --dry --force` when the changed rule needs end-to-end confirmation.
- Static route or build output changes: run the relevant build, for example `npm run build:pgc`,
  `EVENT=wagc npm run build`, or `CONFIG=poland npm run build`.
