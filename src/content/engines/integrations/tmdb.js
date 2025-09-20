(function () {
    if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };
    var Def = window.__servarrEngines.helpers.DefaultEngine;

    function canonicalHref(doc) {
        var n = doc.querySelector('link[rel="canonical"]');
        return (n && n.href) ? n.href : '';
    }

    var Engine = Def({
        id: 'tmdb',
        key: 'tmdb',
        urlIncludes: ['themoviedb.org'],
        containerSelector: '.header .title h2', // icon target
        insertWhere: 'prepend',
        iconStyle: 'width:1em; height:1em; display:inline-block; vertical-align:-0.15em; margin:0 .4em 0 0;',
        resolveSiteType: function (document) {
            var href = canonicalHref(document);
            if (/themoviedb\.org\/tv\//i.test(href)) return 'sonarr';
            if (/themoviedb\.org\/movie\//i.test(href)) return 'radarr';
            return null;
        },
        getSearch: function (_el, document) {
            var href = canonicalHref(document);
            if (/themoviedb\.org\/tv\//i.test(href)) {
                var a = document.querySelector('.header .title h2 a');
                return (a && a.textContent || '').trim();
            }
            if (/themoviedb\.org\/movie\//i.test(href)) {
                var m = href.match(/\/(\d{2,10})-/i);
                return m ? ('tmdb:' + m[1]) : '';
            }
            return '';
        }
    });

    window.__servarrEngines.list.push(Engine);
})();
