# ORCHESTRATOR.md

Purpose
- This file is the durable source of truth for repository context used by the orchestrator workflow.
- Keep this document updated as architecture, conventions, risks, and decisions evolve.
- When chat context is compacted, restore working context from here first.

Scope And Rules
- Orchestrator does not implement tasks directly by default.
- For each requested task, spawn one or more subagents with explicit ownership and boundaries.
- Subagent prompts must include: goal, owned files, forbidden files, conventions, and verification steps.
- After subagents complete: review outputs, capture new insights here, and update decisions/risks.

Current Baseline (2026-03-22)

Repository Overview
- Browser extension for Servarr workflows (Sonarr/Radarr/Lidarr/Readarr):
  - Search prefill from Servarr URL patterns.
  - Context-menu search from selected text.
  - Third-party site icon/link injections for direct Servarr search.
- Cross-browser dual-manifest setup:
  - Chromium MV3 service worker runtime.
  - Firefox MV2 background/event page runtime.

Runtime Entry Points
- Chromium MV3 background: src/eventPage.chrome.js
- Firefox MV2 background: src/eventPage.js
- Content runtime orchestrator: src/content/js/content_script.js
- Engine registry bootstrap: src/content/engines/index.js
- Engine factory/helpers: src/content/engines/default.js
- Popup UI: src/popup.html + src/content/js/popup.js
- Options UI shell: src/options.html + src/content/js/options.js

Core Module Boundaries
- src/content/js/core.js
  - Default settings schema.
  - getSettings/setSettings/resetSettings.
  - Storage migration-on-read behavior.
  - API probing and version-based selector/path autopopulation.
  - Shared logging utilities.
- src/content/js/content_script.js
  - runServarrSearchInjection for Servarr pages.
  - runEngines for integration pages.
  - SPA URL-change detection and reinjection flow.
- src/content/engines/default.js
  - Declarative DefaultEngine pattern for integrations.
  - Candidate discovery and insertion mechanics.
  - Dedupe attributes for safe reinjection.
- src/content/engines/integrations/*.js
  - Per-site selectors and search-term extraction rules.
  - Some integrations have defer and SPA config.
- src/content/js/options-*.js
  - Tab-specific options logic:
    - settings, integrations, custom icons, context menu, debug, backup/restore, permissions.

Settings Model
- Primary storage key: sonarrRadarrLidarrAutosearchSettings
- Stored in browser.storage.sync.
- Main branches:
  - sites[] (instance configs: id/type/name/domain/searchPath/searchInputSelector/apiKey/icon/etc.)
  - integrations[] (enabled toggle per integration id)
  - config (enabled, contextMenu, debug, wait/retry, custom icon mode)
  - injectedIconConfig (floating/anchored placement and style)
- Migration strategy is additive/defaulting at read/write time (no strict schema migration framework).

Build And Packaging
- Task runner: Grunt (Gruntfile.js)
- Build outputs:
  - dist/chromium
  - dist/firefox
- Build pipeline includes:
  - copy source + vendor assets
  - Tailwind build for both targets
  - packaging script (PowerShell on Windows, bash on non-Windows)

Dependencies (High Signal)
- jQuery, webextension-polyfill, spectrum-colorpicker2, Font Awesome, Tailwind.
- Jest for unit tests.
- Playwright (tests/playwright package) for integration tests.

Test Architecture
- Unit tests:
  - tests/unit-tests/servarr_search_url.test.js
- Integration tests:
  - tests/playwright/site.integrations.tests/*.spec.ts
  - fixtures load extension from dist/chromium in persistent Chromium context
  - helpers include hard reload and Trakt cookie overlay handling

Conventions And Patterns
- Legacy JS + jQuery style; no app bundler/transpilation pipeline.
- Engine registration contract:
  - engine.id must match settings.integrations[].id to be runnable.
- Dedupe/marker pattern:
  - data-servarr-icon and data-servarr-ext-{siteId}-completed attributes.
- Browser compatibility wrappers are common in permissions/runtime APIs.
- Prefer minimal, targeted changes over broad refactors.

Known Fragile Areas
- SPA sites and timing-sensitive reinjection (Trakt, Metacritic).
- Selector brittleness on third-party DOM changes.
- Cross-browser permissions behavior (Chrome callback APIs vs Firefox/browser promises).
- Servarr search input wait/retry tuning can regress behavior if changed globally.
- Integration regressions often require site-specific adjustments.

Known Inconsistencies To Watch
- Version mismatch risk:
  - package.json version may diverge from manifest/changelog release line.

Critical Path Files
- src/content/js/content_script.js
- src/content/engines/default.js
- src/content/js/core.js
- src/eventPage.chrome.js
- src/eventPage.js
- src/content/js/options-1-settings.js
- src/content/js/options-2-site-integrations.js
- src/content/engines/integrations/*.js
- src/manifest-chromium/manifest.json
- src/manifest-firefox/manifest.json
- Gruntfile.js
- tests/playwright/**/*

Subagent Execution Template
- Goal:
- Owned files (allowed to modify):
- Forbidden files (must not touch):
- Constraints/conventions:
  - Keep edits minimal and localized.
  - Preserve existing behavior unless explicitly requested.
  - Respect MV2/MV3 parity where relevant.
  - Follow existing naming/marker patterns.
- Verification:
  - Run only targeted tests first.
  - If behavior is integration-specific, add/adjust matching Playwright spec.
  - Summarize risks and any unverified assumptions.

Review Checklist For Subagent Output
- Did changes stay within owned files?
- Any unintended architecture or API contract changes?
- Any selector/timing regressions introduced?
- MV2/MV3 parity maintained where required?
- Tests added/updated and relevant tests executed?
- Clear rollback or follow-up noted for uncertain areas?

Decisions Log
- 2026-03-22: Established orchestrator-first workflow; default behavior is subagent delegation instead of direct implementation.
- 2026-03-22: Added this ORCHESTRATOR.md as persistent context anchor for compaction resilience.
- 2026-07-03: Documented the standard release process for contributor PRs into staging (version bump locations, changelog format, contributor credits) in CLAUDE.md "Release process".
- 2026-07-03: TVMaze /shows directory engine (PR#343) matcher tightened to a regex (`/tvmaze\.com\/shows\/?($|[?#])/i`) covering the trailing-slash variant while still excluding show detail pages.
- 2026-07-03: Built the arrsearch.app website in `docs/` (static HTML/CSS/JS, no build step) to replace the Jekyll-rendered README on GitHub Pages; `_config.yml` deleted. Pages source must be switched to `master:/docs`. Site is canonical for user docs; wiki remains canonical for contributor docs. See CLAUDE.md "Website (docs/)".

Open Risks Queue
- Monitor SPA engines for recurrent regressions on Trakt/Metacritic.
- Track version metadata consistency across package.json, manifests, and changelog.
- Expand unit coverage around settings migration and permissions edge cases.

Update Protocol
- After every meaningful task:
  - Append a brief decision or discovery.
  - Update fragile areas and critical-path files if changed.
  - Record any new convention a future subagent should follow.
