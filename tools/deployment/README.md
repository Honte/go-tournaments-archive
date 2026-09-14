# Building and deployment

[Project README](../../README.md) · [Configuration presets](../../configurations/README.md)

Run build commands from the repository root. Choose the intended event or preset before building: a successful
default build does not verify a different site's routes or assets.

## Build a static site

```bash
npm ci
npx cross-env EVENT=wagc npm run build
npm run start
```

`cross-env` is already a development dependency and makes these examples work in both PowerShell and POSIX shells.
`npm run start` previews `out/`; open the address it prints.

For a collection of events, use a preset:

```bash
npx cross-env CONFIG=europe npm run build
```

Convenience commands such as `npm run build:europe`, `build:poland`, `build:honte`, and `build:pgc` select existing
presets. `npm run builder` provides interactive selection.

A build runs `prebuild` to generate JSON, SGFs, previews, and ZIPs in `public/`, then exports the static pages to
`out/`. Publish the contents of `out/` to the configured site location.
The included `public/index.php` is copied into the export for PHP hosts that use it for locale redirection.

## Host below a subdirectory

Set `basePath` in the archive preset. The included `single.yml` reads it from `BASE_PATH`:

```bash
npx cross-env EVENT=wagc BASE_PATH=/archive npm run build
```

The resulting pages and assets belong below `/archive`, for example `/archive/en`.
The `europe` preset instead sets a fixed `/archives` path.
An environment variable only changes a preset value that references it.

## Build a standalone server

Set `dynamic: true` at the top level of the selected preset and build it.
Next.js creates `.next/standalone/` instead of a static export.
Player, player-category, and country statistics pages render on demand. Prebuild still generates production data
and SGF assets. SGF/preview handlers are enabled only in development, so production requires those files to be
pre-generated even with `dynamic: true`.

The selected configuration is embedded in the build, so the server does not need `CONFIG` or `EVENT` at runtime.
Package the public and client assets with the standalone server.

On a POSIX shell:

```sh
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
cd .next/standalone
node server.js
```

On PowerShell, from a fresh build:

```powershell
Copy-Item -Recurse public .next/standalone/public
Copy-Item -Recurse .next/static .next/standalone/.next/static
Set-Location .next/standalone
node server.js
```

Use the bundled `server.js` for standalone hosting. `npm run start` serves static exports only.

## Verify before publishing

Preview the output and check the archive selector when present, an edition, statistics, and a linked game.
Check locale redirects, the configured base path, and requested SGF previews/downloads.
A development-server check alone does not verify production assets. Also inspect build logs: tournament loading can
report a stage parsing error and continue, so a zero exit code alone does not establish that every stage was included.

The repository's [workflows](../../.github/workflows/) contain the site-specific deployment setup.
The reusable [build workflow](../../.github/workflows/_build-from-config.yml) uploads static `out/` bundles;
standalone deployments require the server package described above.

For changes to deployment tooling, follow [CONTRIBUTING.md](../../CONTRIBUTING.md) and its focused-test guidance.

## Check whether committed changes affect a preset

```bash
npm run deploy:check europe -- --base HEAD^
```

This compares the given revision with `HEAD` and reports `deploy` or `skip`; it does not build or publish.
It checks changes under `src/`, that preset's YAML file, `tools/assets/`, and its internal event directories.
Uncommitted changes and other paths are not included, so `skip` is not a full validation result.
The base defaults to `HEAD^`; fetch enough history or pass another existing commit.
In GitHub Actions it can also write `deploy_<config>` to `GITHUB_OUTPUT`.
