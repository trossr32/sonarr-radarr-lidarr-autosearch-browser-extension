(function(){
    if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };

    var Def = window.__servarrEngines.helpers.DefaultEngine;

    var TV = Def({
        id: 'iptorrents',
        key: 'iptorrents-tv',
        urlIncludes: ['iptorrents.com/tv'],
        siteType: 'sonarr',
        containerSelector: 'b.MovieTitle',
        insertWhere: 'append',
        iconStyle: 'width: 20px; margin: 5px 0 0 0;',
        getSearch: function(el){ 
            var a=el && el.querySelector('a'); 
            return (a && (a.textContent||'').trim())||''; 
        }
    });

    var Movies = Def({
        id: 'iptorrents',
        key: 'iptorrents-movies',
        urlIncludes: ['iptorrents.com/movies'],
        siteType: 'radarr',
        containerSelector: 'b.MovieTitle',
        insertWhere: 'append',
        iconStyle: 'width: 20px; margin: 5px 0 0 0;',
        getSearch: function(el){
            var a = el && el.querySelector('a');
            var href = (a && a.href) || '';
            var m = href.match(/(tt\d{5,10})/i);
            return m ? ('imdb:' + m[1]) : '';
        }
    });

    window.__servarrEngines.list.push(TV, Movies);
})();
