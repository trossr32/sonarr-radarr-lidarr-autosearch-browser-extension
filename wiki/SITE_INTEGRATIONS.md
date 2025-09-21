# Contributing a New Site Integration (Engines Pattern)

This extension injects a small Servarr search icon into third-party sites (IMDb, TMDb, Trakt, etc.). Clicking the icon sends a search term (optionally prefixed with an ID like `imdb:` or `tmdb:`) to the user’s chosen Servarr app (Sonarr, Radarr, Lidarr, Readarr).

We now use **“integration engines”** instead of a single `integrations` array inside `content_script.js`.

- Each site lives in its own file under:  
  `src/content/engines/integrations/<site>.js`
- A small runtime (`index.js` + `default.js`) registers engines in  
  `window.__servarrEngines.list`.
- `content_script.js` iterates **registered engines** and injects icons.

There’s still a simple registry in **`core.js`** (id, name, logo, enabled flag) that controls visibility/toggles in the settings UI.

---

## Anatomy of an Engine

Create a file `src/content/engines/integrations/yoursite.js`:

```js
// src/content/engines/integrations/yoursite.js
(function () {
    if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };
    const Def  = window.__servarrEngines.helpers.DefaultEngine;
    const pick = window.__servarrEngines.helpers.pickSiteIdFromDocument; // optional helper

    // Build an engine using the DefaultEngine config
    const YourSiteEngine = Def({
        id: 'yoursite',

        // Where to run (simple substring checks against window.location.href)
        // Not required if using a custom `match` function below.
        urlIncludes: ['yoursite.example.com/path'],

        // When to run (more complex logic, e.g., regex + DOM gates)
        // Not required if using `urlIncludes` above.
        match: function (document, url) {
            // Example: simple regex match on the URL
            urlMatches = /.+letterboxd\.com\/film\/.+/i.test(url);

            if (!urlMatches) return false;

            // Example: gate on DOM content
            return !(document.querySelector('a[href*="themoviedb.org/movie/"]'));
        },

        // Where to place the icon (container to inject into)
        containerSelector: 'h1.title',

        // Prepend/append/before/after within the container
        insertWhere: 'prepend', // 'prepend' | 'append' | 'before' | 'after'

        // Optional wrapper around the <a> (for tricky layouts)
        // wrapLinkWithContainer: '<div class="slot"></div>',

        // Optional: wait for SPA content to render (ms)
        // deferMs: 1000,

        // Decide which Servarr app to target:
        // 1) Fixed (use this)
        // siteType: 'sonarr', // 'sonarr' | 'radarr' | 'lidarr' | 'readarr_ebook' | 'readarr_audiobook'

        // 2) OR dynamic (use this): pick based on DOM/content
        resolveSiteType: function (document, url, settings) {
            // Example of rule-based routing (like the old `rules`):
            // Read a value from the page (e.g., og:type), then match patterns.
            // Return 'sonarr' or 'radarr' (etc.), or null to skip.
            return pick(document, 'meta[property=\"og:type\"]', 'content', [
                { siteId: 'sonarr', pattern: /video\.tv_show/i },
                { siteId: 'radarr', pattern: /video\.movie/i },
            ]);
        },

        // How to extract the search term for the link
        getSearch: function (el, document) {
            // Example 1: plain text from an element
            // return (document.querySelector('h1.title')?.textContent || '').trim();

            // Example 2: pull an ID from a URL & prefix it
            // const href = document.querySelector('link[rel=\"canonical\"]')?.href || '';
            // const m = href.match(/\/(?<id>\d{2,10})-/);
            // return m ? 'tmdb:' + m.groups.id : '';

            return '';
        },

        // Icon styles (you can stick to the defaults or tweak per site)
        iconStyle: 'width: 28px; margin: -4px 10px 0 0;'
    });

    window.__servarrEngines.list.push(YourSiteEngine);
})();
```

### Helpers available

- `DefaultEngine(config)` – builds the engine.
- `pickSiteIdFromDocument(document, selector, attribute, rules)` – replicates old `rules` logic:
  - `rules = [{ siteId:'sonarr', pattern:/.../i }, ...]`  
  - Reads the `attribute` from the first `selector` match and returns the first matching `siteId`.
- `createNodeFromHTML(html)` – safely wraps the link in custom HTML (for layout-specific needs).

---

## Mapping: Old Fields → New Engine Config

| Old (integrations array) | New (engine config) |
|---|---|
| `match.terms` | `urlIncludes` (array of substrings) |
| `defaultSite` | `siteType` (fixed) |
| `rules` (with `match.pattern` / `operator`) | `resolveSiteType(document, url, settings)` + `pickSiteIdFromDocument` helper |
| `search.containerSelector`, `selectorType`, `modifiers` | Implement inside `getSearch(el, document)` (regex, replace, prepend, etc.) |
| `icon.containerSelector` | `containerSelector` |
| `icon.locator` (`prepend`, `append`) | `insertWhere` (`prepend`, `append`, `before`, `after`) |
| `icon.wrapLinkWithContainer` | `wrapLinkWithContainer` |
| `icon.imgStyles` | `iconStyle` |
| `deferMs` | `deferMs` (unchanged) |
| `where` gates | Implement inside `resolveSiteType` (return `null` to skip) or early-exit in `getSearch` |

> You can keep the same behaviors: extract IDs (`imdb:tt…`, `tmdb:…`), trim/rewrite titles, or gate on `og:type`, etc.

---

## Wiring & Load Order

Make sure these are loaded (in this order) as content scripts:

1. `content/engines/index.js` (initializes the registry)
2. `content/engines/default.js` (runtime + helpers)
3. Your engine file(s) – e.g., `content/engines/integrations/yoursite.js`
4. `content/js/content_script.js` (runner that executes engines)

> Many engines ship with the repo already (IMDb, TMDb, TVDB, Trakt, etc.). Add yours after those.

---

## Adding It to the Settings UI

Add an entry to **`core.js`** (the list that powers the toggles & logos):

```js
// Somewhere in defaultSettings.integrations (or the relevant registry)
{
  id: 'yoursite',
  name: 'Your Site',
  image: 'yoursite.png',
  enabled: true
}
```

The `id` must match your engine’s `id`.

---

## Dynamic Routing (old `rules`) Examples

**IMDb** (TV vs Movie via `og:type`):

```js
resolveSiteType: function (document) {
    return pick(document, 'meta[property=\"og:type\"]', 'content', [
        { siteId: 'sonarr', pattern: /(tv_show|other)/i },
        { siteId: 'radarr', pattern: /(movie|other)/i }
    ]);
},
getSearch: function (_el, document) {
    const href = document.querySelector('link[rel=\"canonical\"]')?.href || '';
    const m = href.match(/(?<tt>tt\d{5,10})/i);
    return m ? 'imdb:' + m.groups.tt : '';
}
```

**TMDb** (TV = Sonarr by title text, Movie = Radarr by canonical ID):

```js
resolveSiteType: function (document, url) {
    if (/themoviedb\.org\/tv\//i.test(url)) return 'sonarr';
    if (/themoviedb\.org\/movie\//i.test(url)) return 'radarr';
    return null;
},
getSearch: function (_el, document) {
    const href = document.querySelector('link[rel=\"canonical\"]')?.href || '';
    const isMovie = /themoviedb\.org\/movie\//i.test(href);
    if (isMovie) {
        const m = href.match(/\/(\d{2,10})-/);
        return m ? 'tmdb:' + m[1] : '';
    }
    return (document.querySelector('.header .title h2 a')?.textContent || '').trim();
}
```

---

## SPA/Slow DOM Pages

If the target DOM is built late (Trakt, SIMKL, Prime Video), add:

```js
deferMs: 1000 // or 2000/3000 based on observation
```

---

## Layout Tips

- Prefer **inline** placement (`prepend` or `append`) when possible for stable flow.
- If a container can’t hold anchors or needs a stable slot, use `wrapLinkWithContainer`:
  ```js
  wrapLinkWithContainer: '<div class="my-slot"></div>'
  ```
- Avoid negative margins unless the site’s markup forces it.

---

## Testing & Debugging

- Enable **Debug** in extension settings to see logs from `content_script.js`.
- Confirm:
  - Engine `match` triggers on the URL.
  - `resolveSiteType` returns a Servarr type or `null` (skip).
  - `getSearch` returns a **non-empty** term (`"tmdb:12345"`, `"imdb:tt1234567"`, or a clear title).
  - The icon appears only once per target element (the runner prevents double injection).
- For SPA pages, experiment with `deferMs`.

---

## Pull Request Checklist

- [ ] New engine file at `src/content/engines/integrations/<site>.js`
- [ ] Added to load order (manifest or build config) **before** `content_script.js`
- [ ] Settings entry in `core.js` (`id`, `name`, `image`, `enabled`)
- [ ] Tested on representative URLs
- [ ] Handled dynamic routing (`resolveSiteType`) if required
- [ ] Used `wrapLinkWithContainer` for tricky layouts if needed
- [ ] No duplicate injection (verify `data-servarr-icon` is respected)
- [ ] Added logo asset (if the settings UI lists logos)

---

### FAQ

**Q: I need to check multiple DOM gates like the old `where`.**  
Use `resolveSiteType` (return `null` to skip) or early return `''` inside `getSearch`.

**Q: I previously used `modifiers` (`replace`, `regex-match`, `prepend`).**  
Do those inside `getSearch`:

- **replace**: `text = text.replace(/from/i, 'to')`
- **regex-match**: `const m = str.match(/(?<id>tt\d+)/); return m ? 'imdb:'+m.groups.id : ''`
- **prepend**: Just concatenate the prefix string.

**Q: Can I still support the “Custom icon position” floating CTA?**  
Yes—`content_script.js` decides that at runtime. Engines only provide terms, locations, and site type; the runner handles custom placement when enabled.
