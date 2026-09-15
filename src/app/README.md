# App routes

[Project README](../../README.md) · [Configuration](../../configurations/README.md) · [Interface](../components/README.md)

Routes connect the selected archive to shared page components and data loaders. Before adding a route, decide whether
it belongs to the whole archive, an event, an edition, or a statistics view.

## Route selection

[next.config.ts](../../next.config.ts) selects file suffixes from the flattened preset:

- One configured event enables `*.single.tsx` and `*.single.ts`.
- Multiple configured events enable `*.multi.tsx` and `*.multi.ts`.
- Development also enables the matching `*.dev.*` handlers.

Keep single/multi wrappers thin and put shared page behavior in [components/pages/](../components/pages/).
URL builders live in [libs/urls.ts](../libs/urls.ts), static-parameter helpers in [libs/next.ts](../libs/next.ts), and
event navigation in [data/sitemap.ts](../data/sitemap.ts).

## Public page URLs

Let `<event-root>` mean `/:locale` in single-event mode or `/:eventPrefix/:locale` in multi-event mode.
For example, `/en/2025` and `/wagc/en/2025` are the same edition view in different modes.
All URLs below sit under the preset's `basePath` when one is configured.

| URL                                          | View                                                  |
| -------------------------------------------- | ----------------------------------------------------- |
| `/`                                          | Single-event locale redirect, or multi-event selector |
| `/:eventPrefix`                              | Multi-event redirect to that event's best locale      |
| `<event-root>`                               | Event overview and tournament cards                   |
| `<event-root>/tournaments`                   | Sortable edition statistics and category tables       |
| `<event-root>/:year`                         | Edition metadata, standings, and games                |
| `<event-root>/stats`                         | All-time player table                                 |
| `<event-root>/stats/:slug`                   | Player statistics and opponents                       |
| `<event-root>/stats/:slug/:category`         | Category-specific player statistics                   |
| `<event-root>/stats/country`                 | Country table                                         |
| `<event-root>/stats/country/:code`           | Country statistics                                    |
| `<event-root>/stats/country/:code/:category` | Category-specific country statistics                  |
| `<event-root>/stats/games`                   | Searchable linked game records                        |
| `<event-root>/category/:category`            | Category results and medal table                      |

Country views depend on `showCountry`; category views depend on configured `categories`.
Separate player/country category pages require results in at least two available categories; otherwise use the
unfiltered statistics page. Country URL codes are lowercase, such as `pl`.
Player slugs represent event-wide identities, not edition-local YAML player IDs.

## Data and game assets

For single-event sites, the data root is `/data` and the SGF root is `/sgf`.
For multi-event sites, use `/data/:eventPrefix` and `/sgf/:eventPrefix`.
The archive `basePath` applies to these URLs too.

| Path below the data root         | Payload                              |
| -------------------------------- | ------------------------------------ |
| `/tournaments.json`              | Edition list                         |
| `/:year.json`                    | One edition                          |
| `/i18n/:locale.json`             | Merged shared/event translations     |
| `/sitemap/:locale.json`          | Navigation                           |
| `/search/:locale.json`           | Localized search index               |
| `/stats/summary.json`            | Event summary                        |
| `/stats/players.json`            | All player statistics keyed by slug  |
| `/stats/player/:slug.json`       | One player                           |
| `/stats/countries.json`          | All country statistics keyed by code |
| `/stats/country/:code.json`      | One country                          |
| `/stats/category/:category.json` | One category                         |

Below the SGF root, `/list.json` contains the linked-game index used by the game browser.
`/:year.zip` downloads a year's cleaned records when ZIP generation is enabled.
Game paths end in `.sgf` for cleaned content, `.raw.sgf` for original content, or `.svg`, `.png`, and `.jpg`
for enabled previews.

Branding assets (`event-icon.svg`, `event-icon.png`, `logo-black.svg`, and `logo-white.svg`) live at the site root in
single-event mode and under the event prefix in multi-event mode.
The multi-event selector uses `/multi-icon.svg` and `/multi-icon.png`.

## Development and production

Development handlers generate JSON and SGF responses on demand. Production builds generate files under `public/`.
A static export serves those files alongside pre-rendered pages; dynamic presets render individual player/country
statistics pages on demand from the same generated data. SGF handlers have development-only suffixes, so standalone
production also requires pre-generated SGFs and previews; it does not generate missing previews on demand.

When changing paths, update URL helpers, navigation, and asset generation together where relevant.
Check both single- and multi-event modes and a nonempty `basePath`.
Run a relevant production build to verify generated routes and assets; see
[building and deployment](../../tools/deployment/README.md).
