(function(){
    if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };
    
    var Def = window.__servarrEngines.helpers.DefaultEngine;

    var TV = Def({
        id: 'senscritique',
        key: 'senscritique-tv',
        urlIncludes: ['senscritique.com/serie'],
        siteType: 'sonarr',
        containerSelector: 'h1',
        insertWhere: 'prepend',
        iconStyle: 'width: 30px; margin: 0 10px 0 0;',
        getSearch: function(_el,doc){ 
            var n=doc.querySelector('h1');
                        
            return (n && (n.textContent||'').trim())||''; 
        }
    });

    var Movie = Def({
        id: 'senscritique',
        key: 'senscritique-movie',
        urlIncludes: ['senscritique.com/film'],
        siteType: 'radarr',
        containerSelector: 'h1',
        insertWhere: 'prepend',
        iconStyle: 'width: 30px; margin: 0 10px 0 0;',
        getSearch: function(_el,doc){ 
            var n=doc.querySelector('h1'); 
            return (n && (n.textContent||'').trim())||''; 
        }
    });

    window.__servarrEngines.list.push(TV, Movie);
})();
