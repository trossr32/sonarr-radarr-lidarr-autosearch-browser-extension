(function(){
    if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };

    var Def = window.__servarrEngines.helpers.DefaultEngine;

    var TV = Def({
        id: 'iptorrents',
        key: 'iptorrents-tv',
        // IPTorrents runs under several domains/TLDs (.com, .net, .me, .eu, ...)
        match: function (_doc, url) { return /iptorrents\.[a-z.]+\/tv/i.test(url); },
        siteType: 'sonarr',
        containerSelector: 'b.MovieTitle',
        insertWhere: 'append',
        iconStyle: 'width: 20px; margin: 5px 0 0 0;',
        getSearch: function(_el,doc){ 
            var a=_el && _el.querySelector('a'); 
            return (a && (a.textContent||'').trim())||''; 
        }
    });

    var Movies = Def({
        id: 'iptorrents',
        key: 'iptorrents-movies',
        match: function (_doc, url) { return /iptorrents\.[a-z.]+\/movies/i.test(url); },
        siteType: 'radarr',
        containerSelector: 'b.MovieTitle',
        insertWhere: 'append',
        iconStyle: 'width: 20px; margin: 5px 0 0 0;',
        getSearch: function(_el,doc){
            var a = _el && _el.querySelector('a');
            var href = (a && a.href) || '';
            var m = href.match(/(tt\d{5,10})/i);
            return m ? ('imdb:' + m[1]) : '';
        }
    });

    window.__servarrEngines.list.push(TV, Movies);
})();
