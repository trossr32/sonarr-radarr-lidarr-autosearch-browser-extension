(function(){
    if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };
    
    var Def  = window.__servarrEngines.helpers.DefaultEngine;
    var pick = window.__servarrEngines.helpers.pickSiteIdFromDocument;

    function ogTitle(doc){
        var m = doc.querySelector('meta[property="og:title"]');
        return (m && m.getAttribute('content') || '').trim();
    }

    var TV = Def({
        id: 'myanimelist',
        key: 'myanimelist-tv',
        urlIncludes: ['myanimelist.net/anime'],
        containerSelector: 'h1',
        insertWhere: 'prepend',
        iconStyle: 'width: 16px; margin-right: 5px;',
        resolveSiteType: function(doc){
            return pick(doc,'meta[property="og:type"]','content', [
                { siteId:'sonarr', pattern:/^video\.tv_show$/i }
            ]);
        },
        getSearch: function(_el,doc){ return ogTitle(doc); }
    });

    var Movie = Def({
        id: 'myanimelist',
        key: 'myanimelist-movie',
        urlIncludes: ['myanimelist.net/anime'],
        containerSelector: 'h1',
        insertWhere: 'prepend',
        iconStyle: 'width: 16px; margin-right: 5px;',
        resolveSiteType: function(doc){
            return pick(doc,'meta[property="og:type"]','content', [
                { siteId:'radarr', pattern:/^video\.movie$/i }
            ]);
        },
        getSearch: function(_el,doc){ return ogTitle(doc); }
    });

    window.__servarrEngines.list.push(TV, Movie);
})();
