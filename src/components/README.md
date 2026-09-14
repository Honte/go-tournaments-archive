# Interface development

[Project README](../../README.md) · [Contributing](../../CONTRIBUTING.md) · [Routes](../app/README.md)

All events share these components. Event identity comes from definitions, translations, logos, and hero images under
`events/`; shared components should work with any configured event.

## Find the responsible component

| Area                            | Location           |
| ------------------------------- | ------------------ |
| Page composition                | [pages/](pages/)   |
| Homepage hero and edition cards | [home/](home/)     |
| Search and filters              | [search/](search/) |
| Table rendering                 | [table/](table/)   |
| Shared controls                 | [ui/](ui/)         |

Reuse shared controls such as Button, PillLink, and SegmentedControl.
Keep rendering, focus, and interactions in components. Put domain calculations in `src/libs/` or data processing in
`src/data/`, returning plain data for components to render.
Shared input and normalized types live in `src/schema/`.

## Colors and themes

The shared palette is defined in [globals.css](../globals.css). Light inputs live in `@theme`; dark overrides live in
`:root[data-theme='dark']`. Event-specific color files are not used.

| Palette input                 | Purpose                           |
| ----------------------------- | --------------------------------- |
| `--color-archive-page`        | Page background                   |
| `--color-archive-surface`     | Cards, menus, and inputs          |
| `--color-archive-text`        | Main foreground                   |
| `--color-archive-shell`       | Header and footer base            |
| `--color-archive-accent`      | Base hue for derived accent roles |
| `--color-archive-accent-text` | Text on filled accents            |

Start with an existing semantic role, not a new literal color.
Borders, muted text, controls, table stripes, and hover colors derive from these inputs using `color-mix()` and relative
`oklch()`. Their formulas can differ between themes.

| Use                | Pair                                                         |
| ------------------ | ------------------------------------------------------------ |
| Colored text links | `archive-link` / `archive-link-hover`                        |
| Filled accents     | `archive-accent-fill` + `archive-accent-text`                |
| Selected controls  | `archive-control-selected` + `archive-control-selected-text` |
| Keyboard focus     | `archive-focus-ring`                                         |

Use Tailwind utilities such as `bg-archive-surface` and `text-archive-text`.
SVGs and inline styles use the same CSS variables.
Use [SELECT_THEME](../libs/themes.ts) for `react-select`, including an explicit selected-option foreground/background pair.

`@wrksz/themes` manages `data-theme` and persistence under `go-tournaments-theme`.
Auto follows the system preference. Preserve the existing provider and restoration behavior instead of adding another
theme store. See [color guidelines](../../AGENTS.md#color-guidelines) for the complete role conventions.

## Tournament tables

[TournamentsPage](pages/TournamentsPage.tsx) loads event data for [TournamentsTable](TournamentsTable.tsx).
Aggregation and sorting live in [libs/tournaments.ts](../libs/tournaments.ts) with colocated tests.

Preserve these behavior rules when changing the table:

- Exclude announcements and show recorded editions newest first initially.
- Show country only when configured, hide Stages independently when its values are identical in a table, and show SGF
  counts only in non-category tables with linked records.
- Sort player columns by surname, respect sort direction within shared places, and put missing values last.
- Link years to editions, players to statistics, and positive SGF counts to that edition's game records.
- Keep category tables independently sortable and in configured category order.

Category counts deduplicate players and games and include uncertain category membership.
Completed-game counts exclude both BYEs and unresolved pairings.
Shared stages count when they contain category participants. A game may count toward more than one category.
Location and dates describe the whole edition.

Format date labels on the server and pass the resulting strings to client tables.
Server and browser Intl implementations can produce different whitespace and cause hydration mismatches.

The homepage links to this page through its edition-card controls. For more than nine editions, it starts with five
cards and a sixth card for expansion and statistics; preserve the existing narrow-screen controls when editing that
layout.

## Verify a UI change

Check the affected surface on narrow and wide screens, in light and dark themes, with keyboard navigation, and in the
relevant languages. Test hover, selection, disabled states, and focus against their actual backgrounds.
Derived colors still need contrast checks.

Changes to shared table primitives can affect both [StatsTable](table/StatsTable.tsx) and
[VirtualStatsTable](table/VirtualStatsTable.tsx). Check both.
For theme behavior changes, also check Auto/system mode and locale navigation for restoration flashes.
Run lint and relevant tests, and report browser validation separately.
