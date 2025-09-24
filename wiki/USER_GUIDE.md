This guide explains the available settings in the Servarr Auto‑Search browser extension. It assumes you have already installed (or temporarily loaded) the extension in Chromium (MV3) or Firefox (MV2). If you are a store reviewer, see the [REVIEWER_GUIDE](https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/blob/master/REVIEWER_GUIDE.md) instead. For a list of changes, see the [CHANGELOG](https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/blob/master/CHANGELOG.md).

---

## Overview

The extension detects media titles on supported websites and lets you instantly send them to your Servarr applications (Sonarr, Radarr, Lidarr, Readarr) without copying and pasting. You can optionally inject a floating or anchored action icon on pages, add right‑click context menu items, and customize appearance and behaviour.

All configuration is stored locally via the browser extension storage API. No telemetry, analytics, or remote configuration is performed.

---

## Installation / Loading

### All browsers

Visit the web store for your browser (Chrome Web Store, Microsoft Edge Add-ons, Firefox Add-ons) and search for "Sonarr/Radarr/Lidarr autosearch" to find the official release. Click "Add to [Browser]" and follow prompts to install.

### From Released Source - Chromium (Chrome / Edge / Brave)

1. Download or build the release ZIP for Chromium (MV3).
2. Go to `chrome://extensions` (or `edge://extensions`).
3. Enable `Developer mode`.
4. Click `Load unpacked` and select the project folder (or drag in the unzipped build directory).
5. Verify that the extension icon appears in the toolbar.

### From Released Source - Firefox

1. Download the `.xpi` build for Firefox (MV2) or load temporary add‑on via `about:debugging#/runtime/this-firefox`.
2. Click `Load Temporary Add-on…` and select any file in the Firefox build folder (e.g. `manifest.json`).
3. The add‑on will remain until the browser is closed (temporary mode) or permanently if installed from the store.

---

## Quick Start

1. Open the extension's Options page (click the extension icon -> `settings` or right‑click the toolbar icon → `Options` / `Manage Extension`).
2. On the **Settings** tab, add at least one Servarr instance (Sonarr / Radarr / Lidarr / Readarr). Provide:
   - Base URL (including protocol) – e.g. `http://localhost:8989`
   - API Key (from the target application's UI) – optional but required for auto population.
3. Toggle the instance ON so the extension will use it.
4. (Optional) Show **Advanced settings** and enable `Auto populate from API` to automatically determine version / selectors.
5. Visit a supported media site (e.g. IMDb, TMDb, Trakt). You should see inline action buttons or the injected icon (if enabled) allowing you to send items to Servarr.

If nothing appears, check the **Debug** tab and the Troubleshooting section below.

> **Note:** Advanced options now live *inside the Settings tab*. Use the **Show advanced** button to reveal the advanced section under each site card (beneath the Icon palette).

---

## 4. Tabs & Settings Breakdown

### 4.1 Settings (Basic)

Core instance configuration.

| Field / Control | Purpose | Notes |
|-----------------|---------|-------|
| Instance Enable Toggle | Activates this Servarr integration. | You can enable multiple simultaneous instances (e.g. Sonarr + Radarr). |
| Base URL | Root address of the application. | Must match your deployment (http/https, port). |
| API Key | Enables authenticated API calls. | Required for auto population & some actions. Stored only locally. |
| Display name | The label shown in icons and menus. | Click the name in the site card header to rename. |
| Add instance button | Create a new Sonarr/Radarr/Lidarr/Readarr entry. | Button at the top-right of the Settings tab. |
| Remove (trash icon) | Delete an instance. | Permanently removes the site from your settings. |
| Grant permissions button | Opens a prompt to allow the extension to access the specified Servarr domain. | Required for detection on Servarr pages for auto-searching. |

Helper Text: If `Auto populate from API` (Advanced) is ON and an API key is set, advanced selector fields will be fetched and filled automatically; otherwise defaults are used.

### 4.2 Advanced (inside Settings)

Advanced options are now shown **within the Settings tab**. Toggle the **Show advanced** button to reveal or hide the advanced section for each site (it appears under the Icon palette).

Controls automatic selector and version detection.

| Setting | Description | When to Disable |
|---------|-------------|-----------------|
| Icon palette (foreground / background) | Customize the Servarr icon colours per site. | Changes save immediately; **Reset colours** restores defaults. |
| Auto populate from API | Calls version / capability endpoints to infer correct selectors or paths. | If your server blocks the request or populates incorrect values. |
| Manual Overrides (fields below) | (Visible when auto population is OFF) Provide explicit path / version selectors. | Use when custom reverse proxies or non‑standard ports cause detection to fail. |

The extension only performs version probing passively (non‑blocking). If calls fail, defaults remain; basic functionality usually still works.

### 4.3 Integrations

Enable / disable icons / actions on specific third‑party media websites.

Typical supported sites include (not exhaustive): IMDb, TMDb, Trakt, TVDB, TV Maze, MusicBrainz, Last.fm, Letterboxd, Rotten Tomatoes, Allociné, SensCritique, Simkl, BetaSeries, MyAnimeList, TV Calendar.

| Control | Behaviour |
|---------|----------|
| Per‑Site Toggle | Show or hide search / add actions for that site. |

If a site toggle is enabled but no icons appear, verify the site layout hasn't changed (see Troubleshooting).

### 4.4 Custom Icons

Controls injected page action icon appearance/placement.

| Toggle / Field | Meaning | Values |
|----------------|---------|--------|
| Use custom icon (`#toggle-use-custom-icon`) | Master enable for injected floating/anchored icon. | On / Off |
| Icon type (`#toggle-icon-type`) | Anchored (relative to page edge) vs Floating (free overlay). | Anchored / Floating |
| Window side (`#toggle-side`) | Horizontal anchoring side. | Left / Right |
| Window position (`#toggle-position`) | Vertical anchoring edge. | Top / Bottom |
| Side offset unit (`#toggle-side-offset`) | Unit for horizontal offset distance. | px / % |
| Position offset unit (`#toggle-position-offset`) | Unit for vertical offset distance. | px / % |
| Offset numeric inputs | Distance values for side / position. | Number + chosen unit |
| Colour picker | Icon background colour. | Any valid colour |

Behavioural Logic:

- Disabling `Use custom icon` disables all subordinate toggles.
- Changing Icon Type (Anchored vs Floating) dynamically enables/disables certain offset unit controls to prevent invalid combos.
- Offsets saved as `[value][unit]` (e.g. `32px` / `15%`).

Tip: Use percentages for responsive layouts, pixels for precise alignment.

### 4.5 Context Menu

Adds right‑click search / add entries. When enabled, selecting text (title) on a page and right‑clicking will present Servarr actions.

| Feature | Description |
|---------|-------------|
| Enable Context Menu | Registers context entries for active instances. |
| Dynamic Instances | Each enabled Servarr app appears with a distinct action. |

### 4.6 Debug

Diagnostics & logging.

| Control | Purpose |
|---------|---------|
| Turn on console logging | Writes verbose logs (detection, API attempts) to the browser devtools console. |

Only enable while troubleshooting; logging adds minor overhead.

### 4.7 Permissions

Shows all permissions currently granted to the extension. You may need to re‑grant permissions if you change your Servarr instance URLs.

Some permissions are mandatory. Any non‑mandatory permissions can be revoked, but certain features may stop working.

### 4.8 Support

This section contains helpful external links only – there are no settings to toggle here and nothing you do in this section changes the extension's behaviour.

---

## 5. How Automatic Population Works

When `Auto populate from API` is ON and an API key is supplied, the extension will:

1. Issue a lightweight version/capabilities request to each enabled instance.
2. Derive required internal identifiers or selectors (e.g., API version differences) and store them.
3. Update advanced fields silently; manual edits are locked while active.

Failure Handling: If the request fails (network / 401 / timeout) the extension falls back to defaults and continues operating. A badge (if displayed) may reflect failure colour.

Disable auto population if:

- You use a reverse proxy rewriting paths unpredictably.
- Access requires VPN / network conditions that intermittently block API calls.
- You maintain custom forked Servarr builds with non‑standard responses.

---

## 6. Status Badges

Where shown, badges use colours to indicate:

- Green: API reachable and responsive.
- Yellow/Amber: Partial or slow response (heuristic fall-back).
- Red: Failed probe (using defaults).

Badges are passive and never block interaction.

---

## 7. Using the Injected Icon

1. Enable `Use custom icon` in Custom Icons tab.
2. Choose `Anchored` for fixed distance from edges; `Floating` to allow more free overlay behaviour (still positioned relative to window edges with offsets).
3. Adjust `Left/Right`, `Top/Bottom` and numeric offsets until placement suits your layout.
4. Open a supported site page and verify the icon appears; click it to access quick actions.

If it overlaps site UI, reduce offsets or switch side/position.

---

## 8. Context Menu Workflow

- Highlight a movie/show/album/book title in the page body.
- Right‑click and choose the relevant Servarr instance action.
- The extension will open the appropriate add/search route.

If no menu items appear, ensure the Context Menu feature is enabled and the instance is active.

---

## 9. Debugging & Troubleshooting

| Symptom | Checks / Fixes |
|---------|----------------|
| No icons on supported site | Confirm site toggle enabled; open console (F12) with debug logging ON; check for selector errors. |
| API calls failing | Verify Base URL & API key; test same endpoint in browser; watch for CORS or reverse proxy blocks. |
| Icon misplaced | Switch px ↔ % units; reduce offsets; verify `Use custom icon` still enabled. |
| Context menu missing | Re-toggle context menu feature; reload the page. |
| Settings not saving | Ensure no private / ephemeral browsing session clearing storage; look for errors in console. |

Reset Approach: Manually remove and re-add the extension (or clear extension storage via browser devtools → Application → Storage → Extension Storage) to restore defaults.

---

## 10. Privacy & Data Handling

- All settings stored locally using `browser.storage`.
- API Keys never leave your machine except when calling your own Servarr endpoints.
- No telemetry, analytics, or third‑party tracking.
- Optional donation links open external payment pages (manual user action).

---

## 11. Backup / Migration

To migrate settings:

1. Open the browser's extension storage viewer (DevTools > Application > Storage).
2. Copy JSON entries for this extension.
3. Paste/import manually on another profile (future UI export may be added).

---

## 12. Frequently Asked Questions (FAQ)

Q: Do I need an API key?  
A: Only for automatic population and some enriched operations. Basic link insertion may function without it.

Q: Why do some pages show no actions?  
A: Site layout or class names may have changed; open an issue with URL and expected media type.

Q: Does the extension send data anywhere else?  
A: No. Only direct calls to configured Servarr endpoints occur.

Q: Will enabling debug slow browsing?  
A: Minimal impact; disable when finished troubleshooting.

---

## 13. Contributing & Support

- Report bugs / request features: GitHub Issues (link from GitHub tab inside options).
- Provide console logs (enable debug first) and steps to reproduce.
- Pull requests welcome—follow existing code style (Tailwind utility-first, lightweight jQuery for options page DOM helpers).

---

## 14. Changelog

See `CHANGELOG.md` for version history, additions, fixes, and migration notes.

---

## 15. Glossary

| Term | Definition |
|------|------------|
| Servarr | Collective reference to Sonarr, Radarr, Lidarr, Readarr (and similar). |
| Anchored Icon | Icon positioned relative to page/window edges with fixed offsets. |
| Floating Icon | Alternative layout style; still edge-based but with different enable/disable logic for offset controls. |
| Probe | A lightweight API request used to determine availability or version info. |

---

Happy searching!
