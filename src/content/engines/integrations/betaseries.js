(function(){
    if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };
    
    var Def  = window.__servarrEngines.helpers.DefaultEngine;
    var pick = window.__servarrEngines.helpers.pickSiteIdFromDocument;

    function title(doc) {
        var n = doc.querySelector('h1[class^="blockInformations__title"]');
        return (n && (n.textContent || '').trim()) || '';
    }

    var TV = Def({
        id: 'betaseries',
        key: 'betaseries-tv',
        urlIncludes: ['betaseries.com/serie','betaseries.com/en/show'],
        containerSelector: 'h1[class^="blockInformations__title"]',
        insertWhere: 'prepend',
        iconStyle: 'width: 25px;margin: 0;vertical-align: baseline;margin: 0 0 0 4px;',
        resolveSiteType: function(doc){
            return pick(doc, 'meta[property="og:type"]','content', [
                { siteId: 'sonarr', pattern: /^video\.tv_show$/i }
            ]);
        },
        getSearch: function(_el,doc){ return title(doc); }
    });

    var Movie = Def({
        id: 'betaseries',
        key: 'betaseries-movie',
        urlIncludes: ['betaseries.com/film','betaseries.com/en/movie'],
        containerSelector: 'h1[class^="blockInformations__title"]',
        insertWhere: 'prepend',
        iconStyle: 'width: 25px;margin: 0;vertical-align: baseline;margin: 0 0 0 4px;',
        resolveSiteType: function(doc){
            return pick(doc, 'meta[property="og:type"]','content', [
                { siteId: 'radarr', pattern: /^video\.movie$/i }
            ]);
        },
        getSearch: function(_el,doc){ return title(doc); }
    });

    window.__servarrEngines.list.push(TV, Movie);
})();
