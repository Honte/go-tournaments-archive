# Contributing

[Project overview and setup](README.md)

You can contribute tournament results, game records, translations, bug fixes, or documentation.
Use the [local setup](README.md#run-locally) first; all commands below run from the repository root.

## Choose the right starting point

For a data correction, find the event and edition under `events/<event-id>/data/`.
Compare nearby editions before editing: different events use different stage formats.
The [event guide](events/README.md) explains YAML, H9 imports, player identities, and game references.

For a bug report, include the affected event, URL or edition, steps to reproduce, expected behavior, and actual behavior.
For a visual issue, include the language, theme, screen size, and a screenshot when useful.
For a historical correction, include a source that lets a reviewer verify the result.

For a larger change, describe the intended behavior in an issue before investing in implementation.
Small corrections can go straight to a pull request.

## Make a focused change

1. Create a branch in your checkout, or fork the repository if you need your own writable copy.
2. Change the source files for one clear purpose.
3. Run the relevant checks below and inspect the affected pages or records.
4. Review the diff, including any formatting or generated files.
5. Open a pull request explaining the change and how you checked it.

Keep unrelated cleanup separate. Do not edit generated output in `.next/`, `out/`, `public/data/`, or `public/sgf/`.
For new dependencies or shared abstractions, first check whether the project or platform already provides what you need.

## Contributing data and game records

Preserve recorded names and results unless the correction is intentional and supported by a source.
Tournament YAML player IDs are local to an edition; an event's `players.yml` handles identities across editions.
Changing an H9 player's place can affect imported game IDs and SGF matching.

Keep original SGF contents intact. Put records in the event's source `sgf/` directory, then follow the
[matcher workflow](tools/sgfMatcher/README.md), starting with a dry run. Leave uncertain matches unlinked.
Every `sgf:` reference must point to a file relative to that event's SGF directory.

## Contributing translations

Update shared strings in `src/i18n/` and event-specific strings in `events/<event-id>/i18n/`.
Check the affected page in each supported language.

## Contributing code

Use existing components and domain helpers. Keep calculations and data transformations independent of rendering;
components should own layout, styles, focus, and interaction wiring.
The [route guide](src/app/README.md) and [interface guide](src/components/README.md) explain those boundaries.

Follow the surrounding TypeScript style:

- Prefer named function declarations for top-level functions.
- Use `@/`, `@tools/`, and `@events/` aliases for `src/`, `tools/`, and `events/`.
- Colocate tests as `<module>.test.ts`, using `node:test` and `node:assert/strict`.
- Test observable behavior with small in-memory inputs. Add a regression case for a changed parser or calculation.
- Keep translations and theme colors in their shared systems rather than hardcoding them in components.

[AGENTS.md](AGENTS.md) contains more detailed repository conventions.

## Check your change

| Change                                      | Useful validation                                                                        |
| ------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Documentation                               | Review examples and relative links; run formatting checks                                |
| YAML, H9, or SGF references                 | Inspect the affected edition; run a matcher dry run for SGF changes and a relevant build |
| Shared TypeScript or UI                     | Run lint and relevant tests; inspect the affected UI                                     |
| Parser, matching, or statistics             | Run focused regression tests; check representative event data                            |
| Routes, configuration, or production assets | Build the affected preset and inspect its output                                         |

The same basic checks run in [CI](.github/workflows/ci.yml):

```bash
npm run fmt
npm run lint
npm run test
```

Apply formatting with `npm run fmt:write`, then review the diff.
Lint includes type checking. A passing lint or test run does not establish that the UI looks correct or that a
production build succeeds. Data loading can log a stage parsing error and continue; inspect console output and verify
that every expected stage appears even when the command succeeds.

For UI work, check narrow and wide screens, light and dark themes, keyboard focus, and the relevant languages.
If you change theme behavior, also check Auto/system mode. Check both regular and virtualized tables when shared table
code changes.

## Describe the pull request

Explain the problem and resulting behavior, the affected events or pages, and any source supporting a data correction.
List the checks you actually ran and anything still unverified. Include before/after screenshots for visible changes.
Update the relevant topic guide if you change a command, data format, or user-facing behavior.
