---
name: sgf-matcher
description: Match, import, move, rename, and validate SGF files for go-tournaments-archive events. Use when Codex needs to process SGF candidates from a directory, match them against event YAML/H9 data, move matched files into events/<event>/sgf, rename archive files to the event filename convention, update sgf: references, rerun matcher checks, or investigate unmatched SGF matcher output.
---

# SGF Matcher

## Workflow

1. Inspect the current repo state before changing files:
   - `git status --short`
   - `Get-Content package.json`
   - event files under `events/<event>/data` and `events/<event>/sgf`
2. Identify the requested event, source SGF directory, target year or stage, and whether files should be moved or copied.
   Use copy/staging if the user has not explicitly approved removing the original source files.
3. Check current matcher support. The built-in matcher reads SGFs already under `events/<event>/sgf`; it does not import arbitrary source directories by itself unless the repo has since added that feature.
4. Stage candidate SGFs under the relevant archive directory:
   - normal event target: `events/<event>/sgf/<year>/`
   - tournament stages with `dir:`: use that stage directory instead of the plain year
   - keep unmatched or uncertain files in a candidate/inbox directory
5. Run the dry matcher before writing YAML:
   - `npm run sgf:match:<event> -- --year <year> --dry`
   - add `--force` when replacing stale or previously matched `sgf:` props
   - add `--strict` when branch-selection or variation issues matter
6. For each matched candidate, derive the archive filename from the event convention and matcher evidence.
   Rename the SGF file and update the matching `sgf:` path together; do not leave YAML pointing at the old name.
7. Rerun the dry matcher after every move/rename batch. Only run the real matcher when the dry output shows the expected matched, reused, removed, and unmatched state.
8. Run the write pass:
   - `npm run sgf:match:<event> -- --year <year>`
   - include `--force` only when the dry force output is already understood
9. Finish with the smallest useful validation:
   - matcher dry rerun for SGF/data work
   - `npm run lint` for TypeScript/tool changes
   - `npm run fmt:write` after implementation edits when formatting may have changed touched files

## Event Commands

Use the scripts in the current `package.json` as the source of truth. Known matcher scripts currently include:

```powershell
npm run sgf:match -- --year <year> --dry
npm run sgf:match:pgc -- --year <year> --dry
npm run sgf:match:wagc -- --year <year> --dry
npm run sgf:match:kpmc -- --year <year> --dry
npm run sgf:match:pwgc -- --year <year> --dry
npm run sgf:match:pagc -- --year <year> --dry
npm run sgf:match:epc -- --year <year> --dry
npm run sgf:match:iegc -- --year <year> --dry
```

Matcher flags:

- `--year <year>` / `-y <year>`: process one event year.
- `--dry` / `-d`: report without writing YAML.
- `--force` / `-f`: rebuild or overwrite existing `sgf:` matches.
- `--strict` / `-s`: report stricter SGF content issues.
- `--verbose` / `-v`: print per-stage details.

## Matching Rules

- For `tournament` stages, match against H9 data using player places, round, colors, result, and SGF metadata.
- For explicit stages (`league`, `ladder-table`, `round-robin-table`, `final`), match against YAML game entries and player IDs.
- The matcher uses both SGF root props and filename hints. Filename hints are parsed from patterns like:
  - `<round>-<BlackName>-<WhiteName>.sgf`
  - `<stage>-<round>-<BlackName>-<WhiteName>.sgf`
  - `YYYY-<round>-<BlackName>-<WhiteName>.sgf`
- Do not assume filename player order means black-first. Treat filename names as unordered participants unless SGF `PB`/`PW`, color data, or event-specific convention proves the order.
- Avoid filenames with spaces. Use the event's existing filename style for player names.
- If SGF metadata conflicts with the filename, schedule, result, OGS prop, or another candidate for the same game, keep the file unmatched and report the reason instead of forcing it through.

## Candidate Matching Heuristics

- Build a normalized tournament name map before matching candidate files. Include player display names, known IDs, slug/hash forms when available, reversed name order, and useful combinations of name parts.
- For multi-part names, consider partial or reordered combinations when evidence supports them. For example, `Luiz Carlos da Silva` may appear in SGF or filename metadata as `Silva Carlos`; keep these aliases tied to the same tournament player only when the normalized parts remain distinctive.
- Use date metadata as a soft constraint when available. If an event lasts four days and an SGF date is on the last day, prefer last-round candidates and down-rank early-round candidates unless other evidence is strong.
- Score matches from multiple independent signals instead of using a single field. Useful signals include normalized player names, round, date, colors, winner, result string, SGF `PB`/`PW`, `BR`/`WR` ranks when available, and existing YAML/H9 schedule data.
- Treat round, color, and winner as confirmation signals. They should increase confidence when they agree with the candidate game and block or down-rank matches when they contradict reliable event data.
- Establish an accuracy formula for large or ambiguous candidate sets. A practical first version is:

```text
score = player_confidence + round_confidence + date_confidence + color_confidence + winner_confidence + result_confidence - conflict_penalty
```

- Require exact or near-exact player identity before accepting a match. A high score from round/date alone is not enough.
- Prefer deterministic thresholds: auto-import only high-confidence unique matches, write a focused review report for medium-confidence matches, and leave low-confidence or conflicting matches untouched.
- Match in both directions when useful:
  - SGF-to-game: for each candidate SGF, find the best tournament game.
  - Game-to-SGF: for each tournament game missing `sgf:`, search candidate SGFs that can fit.
- Use the opposite-direction pass to catch cases where filename metadata is weak but the game schedule, date, color, and winner narrow the SGF candidates to one credible file.

## Ambiguous Candidate Reports

- Generate a focused manual-review report when games are not clear enough to import automatically but there are plausible candidates.
- Use one row per possible game-candidate pairing. Keep the report sortable and easy to edit by hand.
- Prefer Markdown tables unless another format is requested.
- Include these columns in order:

```markdown
| [ ] | year | stage | round | accuracy level | black from h9 | black candidate | white from h9 | white candidate | result from h9 | result candidate | path to file |
| --- | ---- | ----- | ----- | -------------- | ------------- | --------------- | ------------- | --------------- | -------------- | ---------------- | ------------ |
```

- Use `[ ]` as the first-cell placeholder so the user can mark accepted matches directly.
- Use `stage` only when it helps distinguish multiple stages; otherwise leave it blank instead of inventing a stage name.
- Use human-readable accuracy levels such as `high review`, `medium`, or `low`, and keep the underlying sort order stable by grouping strongest candidates first.
- Put H9/YAML tournament facts in the `from h9` columns and parsed SGF/filename facts in the `candidate` columns.
- When the tournament game already has an archived `sgf:`, still compare the candidate against the archived SGF's moves before excluding it. It may be the same game from another source, in which case report it as covered/duplicate rather than as a failed candidate.
- Keep `path to file` relative to the repository root or event candidate directory so the marked row is directly actionable.
- Regenerate the report after every applied batch so marked rows, moved files, and remaining candidates do not drift.

## Move And Rename Discipline

- Never overwrite an archived SGF unless the user explicitly asks and content comparison proves it is the intended replacement.
- Prefer `Move-Item -LiteralPath` or `Copy-Item -LiteralPath` on Windows, one exact path at a time.
- Keep unmatched candidates in the source/candidate directory with a small note or report; do not delete them just because the matcher did not find a hit.
- When replacing a stale YAML reference, update both the SGF filename/path and the YAML `sgf:` entry, then rerun dry matching.
- For covered duplicates, compare SGF game-branch content before removing only the duplicate candidate copy.
- When suggesting candidates for a game that is already covered by an archived SGF, always compare the move tree with the archived file. Matching moves mean the candidate is probably the same game from a different source; keep the archive file, remove or mark only the duplicate candidate, and record that conclusion in the report.

## Output Contract

When reporting back to the user, include:

- event, year/stage, source directory, and target archive directory
- files moved or copied
- files renamed and their new archive paths
- YAML files updated
- matcher command output summary: reused, matched, unmatched, removed
- remaining unmatched files with matcher reasons
- review report path and row count when ambiguous candidates remain
- validation commands run and whether formatting changed touched files
