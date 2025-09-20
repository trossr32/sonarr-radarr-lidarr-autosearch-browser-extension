(function () {
    if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };
    
    var DefaultEngine = window.__servarrEngines.helpers.DefaultEngine;
    var pickSiteIdFromDocument = window.__servarrEngines.helpers.pickSiteIdFromDocument;

    function extractImdbId(document) {
        var href = (document.querySelector('link[rel="canonical"]') || {}).href || '';
        var m = href.match(/(tt\d{5,10})/i);
        return m ? (`imdb:${m[1]}`) : '';
    }

    // One engine, dynamic site routing using meta[og:type]
    var TV = DefaultEngine({
        id: 'imdb',
        // no static siteType here — we decide at runtime
        urlIncludes: ['imdb.com'],
        containerSelector: 'h1',
        getSearch: function (_el, document) { return extractImdbId(document); },
        iconStyle: 'width:35px; height:35px; display:inline-block; vertical-align:middle; margin:0 8px 0 0;',

        // Restore the old "rules" behaviour:
        // if meta[property="og:type"][content] matches /(tv_show|other)/i => 'sonarr'
        // if meta[property="og:type"][content] matches /(movie|other)/i  => 'radarr'
        resolveSiteType: function (document /*, url, settings */) {
            // Prefer the exact field the old config used
            var selector = 'meta[property="og:type"]';
            var attr = 'content';

            var rules = [{ siteId: 'sonarr', pattern: /(video\.tv_show|tv_show|tvseries|tv|other)/i }];

            return pickSiteIdFromDocument(document, selector, attr, rules);
        }
    });

    // One engine, dynamic site routing using meta[og:type]
    var Movie = DefaultEngine({
        id: 'imdb',
        // no static siteType here — we decide at runtime
        urlIncludes: ['imdb.com'],
        containerSelector: 'h1',
        getSearch: function (_el, document) { return extractImdbId(document); },
        iconStyle: 'width:35px; height:35px; display:inline-block; vertical-align:middle; margin:0 8px 0 0;',

        // Restore the old "rules" behaviour:
        // if meta[property="og:type"][content] matches /(tv_show|other)/i => 'sonarr'
        // if meta[property="og:type"][content] matches /(movie|other)/i  => 'radarr'
        resolveSiteType: function (document /*, url, settings */) {
            // Prefer the exact field the old config used
            var selector = 'meta[property="og:type"]';
            var attr = 'content';

            var rules = [{ siteId: 'radarr', pattern: /(video\.movie|movie|film|other)/i }];

            return pickSiteIdFromDocument(document, selector, attr, rules);
        }
    });

    window.__servarrEngines.list.push(TV, Movie);
})();
