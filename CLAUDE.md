# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A cross-browser extension (Chromium MV3 + Firefox MV2) for Servarr apps (Sonarr/Radarr/Lidarr/Readarr) that:
1. Prefills the Servarr search page from a URL suffix (e.g. `http://host:8989/add/new/fringe` triggers a search for "fringe").
2. Adds context-menu entries to search selected text in a configured Servarr instance.
3. Injects Servarr search icons/links into third-party media sites (IMDb, TMDb, TVDb, Trakt, etc.).

`ORCHESTRATOR.md` is a maintained repo-context document (architecture, fragile areas, decisions log) — read it for current state and append discoveries after meaningful changes.

## Commands

```powershell
npm i                 # install root deps
grunt debug           # jshint + build both browsers to dist/chromium and dist/firefox
grunt release         # full build + store packaging (runs CreatePackage_Grunt.ps1 on Windows) -> Publish/
grunt playwright      # build dist/ without jshint or packaging (prereq for Playwright tests)

npm test              # Jest unit tests (tests/unit-tests/, playwright dir excluded)
npx jest tests/unit-tests/servarr_search_url.test.js   # single unit test file

npm run chromium      # web-ext run from dist/chromium (build first)
npm run firefox       # web-ext run from dist/firefox
npm run lint          # web-ext lint against dist/firefox (build first)
```

Playwright integration tests live in a separate package and load the extension from `dist/chromium`, so build with `grunt playwright` first:

```powershell
grunt playwright
cd tests/playwright
npm i
npx playwright install --with-deps chromium
npx playwright test                                    # all specs
npx playwright test site.integrations.tests/imdb.spec.ts   # single spec
```

Specs suffixed `.spec.NORUN.ts` are intentionally disabled. Tests hit the real third-party sites in a persistent Chromium context (helpers in `tests/playwright/helpers.ts` handle hard reloads and Trakt cookie overlays), so failures can be site-side flakiness rather than regressions.

## Architecture

**No bundler, no transpilation.** Plain ES5/ES6 + jQuery. Files share state via globals; script load order is the module system. The content-script load order is declared identically in both manifests and must be preserved: jQuery → browser-polyfill → `icons.js` → `core.js` → `engines/index.js` → `engines/default.js` → `engines/integrations/*.js` → `content_script.js`.

**Dual manifests, two backgrounds:**
- Chromium MV3: `src/manifest-chromium/manifest.json`, service worker `src/eventPage.chrome.js`
- Firefox MV2: `src/manifest-firefox/manifest.json`, background page `src/eventPage.js`

Grunt copies `src/` into each `dist/` target, excluding the other browser's eventPage. Any background/manifest change usually needs applying to both sides (MV2/MV3 parity); Chrome uses callback APIs, Firefox promise-based — compatibility wrappers are common in permissions/runtime code.

**Core modules:**
- `src/content/js/core.js` — default settings schema, `getSettings`/`setSettings` over `browser.storage.sync` (key: `sonarrRadarrLidarrAutosearchSettings`), Servarr API probing that autopopulates search paths/selectors by instance version, shared `log()`. Settings migration is additive-on-read: missing properties are defaulted at read time, never via a migration framework. Also contains a `browser` shim so content code can run in non-extension contexts (Playwright).
- `src/content/js/content_script.js` — `runServarrSearchInjection` (prefill search on Servarr pages, with wait/retry for the input element) and `runEngines` (icon injection on integration sites), plus SPA URL-change polling for client-routed sites.
- `src/content/engines/default.js` — the `DefaultEngine(config)` factory: declarative per-site config (`urlIncludes`, `containerSelector`, `getSearch`, optional `resolveSiteType`, `deferMs`, `spa`) producing candidate discovery + icon insertion. Engines register by pushing onto `window.__servarrEngines.list` (reset by `engines/index.js` on each injection to prevent duplicates). Custom `match` functions receive `(document, url)`.
- `src/content/js/options-*.js` — one file per options tab (settings, integrations, custom icons, context menu, debug, backup/restore, permissions).

**Engine contract:** an engine's `id` must match a `settings.integrations[].id` entry (defaults in `core.js`) or it never runs. Injected elements carry dedupe markers (`data-servarr-icon`, `data-servarr-ext-{siteId}-completed`) so reinjection on SPA navigation is safe — follow this pattern in new engines.

**Adding a new site integration** touches all of: a new `src/content/engines/integrations/<site>.js`, both manifests (`content_scripts.js` list, `matches`, `host_permissions`), the `integrations` array in `core.js`, an icon in `src/content/assets/images/integrations/`, and ideally a Playwright spec in `tests/playwright/site.integrations.tests/`.

## Release process (contributor PRs merged into staging)

After contributor PRs are merged into `staging`, the standard release prep is done on `staging` before merging to `master`. Update **all** of the following:

**Version** (semver `X.Y.Z`; manifests use a 4-part `X.Y.Z.0`):
- `package.json` — `"version": "X.Y.Z"`
- `package-lock.json` — root `"version"` in both the top-level object and the `packages[""]` entry
- `src/manifest-chromium/manifest.json` — `"version": "X.Y.Z.0"`
- `src/manifest-firefox/manifest.json` — `"version": "X.Y.Z.0"`
- `src/options.html` — footer `<i>Version X.Y.Z</i>`
- `src/popup.html` — `<span ...>Version X.Y.Z</span>`
- `README.md` — the two Edge add-ons badges (`message=vX.Y.Z.0`); the Chrome/Firefox badges auto-read from the stores. Do not touch the Edge *users* badge (`message=<count>`).
- `docs/*.html` (website) — the footer `<span class="version" data-version>vX.Y.Z</span>` on all 5 pages, plus the two static Edge shields in `docs/index.html` (`version-vX.Y.Z` badge; leave the Edge users badge alone). The JS release fetch overrides these live, but the fallback must not drift.
- `dist/` is gitignored — never edit it for a version bump.

**Changelog** (`CHANGELOG.md` only):
- Add a `## X.Y.Z` section at the top with `### Added` / `### Changed` / `### Fixed` subsections as needed.
- One bullet per merged PR, ending with `- ([PR#N](<full PR URL>)). Thanks to [username](https://github.com/username).` for contributor PRs.

**Contributors** (for first-time contributors):
- `README.md` "Thanks" section — append an avatar anchor following the existing `<a href='https://github.com/<user>' ...><picture><img src="https://avatars.githubusercontent.com/<user>?s=64&v=4" ...></picture></a>` pattern.
- Contributor credit also goes in the CHANGELOG bullet (see above).

The wiki holds no version, changelog, or contributor content. `wiki/` is a gitignored local checkout of the GitHub wiki repo (`https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension.wiki.git`) — it has its own git history; commit and push wiki edits there directly (wikis have no PR flow). If `wiki/` is missing, clone that URL into it.

## Website (docs/)

`docs/` is the arrsearch.app website, served by GitHub Pages from `master:/docs` (custom domain in `docs/CNAME`; `servarrsearch.app` redirects to it at DNS level). Hand-written static HTML/CSS/vanilla JS — no build step. Shared header/footer markup is duplicated across pages between `<!-- @shared:header -->`/`<!-- @shared:footer -->` sentinel comments; keep the blocks identical (only `aria-current="page"` differs per page). All internal URLs are relative (never `/…`-rooted) except `404.html`, which must stay root-relative because Pages serves it at arbitrary paths. Content ownership: the site is canonical for user docs (`user-guide.html`, `integrations.html`, `privacy.html`); the wiki is canonical for contributor docs (`developers.html` only carries summaries + links). The changelog is never mirrored — the site links to `CHANGELOG.md` on GitHub. On release: bump the footer version fallback (see above); touch `integrations.html` only if integrations were added/removed/status-changed and `user-guide.html` only if the options UI changed. Preview locally with `npx http-server docs -p 8123` (or the `site` entry in `.claude/launch.json`).

## Conventions and cautions

- Prefer minimal, targeted changes; integrations regress from third-party DOM changes and fixes should stay site-specific. SPA sites (Trakt, Metacritic) are the most timing-fragile.
- Don't tune the global search-input wait/retry settings to fix one site.
- Never edit `dist/` — it is generated output.
- External PRs target the `staging` branch, not `master`.
- jshint (config in `.jshintrc`) runs over `src/content/**/*.js` as part of `grunt debug`/`grunt release`.
