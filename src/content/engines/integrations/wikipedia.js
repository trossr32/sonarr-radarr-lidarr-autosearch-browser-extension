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

    // Matches categories that indicate the article IS a TV series,
    // excluding false positives like "Films based on television series".
    function hasTVCategory(doc) {
        var cats = doc.querySelectorAll('#mw-normal-catlinks ul li a');
        var tvPattern = /television series|television show|tv series|animated series|television season/i;
        for (var i = 0; i < cats.length; i++) {
            var text = cats[i].textContent;
            if (tvPattern.test(text) && !/\bfilm|\bbased on\b/i.test(text)) return true;
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

    // For album articles, find the artist name via infobox then category fallback.
    function getAlbumArtist(doc) {
        // Try infobox subheader: "Studio album by Miles Davis", "Compilation album by ..."
        var subs = doc.querySelectorAll('.infobox .infobox-subheader, .infobox .infobox-below, .infobox .infobox-header.description');
        for (var i = 0; i < subs.length; i++) {
            var byMatch = (subs[i].textContent || '').match(/\balbum\s+by\s+(.+)/i);
            if (byMatch) return byMatch[1].replace(/\[.*?\]/g, '').trim();
        }
        // Try infobox "Artist" row (exact match to avoid "Guest artists", etc.)
        var rows = doc.querySelectorAll('.infobox tr');
        for (var k = 0; k < rows.length; k++) {
            var th = rows[k].querySelector('th');
            if (th && /^\s*artists?\s*$/i.test(th.textContent || '')) {
                var td = rows[k].querySelector('td');
                if (td) return (td.textContent || '').replace(/\[.*?\]/g, '').trim();
            }
        }
        // Fallback: "[Artist Name] albums" category (e.g. "Miles Davis albums")
        // Skip year-only matches like "1959 albums".
        var cats = doc.querySelectorAll('#mw-normal-catlinks ul li a');
        for (var j = 0; j < cats.length; j++) {
            var m = (cats[j].textContent || '').match(/^(.+?)\s+albums?$/i);
            if (m && !/^\d/.test(m[1].trim())) return m[1].trim();
        }
        return null;
    }

    // Categories that end with "film"/"films" mean the article IS a film.
    // This avoids false positives like "Film score composers" or "Film music".
    function hasFilmCategory(doc) {
        var cats = doc.querySelectorAll('#mw-normal-catlinks ul li a');
        for (var i = 0; i < cats.length; i++) {
            if (/\bfilms?$/.test((cats[i].textContent || '').trim())) return true;
        }
        return false;
    }

    function getMusicSearchTerm(doc) {
        if (hasCategory(doc, /\balbums?\b/i)) {
            var artist = getAlbumArtist(doc);
            var title = cleanTitle(getTitle(doc));
            return artist ? title + ' by ' + artist : title;
        }
        return cleanTitle(getTitle(doc));
    }

    var TV = Def({
        id: 'wikipedia',
        key: 'wikipedia-tv',
        siteType: 'sonarr',
        containerSelector: '#firstHeading',
        insertWhere: 'prepend',
        iconStyle: 'width: 26px; margin: 0 8px 0 0; display: inline-block; vertical-align: middle; position: relative; top: -2px;',
        match: function (document, url) {
            if (!/wikipedia\.org\/wiki\//i.test(url)) return false;
            return hasTVCategory(document);
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
        iconStyle: 'width: 26px; margin: 0 8px 0 0; display: inline-block; vertical-align: middle; position: relative; top: -2px;',
        match: function (document, url) {
            if (!/wikipedia\.org\/wiki\//i.test(url)) return false;
            if (hasTVCategory(document)) return false;
            return hasFilmCategory(document);
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
        iconStyle: 'width: 26px; margin: 0 8px 0 0; display: inline-block; vertical-align: middle; position: relative; top: -2px;',
        match: function (document, url) {
            if (!/wikipedia\.org\/wiki\//i.test(url)) return false;
            return hasCategory(document, /musical (group|artist|ensemble|act)|singers?\b|bands?\b|musicians?\b|rappers?\b|music group|\balbums?\b/i);
        },
        getSearch: function (_el, doc) {
            return getMusicSearchTerm(doc);
        }
    });

    window.__servarrEngines.list.push(TV, Movie, Music);
})();
