# Go Tournaments Archive

A multi-event Go tournament archive — a static Next.js site (no server required) supporting multiple events (Polish Go Championships, WAGC, etc.). Supports Polish and English via locale-based routing (`/pl`, `/en`). Tournament data is stored as YAML files in `events/[event-id]/data/`.

## Sites

- [Polish Go Championships Archive](https://mp.go.art.pl)

## Prerequisites

- Node.js 18 or later
- npm (included with Node.js)
- MySQL client — only needed for `npm run extract:mp-db` (data import tool)

## Development

**Tech stack:** Next.js, React 19, TypeScript, Tailwind CSS 4, YAML data files, SGF game records.

1. Install dependencies: `npm install`
2. Run the development server: `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000) to see the result.

Other useful commands:

```bash
npm run tsc          # Type-check without emitting
npm run lint         # Run ESLint
npm run build        # Build static output to /out
npm run start        # Serve the /out directory locally
```

## Deployment

The build produces static HTML, JS and CSS files. Additionally, it has `index.php` and `.htaccess` file for standard PHP servers to ensure that all routes would lead to `index.html`.

1. Set the `EVENT` environment variable to select the event to build (e.g. `EVENT=pgc` or `EVENT=wagc`). Defaults to `pgc`.
2. Optionally set `SGF_URL_PREFIX` to override the SGF base URL defined in the event's `config.ts`.
3. Run `npm run build`
4. Copy contents of `out` to the server

## Adding a new tournament

Create `[year].yml` file in `events/[event-id]/data/` directory

```yaml
location: Poznan # location name
referee: John Smith # optional referee name
website: https://mp.go.art.pl/2025 # optional website
players: # players in format: [id]: [name] [surname] [rank]
  id1: Player Name 5d
  id2: Second Name 4d
  id3: Third Name 1k
  id4: Fourth Name 2d
top: # medalists; can be comma separated if more players were rewarded
  - id1
  - id2
  - id3,id4
stages: # tournament can have multiple stages
  - type: league # stage type: one of league, ladder-table, round-robin-table or final
    date: 2024-11-07 - 2024-11-10 # date of tournament in format of single YYYY-MM-DD, or range of YYYY-MM-DD - YYYY-MM-DD
    egd: https://www.europeangodatabase.eu/EGD/Tournament_Card.php?&key=T241107A # optional EGD link
    time: fischer 60m + 30s # string with time setup for the stage
    komi: 6.5
    breakers: # order of breakers, supported: wins, sos, mms, sodos, sosos, direct, starting, rank
      - wins
      - sodos
      - direct
      - starting
    rounds: # array of rounds with array of games in format `[black player id]-[white player id] [winner-player-id]:[result] [game props]`
      - # rounds
        - id1-id2 id1:B+2.5
        - id3-id4 id3:B+1.5
```

### Player format

```yaml
players:
  id1: Player Name 5d # name + rank
  id2: Player Name 4d (JP) # with country code in parentheses
  id3: Player Name 3d |12345 # with EGD pin
  id4: Player Name 2d (PL) |67890 # with both
```

Supported ranks: `Xk` (kyu), `Xd` (dan), `Xp` (professional), e.g. `5k`, `1d`, `2p`.

### Stage types

**`league`** — round-robin with tiebreakers; `rounds` is an array of rounds, each round is an array of game strings.

**`ladder-table`** — Swiss-system ladder; requires an `order` field listing initial seeding and an optional `playoffs` list of games played after the main rounds.

```yaml
- type: ladder-table
  date: 1983-09-30 - 1983-10-02
  order:
    - id1
    - id2
    - id3,id4 # comma-separated means tied for a position
  rounds:
    - - id1-id2 id1:B+R
      - id3-id4 id3:B+5.5
  playoffs:
    - id2-id3 id2:W+R
```

**`round-robin-table`** — all games listed flat (no round structure), sorted by score then rank. Supports an optional localized `name`.

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

**`tournament`** — imports results from an H9 format file (used by EGD). The stage references an external `.txt` file parsed by `loadH9()`. Supports `scoringColumns` to extract score-based tiebreakers and `findSharedPlaces` for equal-place detection.

```yaml
- type: tournament
  file: data/2025/wagc2025.txt
  scoringColumns:
    - wins
    - sos
  findSharedPlaces: true
```

**`final`** — head-to-head final; `requiredWins` sets how many wins are needed to win the match; `includePrevious` (true/false) controls whether league results count toward the final.

```yaml
- type: final
  date: 1997-11-29
  requiredWins: 2
  includePrevious: false
  games:
    - id1-id2 id2:W+R
    - id2-id1 id1:B+29.5
```

### Game properties

Supported game properties appended to a game string:

- `sgf` - path to sgf file relative to the event's `sgf/` directory, e.g. `sgf:2025/black-vs-white.sgf`
- `ai` - link to AI analysis, e.g. `ai:https://ai-sensei.com/game/iTdWZbZ7L5Yu4Lh0v6hEYhfUtvq2/G51DzNwBgA77fbZIiIxm`
- `yt` - link to YouTube video, e.g. `yt:https://youtube.com/watch?v=FhK57HL7ijI`
- `ogs` - link to OGS game, e.g. `ogs:https://online-go.com/review/772950`

### Preparing an SGF

Place SGF files under `events/[event-id]/sgf/[year]/`. Then:

```bash
npm run sgf:fix:pgc      # Fix SGF property names (e.g. RB→BR, RW→WR)
npm run sgf:match:pgc    # Match SGF files to games in YAML and write back `sgf:` props
```

`sgf:match:pgc` accepts `-y <year>` to limit to one year and `-f` to force overwrites. Use `:wagc` variants for the
WAGC event.

SVG (and optionally PNG) board previews are generated automatically during `npm run build` from the SGF files in
`events/[event-id]/sgf/` — there is no manual preview step and the images are not committed to the repo. Set
`generatePngs: true` in the event's `config.ts` to also emit PNG variants.

## Adding a new event

1. Create `events/[event-id]/` directory with:
   - `config.ts` — implement `EventConfig` with `id`, `domain`, `sgfUrlPrefix`, `defaultLocale`, `defaultCountry`; set `showCountry: true` for international events
   - `Logo.tsx` — event logo component
   - `colors.css` — CSS color variables
   - `i18n/pl.json`, `i18n/en.json` — translations
   - `data/` — tournament YAML files
   - `sgf/` — SGF files and SVG previews
2. Build with `EVENT=[event-id] npm run build`
