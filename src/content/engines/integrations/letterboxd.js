(function () {
    if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };
    
    var Def = window.__servarrEngines.helpers.DefaultEngine;

    var TV = Def({
        id: 'letterboxd',
        key: 'letterboxd-tv',

        match: function (document, url) {
            const urlMatches = /.+letterboxd\.com\/film\/.+/i.test(url);

            if (!urlMatches) return false;

            // if the url exists return false so we don't include TV engine for a movie.
            return !(document.querySelector('a[href*="themoviedb.org/movie/"]'));
        },

        siteType: 'sonarr',
        containerSelector: '.details > h1',
        insertWhere: 'prepend',
        iconStyle: 'width: 25px; margin: 8px 10px 0 0; float: left;',
        getSearch: function (_el, doc) {
            var b = doc.querySelector('body');

            var imdbLink = document.querySelector('a[href*="imdb.com/title/"]');
            const imdbIdRegex = /imdb\.com\/title\/(tt\d+)(?:\/|$)/i;
            const imdbMatch = imdbLink ? imdbLink.href.match(imdbIdRegex) : null;
            const imdbId = imdbMatch ? imdbMatch[1] : null; // "tt2734814"

            if (imdbId && imdbId.length > 0) {
                return `imdb:${imdbId}`;
            }
            
            var tmdbId = b && b.getAttribute('data-tmdb-id');

            if (tmdbId && tmdbId.length > 0) {
                return `tmdb:${tmdbId}`;
            }

            var tmdbLink = document.querySelector('a[href*="themoviedb.org/tv/"]');
            const tmdbRegex = /(?:https?:\/\/)?(?:www\.)?themoviedb\.org\/tv\/(\d+)(?:\/|$)/i;
            const match = tmdbLink ? tmdbLink.href.match(tmdbRegex) : null;
            tmdbId = match ? match[1] : null; // "273481"

            return tmdbId ? (`tmdb:${tmdbId}`) : '';
        }
    });

    var Movie = Def({
        id: 'letterboxd',
        key: 'letterboxd-movie',

        match: function (document, url) {
            const urlMatches = /.+letterboxd\.com\/film\/.+/i.test(url);

            if (!urlMatches) return false;

            // if the url exists return false so we don't include movie engine for TV shows.
            return !(document.querySelector('a[href*="themoviedb.org/tv/"]'));
        },

        siteType: 'radarr',
        containerSelector: '.details > h1',
        insertWhere: 'prepend',
        iconStyle: 'width: 25px; margin: 8px 10px 0 0; float: left;',
        getSearch: function (_el, doc) {
            var b = doc.querySelector('body');

            var imdbLink = document.querySelector('a[href*="imdb.com/title/"]');
            const imdbIdRegex = /imdb\.com\/title\/(tt\d+)(?:\/|$)/i;
            const imdbMatch = imdbLink ? imdbLink.href.match(imdbIdRegex) : null;
            const imdbId = imdbMatch ? imdbMatch[1] : null; // "tt2734814"

            if (imdbId && imdbId.length > 0) {
                return `imdb:${imdbId}`;
            }
            
            var tmdbId = b && b.getAttribute('data-tmdb-id');

            if (tmdbId && tmdbId.length > 0) {
                return `tmdb:${tmdbId}`;
            }

            var tmdbLink = document.querySelector('a[href*="themoviedb.org/movie/"]');
            const tmdbRegex = /(?:https?:\/\/)?(?:www\.)?themoviedb\.org\/movie\/(\d+)(?:\/|$)/i;
            const match = tmdbLink ? tmdbLink.href.match(tmdbRegex) : null;
            tmdbId = match ? match[1] : null; // "273481"

            return tmdbId ? (`tmdb:${tmdbId}`) : '';
        }
    });

    window.__servarrEngines.list.push(TV, Movie);
})();
