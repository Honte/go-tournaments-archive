# Prebuilt 4-Tier JPEG Share Images in `tools/assets/`

Most archive presets deploy as static exports (`output: 'export'`) uploaded via FTP ZIP, and multi-event presets such as `europe` contain thousands of player and country pages. Generating a unique OpenGraph image per route (or using Next.js `opengraph-image.tsx` with PNG output) would bloat static artifacts and build times, while several events define async `Logo.tsx` components that read local PNGs from disk and cannot be rendered directly inside Satori JSX.

We decided to generate 1200×630 JPEG share images during `prebuild` in `tools/assets/` (into git-ignored `public/og/[prefix]/...`, mirrored by `*.dev.ts` route handlers in development) using a bounded 4-tier event model—general overview, per-edition, statistics, and game records—per event locale, plus an archive-level card for multi-event selectors. Rendering uses `next/og` (Satori/resvg) with bundled Inter fonts and pre-rendered `Logo.tsx` (`color="white"`) rasters, compressed to mozjpeg via `sharp`.

## Considered Options

- **Next.js `opengraph-image.tsx` routes**: Outputs PNG (~400–800 KB per photo-backed card vs ~45–60 KB for JPEG) and would still require full static pre-generation across all static params on static-export presets.
- **Per-player / per-country share images**: Would generate thousands of static images for multi-event static presets like `europe`, significantly increasing build time and FTP deployment size; player and country specifics are carried by data-driven `og:title` and `og:description` instead.
- **Single image per event**: Minimal file count, but tournament editions (`/:year`), all-time statistics, and SGF game records are the primary shared links and benefit from distinct visual framing.

## Consequences

- Production and standalone deployments both serve prebuilt static JPEGs from `public/og/` with zero runtime rendering cost; development uses `*.dev.ts` handlers for instant iteration.
- `generateOgImages: false` can disable share-image generation in fast test presets (such as `test.yml`).
- Any new event without a custom `background.jpg` falls back to the shared generic Go board artwork also used by multi-event selector cards.
