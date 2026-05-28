
(function () {
    if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };

    var Def = window.__servarrEngines.helpers.DefaultEngine;
    var pick = window.__servarrEngines.helpers.pickSiteIdFromDocument;

    // Retry-aware IMDb id extractor: if not found, schedule up to 5 retries at 500ms
    function imdbId(doc) {
        // Try immediate lookup first
        var a = doc.querySelector('a[href^="https://www.imdb.com/title/tt"]');
        var href = (a && a.href) || '';
        var m = href.match(/(tt\d{5,10})/i);

        if (m) {
            // Reset retry state on success
            if (!window.__servarrTraktImdbRetry) window.__servarrTraktImdbRetry = { attempts: 0, url: location.href, scheduled: false };
            
            window.__servarrTraktImdbRetry.attempts = 0;
            window.__servarrTraktImdbRetry.url = location.href;
            window.__servarrTraktImdbRetry.scheduled = false;

            return `imdb:${m[1]}`;
        }

        // Initialize or refresh retry state per-URL
        var st = window.__servarrTraktImdbRetry || { attempts: 0, url: location.href, scheduled: false };

        if (st.url !== location.href) {
            st.attempts = 0;
            st.url = location.href;
            st.scheduled = false;
        }

        // Schedule a re-run if we still have budget
        if (st.attempts < 5) {
            st.attempts++;

            if (!st.scheduled) {
                st.scheduled = true;

                setTimeout(function () {
                    // Allow another schedule window
                    var cur = window.__servarrTraktImdbRetry || st;
                    cur.scheduled = false;
                    window.__servarrTraktImdbRetry = cur;

                    // Trigger engines to re-evaluate once the DOM likely has imdb link
                    try {
                        if (typeof window.runEngines === 'function') {
                            window.runEngines();
                        }
                    } catch (_) { /* ignore */ }
                }, 500);
            }
        }

        // Not found yet; return empty to skip for now
        window.__servarrTraktImdbRetry = st;
        
        return '';
    }

    // Shows detail (TV → Sonarr)
    var ShowsDetail = Def({
        id: 'trakt',
        key: 'trakt-shows-detail',
        urlIncludes: ['trakt.tv/shows/'],
        deferMs: 3000,
        containerSelector: 'h3',
        insertWhere: 'prepend',
        iconStyle: 'width: 36px; margin-right: 10px;',
        spa: {
            domains: ['trakt.tv'],
            urlCheckIntervalMs: 400
        },
        resolveSiteType: function (doc) {
            return pick(doc, 'meta[property="og:type"][content^="video"]', 'content', [
                { siteId: 'sonarr', pattern: /video\.tv_show/i }
            ]);
        },
        getSearch: function (_el, doc) { return imdbId(doc); }
    });

    // Movies detail (Movie → Radarr)
    var MoviesDetail = Def({
        id: 'trakt',
        key: 'trakt-movies-detail',
        urlIncludes: ['trakt.tv/movies/'],
        deferMs: 3000,
        containerSelector: 'h3',
        insertWhere: 'prepend',
        iconStyle: 'width: 36px; margin-right: 10px;',
        spa: {
            domains: ['trakt.tv'],
            urlCheckIntervalMs: 400
        },
        resolveSiteType: function (doc) {
            return pick(doc, 'meta[property="og:type"][content^="video"]', 'content', [
                { siteId: 'radarr', pattern: /video\.movie/i }
            ]);
        },
        getSearch: function (_el, doc) { return imdbId(doc); }
    });

    // Shows group listings (default Sonarr)
    var ShowsGroup = Def({
        id: 'trakt',
        key: 'trakt-shows-group',
        urlIncludes: [
            'trakt.tv/shows/trending',
            'trakt.tv/shows/popular',
            'trakt.tv/shows/favorited/weekly',
            'trakt.tv/shows/watched/weekly',
            'trakt.tv/shows/collected/weekly',
            'trakt.tv/shows/anticipated'
        ],
        deferMs: 2000,
        containerSelector: '.trakt-card-content',
        insertWhere: 'prepend',
        iconStyle: 'width: 20px; margin: 0;',
        siteType: 'sonarr',
        spa: {
            domains: ['trakt.tv'],
            urlCheckIntervalMs: 400
        },
        getInsertElOverride: function(el) { return el.querySelector('.trakt-card-footer') || el; },
        getSearch: function (_el, doc) {
            const a = _el.querySelector('a');
            const raw = a ? (a.getAttribute('href') || a.href || '').trim() : '';
            if (!raw) return '';

            const path = raw.startsWith('http') ? new URL(raw, location.href).pathname : raw;

            // Match: /shows/<slug>[optional trailing /]
            const m = path.match(/^\/shows\/([a-z0-9\-_]+)(?:\/|$)/i);
            return m ? m[1].replace(/[-_]/g, ' ').trim() : '';
        }
    });

    // Movies group listings (default Radarr)
    var MoviesGroup = Def({
        id: 'trakt',
        key: 'trakt-movies-group',
        urlIncludes: [
            'trakt.tv/movies/trending',
            'trakt.tv/movies/popular',
            'trakt.tv/movies/favorited/weekly',
            'trakt.tv/movies/watched/weekly',
            'trakt.tv/movies/collected/weekly',
            'trakt.tv/movies/anticipated',
            'trakt.tv/movies/boxoffice'
        ],
        deferMs: 2000,
        containerSelector: '.trakt-card-content',
        insertWhere: 'prepend',
        iconStyle: 'width: 20px; margin: 0;',
        siteType: 'radarr',
        spa: {
            domains: ['trakt.tv'],
            urlCheckIntervalMs: 500
        },
        getInsertElOverride: function(el) { return el.querySelector('.trakt-card-footer') || el; },
        getSearch: function (_el, doc) {
            const a = _el.querySelector('a');
            const raw = a ? (a.getAttribute('href') || a.href || '').trim() : '';
            if (!raw) return '';

            const path = raw.startsWith('http') ? new URL(raw, location.href).pathname : raw;

            // Match: /movies/<slug>[-YYYY][optional trailing /]
            const m = path.match(/^\/movies\/([a-z0-9\-_]+?)(?:-\d{4})?(?:\/|$)/i);
            return m ? m[1].replace(/[-_]/g, ' ').trim() : '';
        }
    });

    window.__servarrEngines.list.push(ShowsDetail, MoviesDetail, ShowsGroup, MoviesGroup);
})();
