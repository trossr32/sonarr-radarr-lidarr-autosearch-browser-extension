(function () {
    if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };
    var Def = window.__servarrEngines.helpers.DefaultEngine;

    function getTitle(doc) {
        var span = doc.querySelector('.mw-page-title-main');
        if (span) return (span.textContent || '').trim();
        var heading = doc.querySelector('#firstHeading');
        return heading ? (heading.textContent || '').trim() : '';
    }

    function cleanTitle(title) {
        // Remove disambiguation suffixes like "(TV series)", "(film)", etc.
        return title.replace(/\s*\([^)]*\)\s*$/, '').trim();
    }

    function hasCategory(doc, pattern) {
        var cats = doc.querySelectorAll('#mw-normal-catlinks ul li a');
        for (var i = 0; i < cats.length; i++) {
            if (pattern.test(cats[i].textContent)) return true;
        }
        return false;
    }

    function getImdbId(doc) {
        var links = doc.querySelectorAll('a[href*="imdb.com/title/"]');
        for (var i = 0; i < links.length; i++) {
            var m = links[i].href.match(/imdb\.com\/title\/(tt\d+)/i);
            if (m) return 'imdb:' + m[1];
        }
        return null;
    }

    function getSearchTerm(doc) {
        return getImdbId(doc) || cleanTitle(getTitle(doc));
    }

    var TV = Def({
        id: 'wikipedia',
        key: 'wikipedia-tv',
        siteType: 'sonarr',
        containerSelector: '#firstHeading',
        insertWhere: 'prepend',
        iconStyle: 'width: 26px; margin: 0 8px 0 0; display: inline-block; vertical-align: middle;',
        match: function (document, url) {
            if (!/wikipedia\.org\/wiki\//i.test(url)) return false;
            return hasCategory(document, /television series|television show|tv series|animated series|television season/i);
        },
        getSearch: function (_el, doc) {
            return getSearchTerm(doc);
        }
    });

    var Movie = Def({
        id: 'wikipedia',
        key: 'wikipedia-movie',
        siteType: 'radarr',
        containerSelector: '#firstHeading',
        insertWhere: 'prepend',
        iconStyle: 'width: 26px; margin: 0 8px 0 0; display: inline-block; vertical-align: middle;',
        match: function (document, url) {
            if (!/wikipedia\.org\/wiki\//i.test(url)) return false;
            return hasCategory(document, /\bfilms?\b/i);
        },
        getSearch: function (_el, doc) {
            return getSearchTerm(doc);
        }
    });

    var Music = Def({
        id: 'wikipedia',
        key: 'wikipedia-music',
        siteType: 'lidarr',
        containerSelector: '#firstHeading',
        insertWhere: 'prepend',
        iconStyle: 'width: 26px; margin: 0 8px 0 0; display: inline-block; vertical-align: middle;',
        match: function (document, url) {
            if (!/wikipedia\.org\/wiki\//i.test(url)) return false;
            return hasCategory(document, /musical (group|artist|ensemble|act)|singers?\b|bands?\b|musicians?\b|rappers?\b|music group/i);
        },
        getSearch: function (_el, doc) {
            return cleanTitle(getTitle(doc));
        }
    });

    window.__servarrEngines.list.push(TV, Movie, Music);
})();
