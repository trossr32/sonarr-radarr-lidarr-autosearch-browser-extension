(function(){
    if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };

    var Def = window.__servarrEngines.helpers.DefaultEngine;

    var TV = Def({
        id: 'simkl',
        key: 'simkl-tv',
        urlIncludes: ['simkl.com/tv/'],
        siteType: 'sonarr',
        deferMs: 1000,
        containerSelector: 'td.SimklTVDetailPoster div:nth-of-type(1)',
        wrapLinkWithContainer: '<div style="position: absolute; top: 5px; left: 5px; width: 50px; z-index: 1;"></div>',
        insertWhere: 'prepend',
        iconStyle: 'width: 40px;',
        getSearch: function(_el,doc){ 
            var n=doc.querySelector('h1'); 
            return (n && (n.textContent||'').trim())||''; 
        }
    });

    var TVCalendar = Def({
        id: 'simkl',
        key: 'simkl-tv-calendar',
        urlIncludes: ['simkl.com/tv/calendar'],
        siteType: 'sonarr',
        containerSelector: 'table.SimklTVCalendarDayList > tbody > tr > td > div > div.SimklTVCalendarDayListLink:nth-of-type(1)',
        wrapLinkWithContainer: '<section style="float: left; margin: 3px 4px 0 0"></section>',
        insertWhere: 'prepend',
        iconStyle: 'width: 12px;',
        getSearch: function(el){ 
            var a=el && el.querySelector('a'); 
            return (a && (a.textContent||'').trim())||''; 
        }
    });

    var Movie = Def({
        id: 'simkl',
        key: 'simkl-movie',
        urlIncludes: ['simkl.com/movie'],
        siteType: 'radarr',
        deferMs: 1000,
        containerSelector: 'td.SimklTVDetailPoster div:nth-of-type(1)',
        wrapLinkWithContainer: '<div style="position: absolute; top: 5px; left: 5px; width: 50px; z-index: 1;"></div>',
        insertWhere: 'prepend',
        iconStyle: 'width: 40px;',
        getSearch: function(_el,doc){ 
            var n=doc.querySelector('h1'); 
            return (n && (n.textContent||'').trim())||''; 
        }
    });

    window.__servarrEngines.list.push(TV, TVCalendar, Movie);
})();
