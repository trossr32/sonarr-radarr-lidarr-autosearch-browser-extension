(function(){
    if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };

    var Def  = window.__servarrEngines.helpers.DefaultEngine;

    // Title now lives in the hero heading, e.g. <h1 class="hero-title__text">The Dark Knight</h1>
    // (Metacritic 2024+ redesign: the old og:title carried " Reviews - Metacritic" noise.)
    function heroTitle(el, doc){
        var h = (el && el.textContent) ? el : (doc.querySelector('div[class*="product-hero__title"] h1') || doc.querySelector('h1'));
        return (h && h.textContent || '').trim();
    }

    var Engine = Def({
        id: 'metacritic',
        key: 'metacritic',
        // Only run on the tv/movie detail pages (skip game/music etc.)
        urlIncludes: ['metacritic.com/tv/', 'metacritic.com/movie/'],
        deferMs: 500,
        // Redesign renamed the title wrapper from "productHero_title" to BEM "product-hero__title".
        containerSelector: 'div[class*="product-hero__title"] h1',
        insertWhere: 'prepend',
        iconStyle: 'width: 32px; margin: 0px 10px 0 0;',
        // meta[name="adtags"] and og:type no longer exist, so route off the URL path.
        resolveSiteType: function(_doc, url){
            if (/metacritic\.com\/tv\//i.test(url)) return 'sonarr';
            if (/metacritic\.com\/movie\//i.test(url)) return 'radarr';
            return null;
        },
        spa: {
            domains: ['metacritic.com'],
            urlCheckIntervalMs: 500
        },
        getSearch: function(el, doc){ return heroTitle(el, doc); }
    });

    window.__servarrEngines.list.push(Engine);
})();
