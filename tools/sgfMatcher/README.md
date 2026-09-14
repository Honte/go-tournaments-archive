# SGF matcher

[Project README](../../README.md) · [Event data](../../events/README.md#game-strings) · [Other tools](../README.md)

The matcher links source SGF files to games in an event's tournament YAML. It reads player identities, game metadata,
and existing references, then reports proposed matches or writes `sgf:` properties.
It does not import files from a download directory or rewrite original SGF contents.

Run all commands from the repository root.

## Link records for an edition

1. Put SGFs under `events/<event-id>/sgf/<year>/`, following that event's filename conventions.
2. Confirm the edition YAML and any imported H9 file contain the relevant players and games.
3. Preview matching for that edition:

   ```bash
   npm run sgf wagc -- --year 2025 --dry
   ```

4. Review [unmatched reasons](#understand-unmatched-records). Add `--verbose` for per-stage detail. Check conflicting names, rounds, results, and duplicate
   records against the source; leave uncertain candidates unmatched.
5. When the proposed matches are correct, apply them:

   ```bash
   npm run sgf wagc -- --year 2025
   ```

6. Review the YAML diff and open the affected games in the local archive.

An `sgf:` path is relative to the event's SGF directory, for example `sgf:2025/game.sgf`.
For H9 stages, game player numbers refer to H9 places. A tournament stage's optional `dir` changes the SGF search
directory; otherwise the matcher searches the edition year. It scans `*.sgf` directly in that directory, not nested
subdirectories.

## Understand unmatched records

A record may be unmatched because its players cannot be identified uniquely, its round or result conflicts, another
file claims the game, or the game already has an SGF. Filenames containing spaces are also reported.

Compare the SGF metadata with the tournament source and [event player registry](../../events/README.md#player-format).
Use registry aliases for a verified player identity rather than changing the original SGF to force a match.
A dry run with `--force` helps distinguish an existing-link conflict from a new matching problem.

## Command reference

```text
npm run sgf <event> -- [options]
```

| Option                | Effect                                                                                        |
| --------------------- | --------------------------------------------------------------------------------------------- |
| `-e`, `--event <id>`  | Alternative to the positional event; otherwise falls back to the `EVENT` environment variable |
| `-y`, `--year <year>` | Process one edition; omit to process the event's numeric year YAML files                      |
| `-d`, `--dry`         | Report without writing YAML                                                                   |
| `-f`, `--force`       | Reconsider existing SGF links and allow their replacement                                     |
| `-v`, `--verbose`     | Print per-stage details as well as the total summary                                          |
| `-s`, `--strict`      | Report additional SGF content issues, such as a longest branch outside the main branch        |

Use npm's `--` separator before options. To inspect existing links as well as new candidates:

```bash
npm run sgf wagc -- --year 2025 --dry --force --verbose
```

`--strict` controls content diagnostics; it is not a dry run.
Normal output includes a total summary and unmatched records with reasons. Applying results can also update a
stage's `unmatchedSgfs` list; inspect the full YAML diff. Verbose output adds stage-level counts
for found, reused, matched, and unmatched records.

## Where to change matcher behavior

| Module                     | Responsibility                                     |
| -------------------------- | -------------------------------------------------- |
| [index.ts](index.ts)       | CLI options, edition iteration, and file writes    |
| [stage.ts](stage.ts)       | Stage processing                                   |
| [implicit.ts](implicit.ts) | Matching against H9-imported games                 |
| [lookup.ts](lookup.ts)     | Player identity lookup and ambiguous-name handling |
| [match.ts](match.ts)       | Shared match checks and conflict reasons           |
| [yaml.ts](yaml.ts)         | Applying results to YAML                           |
| [report.ts](report.ts)     | Human-readable reports                             |

Keep matching conservative. Add focused regression coverage beside the responsible module, then run a representative
dry run if the change affects the full workflow. Report text is observable behavior too.

Matching and serving are separate: the [asset pipeline](../README.md#generated-assets) cleans copies and produces
previews and downloads. Original source SGFs remain intact.
