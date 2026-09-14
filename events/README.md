# Events and tournament data

[Project README](../README.md) · [Contributing](../CONTRIBUTING.md) · [Archive presets](../configurations/README.md)

An event contains the history of one recurring competition. Each edition has metadata, players, and stages.
Stages describe how results were recorded: a final ranking, explicit games, or an imported H9 crosstable.
SGF records are linked to games separately.

Paths and commands below are relative to the repository root.

## Event directory

```text
events/<event-id>/
  config.ts           # Event identity and feature settings
  Logo.tsx            # Event branding
  i18n/<locale>.json   # Event-specific translations
  data/<year>.yml     # Edition metadata and stages
  data/...txt         # Optional H9 imports
  data/<year>.md      # Optional edition description
  players.yml        # Optional event-wide identity registry
  sgf/<year>/         # Original game records
  background.jpg     # Optional hero artwork; PNG also supported
```

The directories in [events/](./) are the event catalogue. Check each event's `config.ts` for its languages and features.

## Correct or add an edition

1. Find the event directory and a nearby edition with the same tournament format.
2. Edit or add `events/<event-id>/data/<year>.yml`. For an H9 import, add its text file under the same data directory.
3. Preserve source results and player identity. Include a source for any historical correction in your pull request.
4. Add original game records under `sgf/<year>/` and use the [SGF matcher](../tools/sgfMatcher/README.md) if available.
5. Run the event locally, for example `npx cross-env EVENT=wagc npm run dev`, and inspect the edition at `/en/<year>`.
6. Check standings, player links, and linked SGFs. Build the affected event before submitting data or route changes.
   Inspect parsing errors in the console too: the loader can log a failed stage and continue without it.

Use the event's supported locale in the URL. The `cross-env` examples work in PowerShell and POSIX shells.
Tournament data is cached in the development server. Restart it after editing YAML, H9, or player registries if changes
are not reflected. The [contribution guide](../CONTRIBUTING.md#check-your-change) describes the remaining checks.

## Add a new event

1. Create its directory and an [event configuration](#event-configuration) whose `id` matches the directory name.
2. Use a similar existing event as a reference for `Logo.tsx` and the translation keys. Add translations for each
   locale in the event definition. Optionally add a [hero background](#hero-backgrounds).
3. Add at least one edition using the formats below; add a player registry and SGFs as needed.
4. Run it with `npx cross-env EVENT=<event-id> npm run dev`.
5. Add it to the appropriate [archive preset](../configurations/README.md#create-a-preset) if it should appear in a
   collection. Choose a unique public prefix.
6. Build it with `npx cross-env EVENT=<event-id> npm run build` and check the resulting pages and assets.

Dedicated npm scripts are optional conveniences for frequently used events.

## Event configuration

A `config.ts` default export defines the event. For example:

```ts
import type { EventDefinition } from '@/schema/event';

const config: EventDefinition = {
  id: 'example',
  locales: ['en'],
  showCountry: true,
};

export default config;
```

| Field                 | Meaning                                                                        |
| --------------------- | ------------------------------------------------------------------------------ |
| `id`                  | Required; matches the event directory                                          |
| `locales`             | Required nonempty list; first locale is the default for redirects and metadata |
| `showCountry`         | Enable country columns and statistics                                          |
| `showBestPlace`       | Show best-place values in statistics                                           |
| `hideGamesWithoutSgf` | Hide unlinked games in game lists                                              |
| `categories`          | Category IDs used by stages and category results                               |
| `unknownRanks`        | H9 rank strings that should be treated as unknown                              |

Supported locale types and configuration types live in [src/i18n/consts.ts](../src/i18n/consts.ts) and
[src/schema/event.ts](../src/schema/event.ts).

Route prefixes, domains, external-site links, and SGF output formats belong to the
[archive preset](../configurations/README.md#event-settings-and-groups).
The shared interface palette is described in the [interface guide](../src/components/README.md#colors-and-themes).

### Hero backgrounds

Add `background.jpg` or `background.png` to the event directory. JPG takes precedence when both exist.
Without either, the hero has no decorative background. Use a wide banner, for example 1536 × 512, with the main subject
on the right to leave room for the heading and search.

Images fade into the current page color in both themes. Restart the development server after adding or removing an
image and rebuild to publish changes. Included backgrounds are AI-generated illustrations, not tournament photographs.

## Data reference

Examples below illustrate the syntax; replace their fictional players, dates, and filenames with verified source data.

- [Edition fields](#tournament-data)
- [Players and event-wide identities](#player-format)
- [Game strings and record links](#game-strings)
- [Shared stage fields](#stage-fields)
- [Stage selection and examples](#stage-types)

### Tournament data

Create one YAML file per edition in `events/[event-id]/data/[year].yml`.

```yaml
location: Poznan
country: PL
referee: John Smith
website:
  - https://example.org/tournament
notes:
  en: Optional note displayed with the edition.
  pl: Opcjonalna notatka widoczna dla edycji.
players:
  id1: Player One 5d (PL) |12345
  id2: Player Two 4d
top:
  - id1
  - id2
stages:
  - type: league
    order:
      - id1
      - id2
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
      - - id1-id2 id1:B+2.5
```

Top-level fields:

- `location`, `country`, `referee`, `website`, `notes` describe the edition.
- `players` maps local player IDs to player strings.
- `top` lists medalists. Values can use local player IDs, player names, or EGD IDs. A comma-separated value or YAML
  array means shared medal/place, for example `id3,id4` or `[id3, id4]`.
- `displayReversed` controls whether stages render newest/last first. Defaults to `true`.
- `stages` contains the stage definitions; it can be omitted for an announcement.
- `announcement` accepts `true` or localized text for an upcoming edition; announcements are excluded from the
  tournament overview tables.
- `start` and `end` supply dates when there are no dated stages. Otherwise the loader derives the edition's range
  from stage dates.
- `categories` lists categories present in the edition; H9 stage processing can also populate this list.

Optional Markdown descriptions can be stored next to YAML as `events/[event-id]/data/[year].md` or
`events/[event-id]/data/[year].[locale].md`. A localized description takes precedence; the generic file is the fallback.
See [src/schema/input.ts](../src/schema/input.ts) for the full input types.

### Player format

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
    original: Jane Alice Smith
    pastNames:
      - Jane Jones
    nickname:
      - GoJane
```

The registry's `name` supplies the canonical display name. `pastNames` links previous recorded names to the same
identity; `original` stores an original-name variant, and `nickname` supplies matcher aliases.
Both `pastNames` and `nickname` accept a string or a list. IDs must be unique within the registry.

### Game strings

Player IDs in explicit game strings must contain only letters and digits, such as id1 or 2.
Use edition-local IDs here, not a hyphenated registry ID.

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
- Explicit YAML scores accept whole numbers or half-points, `R` for resignation, `T` for timeout, and `?` for an unknown
  margin. `B+?` still records a black win; it is not a pending game.
- `!` marks a walkover.
- H9 round columns use `+` for a win, `-` for a loss, and `=` for a draw. A non-zero opponent followed by
  `=` is a jigo; zero-opponent variants such as `0=` and `0=/` mean that no game was played.
- In an H9 round column, `2?` or `2?/b` records a pending pairing against player 2. A standalone `?` has no opponent
  and is skipped. Pending games do not count as completed games, wins, draws, or losses.

Supported properties:

- `sgf:path/to/file.sgf` - path relative to `events/[event-id]/sgf/`.
- `ai:https://...` - AI analysis link.
- `yt:https://...` - YouTube link. Multiple links can be comma-separated.
- `ogs:https://...` - OGS game/review link.
- `round:N` - explicit round metadata for supplemental tournament games.
- `rotate:0`, `rotate:90`, `rotate:180`, or `rotate:270` - rotate the cleaned SGF and previews; original SGFs are unchanged.
- `black:<player-id>` or `white:<player-id>` - assign colors when the result does not establish them.

When an `sgf` prop is present, the app exposes `/sgf/...` routes and attaches configured preview URLs (`svg`, `png`,
`jpg`) to the game data.

### Stage fields

Shared stage fields include:

- `name` and `notes` as a string or localized object.
- `date` as a single date, date range, or array of dates/ranges.
- `egd`, `time`, `komi`, `rules`.
- `breakers` for table sorting where applicable.
- `promoted` and `placeOffset` for final-place calculation in aggregate stats.
- `category` for category-specific tournament stages.
- `location` and `country` for stage-specific venues; edition values can be derived from them when omitted.
- `columns` for table display columns where supported.
- `excluded` to omit a stage from player statistics and automatic podium derivation; the stage still renders, and
  tournament overview counts are calculated separately.
- `collapsed` to initially close the stage's expandable section.
- `unmatchedSgfs` for matcher-maintained records that could not be linked.

Supported breakers are `wins`, `sos`, `mms`, `sodos`, `sosos`, `direct`, `starting`, `rank`, and `score`.

### Stage types

Choose a stage according to the information available:

| Available results                                            | Stage type          |
| ------------------------------------------------------------ | ------------------- |
| Final ranking only                                           | `classification`    |
| Games arranged in rounds                                     | `league`            |
| Swiss/ladder rounds with initial order and optional playoffs | `ladder-table`      |
| Flat list of round-robin games                               | `round-robin-table` |
| Head-to-head final                                           | `final`             |
| H9 text crosstable                                           | `tournament`        |

#### `classification`

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

#### `league`

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

#### `ladder-table`

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

#### `round-robin-table`

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

#### `final`

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

#### `tournament`

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
- `dir` changes the matcher's SGF search directory relative to the event's `sgf/`; the default is the edition year.
- `scoringColumns` maps H9 score columns to breakers or category IDs.
- `games` supplements metadata or overrides results for pairings present in the H9 file. It does not add a pairing
  absent from that file. Player numbers refer to H9 places; include `round:N` to distinguish repeated pairings.
- `findSharedPlaces` derives shared places from matching configured breakers.
- `sharedPlaces` can explicitly map ranges such as `4-6`.
- `customBreakers` defines display names, descriptions, order, and visibility for non-standard score columns.
