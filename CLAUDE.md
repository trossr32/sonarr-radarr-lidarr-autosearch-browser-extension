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
- `src/content/engines/default.js` — the `DefaultEngine(config)` factory: declarative per-site config (`urlIncludes`, `containerSelector`, `getSearch`, optional `resolveSiteType`, `deferMs`, `spa`) producing candidate discovery + icon insertion. Engines register by pushing onto `window.__servarrEngines.list` (reset by `engines/index.js` on each injection to prevent duplicates).
- `src/content/js/options-*.js` — one file per options tab (settings, integrations, custom icons, context menu, debug, backup/restore, permissions).

**Engine contract:** an engine's `id` must match a `settings.integrations[].id` entry (defaults in `core.js`) or it never runs. Injected elements carry dedupe markers (`data-servarr-icon`, `data-servarr-ext-{siteId}-completed`) so reinjection on SPA navigation is safe — follow this pattern in new engines.

**Adding a new site integration** touches all of: a new `src/content/engines/integrations/<site>.js`, both manifests (`content_scripts.js` list, `matches`, `host_permissions`), the `integrations` array in `core.js`, an icon in `src/content/assets/images/integrations/`, and ideally a Playwright spec in `tests/playwright/site.integrations.tests/`.

## Conventions and cautions

- Prefer minimal, targeted changes; integrations regress from third-party DOM changes and fixes should stay site-specific. SPA sites (Trakt, Metacritic) are the most timing-fragile.
- Don't tune the global search-input wait/retry settings to fix one site.
- Never edit `dist/` — it is generated output (though it is committed).
- Version appears in `package.json` (e.g. `3.1.1`), both manifests (`3.1.1.0`), README badges, and `CHANGELOG.md`; keep them in sync on release changes.
- External PRs target the `staging` branch, not `master`.
- jshint (config in `.jshintrc`) runs over `src/content/**/*.js` as part of `grunt debug`/`grunt release`.
