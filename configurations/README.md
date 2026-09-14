# Configuration presets

[Project README](../README.md) · [Event definitions and data](../events/README.md)

A preset describes a published site: which events it contains, their public URLs, and shared build settings.
An event definition describes the competition itself. Keep tournament data and event identity under `events/`;
use this directory to assemble events into sites.

Commands below run from the repository root.

## Select a site

| Environment                    | Preset loaded                                          |
| ------------------------------ | ------------------------------------------------------ |
| `CONFIG=europe`                | `configurations/europe.yml`                            |
| `EVENT=wagc`, with no `CONFIG` | `configurations/single.yml`, substituting the event ID |
| Neither variable set           | `configurations/multi.yml`                             |

An explicit `CONFIG` takes precedence over `EVENT`. `CONFIG=single` still needs `EVENT` because that preset references it.

For example, run an event directly or run a collection:

```bash
npx cross-env EVENT=wagc npm run dev
npx cross-env CONFIG=europe npm run dev
```

These examples use the project's installed `cross-env` so they also work in PowerShell.
Replace `dev` with `build` to build the same selection.
Convenience commands such as `npm run dev:europe` are listed in [package.json](../package.json).
Restart the development server after changing the selected preset or its route settings.

## Create a preset

Create `configurations/example.yml`:

```yaml
title: Example archives
locales:
  - en
events:
  - id: wagc
    prefix: wagc
  - id: kpmc
    prefix: kpmc
config:
  generateJpgs: true
  generateZips: true
```

Run `npx cross-env CONFIG=example npm run dev`. This serves a selector at `/` and event pages such as
`/wagc/en` and `/kpmc/en`.

Each ID must refer to an existing `events/<id>/config.ts`. Use distinct, nonempty prefixes for a multi-event site.
With one configured event, routes use the single-event form, such as `/en`; omit its `prefix` as in `single.yml`.
Asset paths and URL helpers still read `prefix`, so setting one on a single-event preset would make them disagree
with the active routes.
See the [route guide](../src/app/README.md) for page and asset URL conventions.

## Archive settings

| Field           | Meaning                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------- |
| `events`        | Required list of event entries or groups                                                     |
| `title`         | Optional selector title, as a string or localized object                                     |
| `footer`        | Optional selector footer Markdown, as a string or localized object                           |
| `locales`       | Selector languages; the first is its default. Event pages use their own definition's locales |
| `config`        | Default event settings, applied to every entry                                               |
| `basePath`      | Subdirectory hosting path for the whole site, such as `/archives`                            |
| `trailingSlash` | Next.js trailing-slash behavior                                                              |
| `dynamic`       | Set to `true` for a standalone server; otherwise builds export static files                  |
| `crossLinks`    | Cross-event navigation: omitted/`false`, `true`, or `internal`                               |

`crossLinks: true` links to other configured events, including external entries.
`crossLinks: internal` includes only internal events. When eligible destinations exist, navigation includes
**All events** and **Other events**.
The current implementation excludes entries by comparing their prefix with the current event ID. Keep `prefix` equal
to `id` when using cross-links; a custom prefix can leave a self-link in this list.

Localized text uses locale keys:

```yaml
title:
  en: Polish Go Tournaments Archives
  pl: Archiwa Polskich Turniejów Go
```

`basePath`, `trailingSlash`, `dynamic`, and `crossLinks` are archive-level settings.
The resolved archive `basePath` and `dynamic` values are propagated to events.

## Event settings and groups

An event entry requires `id`. It can also set:

| Field                                          | Meaning                                                                      |
| ---------------------------------------------- | ---------------------------------------------------------------------------- |
| `prefix`                                       | Event URL segment and generated asset subdirectory in multi-event mode       |
| `domain`                                       | Domain for absolute URLs; required for an external event                     |
| `external`                                     | Keep the event in selectors but skip its internal pages and generated assets |
| `generateSvgs`, `generatePngs`, `generateJpgs` | Board-preview formats to generate                                            |
| `generateZips`                                 | Generate yearly cleaned-SGF downloads                                        |
| `links`                                        | Extra event navigation links                                                 |

Place shared event settings in archive-level `config`, group `config`, or individual entries.
Set `prefix` on the event entry, since it identifies that event's route.

```yaml
events:
  - title: World events
    config:
      generateZips: true
    events:
      - id: wagc
        prefix: wagc
      - id: kpmc
        prefix: kpmc
        generateZips: false
```

Group titles can also be localized. Groups organize the selector; they do not add another URL segment.

### Override order

From strongest to weakest:

1. The event entry.
2. Its group's `config`.
3. The archive's `config`.
4. The event's `config.ts` definition.

Arrays and objects are replaced, not deeply merged. For example, an entry's `links` replaces inherited links.
Archive-level `basePath` and `dynamic` are applied separately and cannot be overridden per event.

The implementation lives in [src/configuration.ts](../src/configuration.ts) and [src/events.ts](../src/events.ts).

### Extra navigation links

Extra navigation links support localized titles and URLs:

```yaml
config:
  links:
    - website: https://example.org
      title: Event website
      tooltip: Visit the event website
      place: top
```

The complete link and configuration types are in [src/schema/event.ts](../src/schema/event.ts).

## Environment variables and deployment

Preset strings support `${VARIABLE}` substitution through `yaml-env-defaults`.
The loader supplies `EVENT` and `BASE_PATH`; `BASE_PATH` defaults to an empty string.
A missing variable needs a default in the YAML or loading fails.

The included `single.yml` references both variables.
`europe.yml` uses a fixed `basePath: /archives`; setting `BASE_PATH` does not override a literal YAML value.

```bash
npx cross-env EVENT=wagc BASE_PATH=/archive npm run build
```

This publishes the single-event archive below `/archive`.
For static hosting and standalone-server instructions, see [building and deployment](../tools/deployment/README.md).

## Verify a change

Run the selected preset locally and check its selector, event links, locale redirects, and asset URLs.
Build that preset when changing routes, prefixes, output mode, or asset flags.
External entries still need a local event definition, but should navigate to their configured domain.
