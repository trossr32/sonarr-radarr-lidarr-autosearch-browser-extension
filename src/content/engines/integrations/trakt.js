(function () {
    if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };

    var Def = window.__servarrEngines.helpers.DefaultEngine;
    var pick = window.__servarrEngines.helpers.pickSiteIdFromDocument;

    // Trakt (app.trakt.tv) is a SvelteKit SPA. The IMDb/TMDb links are only rendered
    // when the "details" drawer is open (?view=details), so prefer the IMDb id when it
    // is present and otherwise fall back to the page title. Opening/closing the drawer
    // changes the URL, and the DOM watcher below upgrades the link to the id.
    function detailSearch(el, doc) {
        // While navigating, Trakt keeps the previous page rendered until the new data
        // loads; og:url switches with the content, so skip until it matches the URL.
        var og = doc.querySelector('meta[property="og:url"]');
        try {
            if (og && new URL(og.content, location.href).pathname !== location.pathname) return '';
        } catch (_) { /* ignore */ }

        var a = doc.querySelector('a[href^="https://www.imdb.com/title/tt"]');
        var m = ((a && a.href) || '').match(/(tt\d{5,10})/i);
        if (m) return `imdb:${m[1]}`;

        return (el.textContent || '').trim();
    }

    // Listing cards (discover/trending, popular, anticipated, etc.) use the card title.
    function cardSearch(el) {
        var t = el.querySelector('.trakt-card-title');
        return t ? (t.textContent || '').trim() : '';
    }

    var detailTitleSelector = '.trakt-summary-title h1';
    var showCardSelector = '.trakt-card-content:has(a.trakt-link[href^="/shows/"])';
    var movieCardSelector = '.trakt-card-content:has(a.trakt-link[href^="/movies/"])';
    var detailIconStyle = 'width: 40px; height: 40px; margin-right: 12px; vertical-align: middle;';
    var cardIconStyle = 'width: 24px; height: 24px; margin: 12px;';
    var spa = { domains: ['trakt.tv'], urlCheckIntervalMs: 400 };

    // Shows detail (TV → Sonarr)
    var ShowsDetail = Def({
        id: 'trakt',
        key: 'trakt-shows-detail',
        urlIncludes: ['trakt.tv/shows/'],
        containerSelector: detailTitleSelector,
        insertWhere: 'prepend',
        iconStyle: detailIconStyle,
        spa: spa,
        resolveSiteType: function (doc) {
            return pick(doc, 'meta[property="og:type"][content^="video"]', 'content', [
                { siteId: 'sonarr', pattern: /video\.tv_show/i }
            ]);
        },
        getSearch: detailSearch
    });

    // Movies detail (Movie → Radarr)
    var MoviesDetail = Def({
        id: 'trakt',
        key: 'trakt-movies-detail',
        urlIncludes: ['trakt.tv/movies/'],
        containerSelector: detailTitleSelector,
        insertWhere: 'prepend',
        iconStyle: detailIconStyle,
        spa: spa,
        resolveSiteType: function (doc) {
            return pick(doc, 'meta[property="og:type"][content^="video"]', 'content', [
                { siteId: 'radarr', pattern: /video\.movie/i }
            ]);
        },
        getSearch: detailSearch
    });

    // Discover listings mix shows and movies (?mode=show|movie|media), so route each
    // card by the type of page it links to. The icon sits in the card's top action bar.
    var ShowsGroup = Def({
        id: 'trakt',
        key: 'trakt-shows-group',
        urlIncludes: ['trakt.tv/discover/'],
        containerSelector: showCardSelector,
        insertWhere: 'prepend',
        iconStyle: cardIconStyle,
        siteType: 'sonarr',
        spa: spa,
        getInsertElOverride: function (el) { return el.querySelector('.trakt-card-action-bar') || el; },
        getSearch: cardSearch
    });

    var MoviesGroup = Def({
        id: 'trakt',
        key: 'trakt-movies-group',
        urlIncludes: ['trakt.tv/discover/'],
        containerSelector: movieCardSelector,
        insertWhere: 'prepend',
        iconStyle: cardIconStyle,
        siteType: 'radarr',
        spa: spa,
        getInsertElOverride: function (el) { return el.querySelector('.trakt-card-action-bar') || el; },
        getSearch: cardSearch
    });

    window.__servarrEngines.list.push(ShowsDetail, MoviesDetail, ShowsGroup, MoviesGroup);

    // Trakt renders client-side (usually after the content script's first run), swaps
    // content in place on navigation and only fills listing cards as they scroll into
    // view. Watch the DOM and re-run the engines as soon as a title or card appears or
    // its search term changes (e.g. the details drawer adding the IMDb link), clearing
    // any stale icon first. Our own insertions don't change a key, so they can't loop.
    if (location.hostname.indexOf('trakt.tv') >= 0 && !window.__servarrTraktObserver) {
        var clearInjected = function (el) {
            el.querySelectorAll('[data-servarr-icon]').forEach(function (a) { a.remove(); });
            Array.prototype.slice.call(el.attributes).forEach(function (attr) {
                if (attr.name.indexOf('data-servarr-ext-') === 0) el.removeAttribute(attr.name);
            });
        };

        // Record the current key on each target; true if any is new or changed.
        var scan = function () {
            var changed = false;
            var update = function (el, key, onChange) {
                if (el.getAttribute('data-servarr-trakt-key') === key) return;
                el.setAttribute('data-servarr-trakt-key', key);
                clearInjected(el);
                if (onChange) onChange();
                changed = true;
            };

            var titleEl = document.querySelector(detailTitleSelector);
            if (titleEl) {
                update(titleEl, location.pathname + '|' + detailSearch(titleEl, document), function () {
                    var custom = document.getElementById('servarr-ext_custom-icon-wrapper');
                    if (custom) custom.remove();
                });
            }

            if (location.pathname.indexOf('/discover/') === 0) {
                document.querySelectorAll(showCardSelector + ', ' + movieCardSelector).forEach(function (card) {
                    var term = cardSearch(card);
                    if (term) update(card, term);
                });
            }

            return changed;
        };

        var timer = null;
        window.__servarrTraktObserver = new MutationObserver(function () {
            clearTimeout(timer);
            timer = setTimeout(function () {
                try {
                    // Resolved via scope rather than window.* so it also works in Firefox's content-script sandbox
                    if (scan() && typeof runEngines === 'function') runEngines();
                } catch (_) { /* ignore */ }
            }, 150);
        });

        window.__servarrTraktObserver.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    }
})();
