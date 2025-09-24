(function(){
    if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };
    
    var Def = window.__servarrEngines.helpers.DefaultEngine;

    function titleFromOg(doc){
        var m = doc.querySelector('meta[property="og:title"]');
        var v = (m && m.getAttribute('content')) || '';
        return v.replace(/ \| Rotten Tomatoes/i, '').trim();
    }

    var Movies = Def({
        id: 'rottentomatoes',
        key: 'rottentomatoes-movies',
        urlIncludes: ['rottentomatoes.com/m'],
        siteType: 'radarr',
        containerSelector: '#hero-wrap [context="heading"]',
        insertWhere: 'prepend',
        iconStyle: 'width: 30px; margin: 0 10px 0 0;',
        getSearch: function(_el, doc){ return titleFromOg(doc); }
    });

    var TV = Def({
        id: 'rottentomatoes',
        key: 'rottentomatoes-tv',
        urlIncludes: ['rottentomatoes.com/tv'],
        siteType: 'sonarr',
        containerSelector: '#hero-wrap [context="heading"]',
        insertWhere: 'prepend',
        iconStyle: 'width: 30px; margin: 0 10px 0 0;',
        getSearch: function(_el, doc){ return titleFromOg(doc); }
    });

    window.__servarrEngines.list.push(Movies, TV);
})();
