# Data and asset tools

[Project README](../README.md) · [Contributing](../CONTRIBUTING.md)

Run commands from the repository root. Normal development uses the checked-in event files; maintenance tools are only
needed for the task they perform.

## Choose a tool

| Task                                   | Command                                 | Result                                                                                          |
| -------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Match game records                     | `npm run sgf wagc -- --year 2025 --dry` | Preview SGF links; see the [matcher guide](sgfMatcher/README.md) before writing                 |
| Add missing player identities          | `npm run players:update wagc`           | Adds missing entries to the event's `players.yml`                                               |
| Enrich player identities from EGD      | `npm run players:egd wagc`              | Updates the registry using EGD data and reports unmatched, ambiguous, or conflicting identities |
| Choose a build interactively           | `npm run builder`                       | Prompts for a preset/event and applicable base path                                             |
| Generate production assets             | `npm run prebuild`                      | Writes generated data and SGF assets; also runs automatically before a build                    |
| Import legacy Polish championship data | `npm run extract:mp-db`                 | Imports MySQL data using the settings in `tools/extract.ts`                                     |

Replace `wagc` with the event you are maintaining. Player-registry commands write source files: review the diff and
identity warnings. See [player format](../events/README.md#player-format) before changing canonical identities.

The legacy MySQL importer is event-specific. It requires database access and editing the import settings in
[extract.ts](extract.ts); it is not part of setup or normal archive operation.

## Generated assets

[assets/index.ts](assets/index.ts) runs before `next build`. It generates event JSON, cleaned and raw SGF copies,
the linked-game index, and the previews and ZIP downloads enabled by the selected event/preset.
Event branding is rendered by Next.js routes during the build.

Single-event builds use `public/data/` and `public/sgf/`. Multi-event builds use event-prefix subdirectories.
External events are skipped. Both generated directories are replaced on each prebuild; outputs from a previous
preset are not retained. Only SGFs linked from tournament games are included.
`SGF_ASSET_WORKERS` sets the requested worker count, capped by the number of tasks; by default the pipeline uses
one fewer than the available CPU parallelism, with a minimum of one worker.

The parser in [sgf/](sgf/) provides `Sgf.clean()`. It selects the branch ending at a unique `N[END]` node, or the unique
longest branch when no end marker exists. Ambiguous end markers or equally long branches raise an error.
It removes non-root move annotations, applies archive root metadata (including an export comment), applies any
configured rotation, and emits compact output. Root setup stones are retained.
Cleaning affects served/generated copies; original files stay under `events/<event-id>/sgf/`.
Raw downloads expose the original record.

Preview formats are controlled by `generateSvgs`, `generatePngs`, and `generateJpgs`; `generateZips` creates yearly
archives of the same cleaned SGFs served individually.
[svg.ts](svg.ts) and [img.ts](img.ts) generate board previews.

During development, route handlers produce JSON, individual SGFs, and previews on demand. The SGF handler does not
serve yearly ZIPs; use a production build to verify those downloads.
Production uses prebuilt files; see the [route reference](../src/app/README.md) and
[build/deployment guide](deployment/README.md) for output locations and runtime differences.

Do not edit generated assets to correct tournament data. Change the source event files and regenerate them.
