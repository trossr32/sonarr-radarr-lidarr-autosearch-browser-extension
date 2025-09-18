(function(){
    if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };
    
    var Def  = window.__servarrEngines.helpers.DefaultEngine;
    var pick = window.__servarrEngines.helpers.pickSiteIdFromDocument;

    function title(doc){
        var m = doc.querySelector('meta[property="og:title"]');
        return (m && m.getAttribute('content') || '').trim();
    }

    function applyReplacements(str, reps){
        reps.forEach(function(r){ str = str.replace(r.from, r.to); });
        return str.trim();
    }

    var TV = Def({
        id: 'allocine',
        key: 'allocine-tv',
        urlIncludes: ['allocine.fr/series'],
        containerSelector: '.titlebar-page .titlebar-title',
        insertWhere: 'prepend',
        iconStyle: 'width: 32px; margin: -8px 10px 0 0;',
        resolveSiteType: function(doc){
            // Must be tv_show per old "where"
            var site = pick(doc, 'meta[property="og:type"]','content', [
                { siteId: 'sonarr', pattern: /^video\.tv_show$/i }
            ]);
            return site;
        },
        getSearch: function(_el,doc){
            var t = title(doc);
            var reps = [
                {from:'critiques de la série ',to:''},
                {from:'les saisons de ',to:''},
                {from:'casting ',to:''},
                {from:'actus de la série ',to:''},
                {from:'vidéos ',to:''},
                {from:' en streaming',to:''},
                {from:' en vod',to:''}
            ];
            return applyReplacements(t,reps);
        }
    });

    var Movie = Def({
        id: 'allocine',
        key: 'allocine-movie',
        urlIncludes: ['allocine.fr/film'],
        containerSelector: '.titlebar-page .titlebar-title',
        insertWhere: 'prepend',
        iconStyle: 'width: 32px; margin: -2px 10px 0 0;',
        resolveSiteType: function(doc){
            return pick(doc, 'meta[property="og:type"]','content', [
                { siteId: 'radarr', pattern: /^video\.movie$/i }
            ]);
        },
        getSearch: function(_el,doc){
            var t = title(doc);
            var reps = [
                {from:'avis sur le film ',to:''},
                {from:'séances ',to:''},
                {from:'actus du film ',to:''},
                {from:'bande-annonce vo ',to:''},
                {from:'tout le casting du film ',to:''},
                {from:': les critiques presse',to:''},
                {from:'photos et affiches du film ',to:''},
                {from:'les secrets de tournage du film ',to:''},
                {from:'les films similaires à ',to:''}
            ];
            return applyReplacements(t,reps);
        }
    });

    window.__servarrEngines.list.push(TV, Movie);
})();
