(function(){
    if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };

    var Def  = window.__servarrEngines.helpers.DefaultEngine;
    var pick = window.__servarrEngines.helpers.pickSiteIdFromDocument;

    function ogTitle(doc){
        var m = doc.querySelector('meta[property="og:title"]');
        var v = (m && m.getAttribute('content')) || '';
        return v.replace(/\s+reviews$/i, '').trim();
    }

    var Engine = Def({
        id: 'metacritic',
        key: 'metacritic',
        urlIncludes: ['metacritic.com'],
        containerSelector: 'div[class*="productHero_title"] > :last-child',
        insertWhere: 'prepend',
        iconStyle: 'width: 32px; margin: 0px 10px 0 0;',
        resolveSiteType: function(doc){
            var site = pick(doc, 'meta[name="adtags"]', 'content', [
                { siteId:'sonarr', pattern:/type=tv/i },
                { siteId:'radarr', pattern:/type=movie/i }
            ]);
            
            return site;
        },
        getSearch: function(_el, doc){ return ogTitle(doc); }
    });

    window.__servarrEngines.list.push(Engine);
})();
