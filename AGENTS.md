# AGENTS.md

Guidance for coding agents working in this repository.

## Project Overview

This is a static Next.js archive for multiple Go tournament sites. The active archive is selected with the `EVENT`
environment variable and defaults to `pgc`.

The app combines:

- event-specific config, translations, colors, data, and SGF files under `events/[event-id]/`
- shared Next.js App Router routes and UI under `src/`
- data loading, H9 parsing, standings, stats, and SGF helpers under `src/data`, `src/libs`, and `tools/`

Use the current code and `package.json` as the source of truth. Some older docs or notes may lag behind the actual
scripts.

## Repository Layout

- `src/app/` - Next.js App Router pages and static route handlers.
- `src/components/` - UI, table, stats, navigation, viewer, and goban components.
- `src/data/` - tournament YAML/H9 loading, stage parsing, standings, tiebreakers, stats, sitemap data.
- `src/libs/` - shared utilities including H9 parsing, SGF helpers, dates, sorting, category logic, and endpoints.
- `src/schema/` - normalized and input data types.
- `src/i18n/` - locale constants, translation loading, and server helpers.
- `events/[event-id]/` - per-event `config.ts`, `Logo.tsx`, `colors.css`, i18n JSON, YAML/H9 data, and SGF files.
- `tools/` - extraction, templates, SGF cleanup, SGF matcher, and the internal SGF parser used by tooling.

Path aliases:

- `@/*` -> `src/*`
- `@tools/*` -> `tools/*`
- `@event` -> `events/index.ts`
- `@event/schema` -> `events/schema.ts`
- `@event/*` -> the active event directory at build/dev time

## Commands

Install dependencies:

```bash
npm install
```

Development servers:

```bash
npm run dev
npm run dev:pgc
npm run dev:wagc
npm run dev:kpmc
npm run dev:pwgc
npm run dev:pagc
npm run dev:pygc
npm run dev:hrgc
npm run dev:wgl
```

Static builds:

```bash
npm run build
npm run build:pgc
npm run build:wagc
npm run build:kpmc
npm run build:pwgc
npm run build:pagc
npm run build:pygc
npm run build:hrgc
npm run build:wgl
```

Check event-specific build scripts before relying on them; for example, the current `build:hrgc` entry exists but maps
`EVENT` to `kpmc` in `package.json`.

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
- Do not edit generated output in `.next/` or `out/`.

## Event And Data Notes

Each event lives under `events/[event-id]/` and usually contains:

- `config.ts`
- `Logo.tsx`
- `colors.css`
- `i18n/en.json` and `i18n/pl.json`
- `data/*.yml`
- optional H9 `.txt` files in `data/`
- optional SGF files under `sgf/`

Tournament YAML files are parsed through `src/data/load.ts` and `src/data/stages.ts`. Stage types include `tournament`,
`league`, `ladder-table`, `round-robin-table`, and `final`.

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
npm run sgf:fix:pgc
npm run sgf:match:pgc
npm run sgf:match:wagc
npm run sgf:match:kpmc
npm run sgf:match:pwgc
npm run sgf:match:pagc
```

Matcher flags include:

- `-y` / `--year` - process one year
- `-d` / `--dry` - dry run
- `-f` / `--force` - overwrite existing `sgf:` props
- `-s` / `--strict` - report stricter SGF content issues
- `-v` / `--verbose` - print per-stage detail

The internal SGF parser is in `tools/sgf/`. The matcher is in `tools/sgfMatcher/`. Be conservative with matcher output
contracts: small wording and formatting details are often part of the expected behavior.

Normal site SGF routes are handled in `src/app/sgf/[...path]/route.ts`. Cleaned SGFs, raw SGFs, and generated preview
formats are exposed through that route depending on event config.

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
  `npm run sgf:match:wagc -- --year 1995 --dry --force` when the changed rule needs end-to-end confirmation.
- Static route or build output changes: run the relevant event build, for example `npm run build:pgc` or
  `npm run build:wagc`.
