(function(){
    if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };
    
    var Def = window.__servarrEngines.helpers.DefaultEngine;

    var pick = window.__servarrEngines.helpers.pickSiteIdFromDocument;

    function pageTitle(doc){
        var n = doc.querySelector('head > title');
        var v = (n && (n.textContent || '') ) || '';

        log(['primevideo pageTitle:', v]);
        
        return v.replace(/^Prime video:\s*/i,'').trim();
    }

    var TV = Def({
        id: 'primevideo',
        key: 'primevideo-tv',
        urlIncludes: ['www.primevideo.com/detail'],
        deferMs: 2000,
        containerSelector: 'h1',
        insertWhere: 'append',
        iconStyle: 'width: 30px;margin: 8px 0 0 8px;',
        resolveSiteType: function(doc){
            var p = pick(doc,'meta[property="og:url"]','content', [
                { siteId:'sonarr', pattern:/primevideo\.com\/tv/i },
                { siteId:'radarr', pattern:/primevideo\.com\/movie/i }
            ]);
            
            log(['primevideo resolveSiteType pick:', p]);
            
            return p;
        },
        getSearch: function(_el,doc){ return pageTitle(doc); }
    });

    var Movie = Def({
        id: 'primevideo',
        key: 'primevideo-movie',
        urlIncludes: ['www.primevideo.com/detail'],
        deferMs: 2000,
        containerSelector: 'h1',
        insertWhere: 'append',
        iconStyle: 'width: 30px;margin: 8px 0 0 8px;',
        resolveSiteType: function(doc){
            var p =  pick(doc,'meta[property="og:url"]','content', [
                { siteId:'radarr', pattern:/primevideo\.com\/movie/i }
            ]);

            log(['primevideo resolveSiteType pick:', p]);

            return p;
        },
        getSearch: function(_el,doc){ return pageTitle(doc); }
    });

    window.__servarrEngines.list.push(TV, Movie);
})();
