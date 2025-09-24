
(function () {
    if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };

    var Def = window.__servarrEngines.helpers.DefaultEngine;
    var pick = window.__servarrEngines.helpers.pickSiteIdFromDocument;

    function imdbId(doc) {
        var a = doc.querySelector('.external > li > a#external-link-imdb');
        var href = (a && a.href) || '';
        var m = href.match(/(tt\d{5,10})/i);
        return m ? (`imdb:${m[1]}`) : '';
    }
    
    function tmdbId(doc) {
        var a = doc.querySelector('.external > li > a#external-link-tmdb');
        var href = (a && a.href) || '';
        var m = href.match(/\/(\d{2,10})/i);
        return m ? (`tmdb:${m[1]}`) : '';
    }

    // Shows detail (TV → Sonarr)
    var ShowsDetail = Def({
        id: 'trakt',
        key: 'trakt-shows-detail',
        urlIncludes: ['trakt.tv/shows/'],
        deferMs: 3000,
        containerSelector: '.container h1',
        insertWhere: 'prepend',
        iconStyle: 'width: 25px; margin: -8px 10px 0 0;',
        resolveSiteType: function (doc) {
            return pick(doc, 'meta[property="og:type"]', 'content', [
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
        containerSelector: '.container h1',
        insertWhere: 'prepend',
        iconStyle: 'width: 25px; margin: -8px 10px 0 0;',
        resolveSiteType: function (doc) {
            return pick(doc, 'meta[property="og:type"]', 'content', [
                { siteId: 'radarr', pattern: /video\.movie/i }
            ]);
        },
        getSearch: function (_el, doc) { return tmdbId(doc); }
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
        containerSelector: '.titles-link > h3',
        insertWhere: 'append',
        iconStyle: 'width: 25px; margin: 0 0 -4px 10px;',
        siteType: 'sonarr',
        getSearch: function (_el,doc) { return (_el && (_el.textContent || '').trim()) || ''; }
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
        containerSelector: '.titles-link > h3',
        insertWhere: 'append',
        iconStyle: 'width: 23px; margin: 0 0 2px 10px;',
        siteType: 'radarr',
        getSearch: function (_el,doc) { return (_el && (_el.textContent || '').trim()) || ''; }
    });

    window.__servarrEngines.list.push(ShowsDetail, MoviesDetail, ShowsGroup, MoviesGroup);
})();
