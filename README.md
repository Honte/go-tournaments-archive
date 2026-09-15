# Go Tournaments Archive

A Go tournament archive for browsing results, players, and game records across years. One codebase powers both
single-event sites and collections of events, with shared navigation, search, statistics, and an SGF game viewer.

Tournament history lives in version-controlled YAML, H9 text files, and SGF records. Contributions can include data
corrections, new editions, translations, or improvements to the shared interface. Running the archive does not require
a database or an external account.

## See it in use

- [European Go Championships Archives](https://eurogofed.org/archives/)
- [World Amateur Go Championships Archive](https://wagc.go.art.pl)
- [Polish Go Championships Archive](https://mp.go.art.pl)
- [Honte Archives](https://archives.honte.pl/)

Visitors can explore edition standings, sortable tournament tables, player and country statistics, category results,
and linked game records. Events choose their supported languages and which features to expose.

## Run locally

Install **Node.js 24 or newer**, then run these commands from your cloned repository:

```bash
npm ci
npm run dev:wagc
```

Open [http://localhost:3000/en](http://localhost:3000/en). This starts one event, the World Amateur Go Championships,
with its existing data.

To run the default collection of events instead:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and choose an event. Stop the current server before switching modes.

Use `npm run dev:europe`, `npm run dev:poland`, or `npm run dev:honte` for other collections.
See [configuration presets](configurations/README.md) to select any event or define your own collection.

## How it works

An **event** is a recurring competition, such as WAGC. An **edition** is one year's tournament; it contains one or more
**stages**, such as a league or a final. An **archive preset** chooses which events a site publishes.

1. A preset in `configurations/` selects events and deployment settings.
2. Each event in `events/` supplies its identity, translations, tournament data, and original SGFs.
3. Loaders in `src/data/` turn that source data into standings, player identities, statistics, and navigation.
4. Shared routes and components render the selected archive.
5. A production build generates JSON and game assets, then exports the site or creates a standalone server.

The application uses Next.js, React, TypeScript, and Tailwind CSS. Most sites are static exports; presets can also
enable a Next.js standalone server. Dependency versions and available commands are in [package.json](package.json).

## Contribute

Start with [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow, checks, and information to include in a pull request.
Data corrections and documentation improvements are useful contributions alongside code.

| I want to…                                          | Start here                                        |
| --------------------------------------------------- | ------------------------------------------------- |
| Correct results, add an edition, or create an event | [Events and tournament data](events/README.md)    |
| Link SGF records to games                           | [SGF matcher](tools/sgfMatcher/README.md)         |
| Change which events a site publishes                | [Configuration presets](configurations/README.md) |
| Change pages, navigation, or URL handling           | [App routes](src/app/README.md)                   |
| Change components, tables, or themes                | [Interface development](src/components/README.md) |
| Update player registries or run maintenance tools   | [Data and asset tools](tools/README.md)           |

## Build and deploy

Build the default archive and preview the static output:

```bash
npm run build
npm run start
```

The build runs asset generation first and writes the static site to `out/`.
For a different preset, subdirectory hosting, or a standalone server, see
[building and deployment](tools/deployment/README.md).

## Find your way around

| Directory         | Responsibility                                                             |
| ----------------- | -------------------------------------------------------------------------- |
| `events/`         | Source tournament data, event definitions, translations, and original SGFs |
| `configurations/` | Which events and settings belong to a published site                       |
| `src/app/`        | Next.js routes and data/SGF handlers                                       |
| `src/components/` | Shared pages, controls, tables, and game viewer                            |
| `src/data/`       | File loading, tournament processing, standings, and statistics             |
| `src/libs/`       | Domain helpers and shared utilities                                        |
| `src/schema/`     | Source-data and normalized TypeScript types                                |
| `src/i18n/`       | Shared translations and locale helpers                                     |
| `tools/`          | Asset generation, SGF matching, imports, and maintenance                   |
| `public/`         | Hosting files and generated production assets                              |

Edit source data and code. The contents of `.next/`, `out/`, `public/data/`, and `public/sgf/` are generated.
