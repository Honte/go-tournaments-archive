# Configuration Presets

This directory contains archive-level YAML presets. A preset decides which tournament events are present in the running
site, how they are grouped, which public route prefix each event uses, which events are handled as external links, and
which shared asset-generation flags are applied.

The active preset is loaded by [`src/configuration.ts`](../src/configuration.ts). The TypeScript shape is declared in
[`src/schema/event.ts`](../src/schema/event.ts).

## How a preset is selected

`CONFIG` selects the YAML file by name:

```
CONFIG=<name> -> configurations/<name>.yml
```

If `CONFIG` is not set, the code falls back to:

- `single` when `EVENT` is set
- `multi` when `EVENT` is not set

Examples:

```bash
EVENT=pgc npm run dev
```

Loads `configurations/single.yml`, substitutes `${EVENT}` with `pgc`, and runs a one-event archive.

```bash
npm run dev
```

Loads `configurations/multi.yml` and runs the multi-event archive.

```bash
CONFIG=poland npm run dev
```

Loads `configurations/poland.yml` regardless of `EVENT`.

The package currently includes convenience scripts for some presets:

```bash
npm run dev:honte
npm run dev:europe
npm run dev:poland
npm run build:honte
npm run build:europe
npm run build:poland
```

For presets without a build script, set `CONFIG` explicitly before `npm run build`.

## Environment substitution

YAML files are read through `yaml-env-defaults`, so string values can reference environment variables with
`${VARIABLE}` syntax.

`loadConfiguration()` currently provides these variables:

- `EVENT` from `process.env.EVENT`
- `BASE_PATH` from `process.env.BASE_PATH`, defaulting to an empty string

Current uses:

- `single.yml` uses `${EVENT}` for its only event id.
- `single.yml` and `europe.yml` use `${BASE_PATH}` as the archive-level `basePath`.

If a YAML file references a variable without a value, loading fails unless the YAML uses the library's default syntax.
That is why `CONFIG=single` must be paired with `EVENT=<event-id>`.

## Runtime flow

The resolved configuration is used by several parts of the app:

- `next.config.ts` loads it to choose route-file suffixes and set Next's `basePath`.
- `src/events.ts` loads each listed event definition from `events/<id>/config.ts` and merges it with the preset entry.
- `src/components/pages/EventSelectorPage.tsx` uses the original grouping from the preset for the multi-event selector.
- `src/libs/next.ts` uses the flattened event list for static params.
- `tools/assets/index.ts` uses the flattened event list for prebuild assets and skips entries marked `external: true`.

Route mode is based on the number of flattened events:

- one event enables `*.single.tsx` and `*.single.ts` route files
- more than one event enables `*.multi.tsx` and `*.multi.ts` route files
- in development, matching `*.dev.*`, `*.single.dev.*`, or `*.multi.dev.*` files are also enabled

## Schema

At the top level, a preset is an `ArchiveConfiguration`:

```yaml
title: Optional archive title
locales:
  - en
dynamic: false
events:
  - id: event-id
    prefix: public-prefix
basePath: optional-next-base-path
config:
  generateJpgs: true
```

### `dynamic`

Optional. When `true`, `npm run build` creates a Next.js standalone server instead of a static export. The resolved
preset is embedded in that build, so the standalone `server.js` does not need `CONFIG` or `EVENT` at runtime. Player,
player-category, and country stats pages are rendered on demand to avoid generating a file for every stats path.

This does not disable `prebuild`: the same JSON, SGF, preview, and ZIP assets are still written to `public/`, and the
standalone deployment must include that directory. See the root README for the copy and start commands.

### `title`

Optional title for the event selector page in multi-event mode. It can be a plain string or a localized object:

```yaml
title: Go Tournaments Archives
```

```yaml
title:
  en: Polish Go Tournaments Archives
  pl: ...
```

### `locales`

Optional locale list for the selector page itself. Event pages still use the locales from each event's own
`events/<id>/config.ts`.

When set, the first locale is used as the selector's default locale. `poland.yml` sets:

```yaml
locales:
  - pl
  - en
```

### `events`

Required list of event entries or event groups.

A flat event entry looks like this:

```yaml
events:
  - id: pgc
    prefix: pgc
```

`id` must match a directory under `events/` with a `config.ts` file. The event definition from that file supplies the
base event behavior, such as supported event locales, country-stat behavior, category support, and rank parsing rules.

`prefix` controls the public route segment and generated asset subdirectory in multi-event builds. For example:

```yaml
id: pgc
prefix: mp
```

uses routes and assets under `/mp/...` instead of `/pgc/...`.

When `prefix` is omitted, URL helpers and asset writers treat it as empty. This is the normal single-event shape:

```yaml
events:
  - id: ${EVENT}
```

### Event groups

Groups organize entries on the event selector page:

```yaml
events:
  - title: European Tournaments
    events:
      - id: egc
        prefix: egc
      - id: epc
        prefix: epc
```

Group titles can also be localized:

```yaml
title:
  en: Championships
  pl: ...
```

Groups may define their own `config` block. Archive-level `config` is applied first, group `config` is applied after it,
and the child event entry is applied last. Like top-level `config`, group `config` does not include `prefix`; set
`prefix` on each event entry instead.

### `basePath`

Top-level `basePath` is passed to Next.js through `next.config.ts` and is normalized by `normalizeBasePath()`.

Use it when the whole exported site is served below a subdirectory:

```bash
BASE_PATH=archive EVENT=pgc npm run build
```

Both `archive` and `/archive` normalize to `/archive`.

Do not confuse top-level `basePath` with `EventConfig.basePath`. Only values placed inside an event entry, group
`config`, or archive-level `config` become part of the resolved `EventContext`.

### `config`

Top-level `config` is shared event configuration. It provides default config to every listed event.

Supported fields come from `EventConfig`, except `prefix`. Set `prefix` on event entries because it identifies the
public route segment for a specific event.

```yaml
config:
  generateSvgs: false
  generatePngs: false
  generateJpgs: true
  generateZips: true
  external: false
  domain: https://example.org
  basePath: archive
  links:
    - website: https://example.org
      title: Example
      tooltip: Visit Example
      place: top
```

Common fields:

- `generateSvgs`, `generatePngs`, `generateJpgs`: choose SGF board preview formats produced during `prebuild`.
- `generateZips`: emit yearly SGF ZIP files and show ZIP download actions where available.
- `external`: keep the event visible in selector data but skip internal route/static asset generation by default.
- `domain`: absolute site domain used by external selector links and SGF metadata.
- `basePath`: event-level base path used by URL helpers that read from `EventContext`.
- `links`: extra link metadata attached to each resolved event.

## Merge precedence

Merge precedence, from strongest to weakest, is:

1. event entry in the preset
2. group `config`
3. top-level preset `config`
4. `events/<id>/config.ts`

Earlier entries override later entries. Arrays and objects are replaced, not deeply merged. For example, an item-level
`links` value replaces any top-level `config.links` value.

## Adding or changing a preset

1. Add or edit `configurations/<name>.yml`.
2. Make sure each `id` exists under `events/<id>/config.ts`.
3. Keep `prefix` values unique inside one multi-event preset.
4. Decide whether each entry is internal or `external: true`. If external, ensure `domain` is set.
5. Put shared asset flags in top-level `config` only when they should apply to every event.
6. Use group `config` for group-wide overrides.
7. Add `npm` scripts only for presets that are used often.
8. Validate with a focused run, for example `CONFIG=<name> npm run dev` or `CONFIG=<name> npm run build`.

For documentation-only changes in this directory, reviewing the diff is usually enough.
