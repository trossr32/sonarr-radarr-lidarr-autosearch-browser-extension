(function(){
    if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };

    var Def = window.__servarrEngines.helpers.DefaultEngine;

    var TV = Def({
        id: 'simkl',
        key: 'simkl-tv',
        urlIncludes: ['simkl.com/tv/'],
        siteType: 'sonarr',
        deferMs: 1000,
        containerSelector: 'td.SimklTVDetailPoster td > div:first-of-type',
        wrapLinkWithContainer: '<div class="servarr-simkl-tv"></div>',
        injectStyles: `
            .servarr-simkl-tv { 
                --i: 0; 
                --icon-size: 48px; 
            }
            .servarr-simkl-tv:nth-of-type(2) { --i: 1; }
            .servarr-simkl-tv:nth-of-type(3) { --i: 2; }
            .servarr-simkl-tv:nth-of-type(4) { --i: 3; }
            .servarr-simkl-tv:nth-of-type(5) { --i: 4; }
            .servarr-simkl-tv:nth-of-type(6) { --i: 5; }
            .servarr-simkl-tv:nth-of-type(7) { --i: 6; }

            .servarr-simkl-tv { 
                position: absolute !important;
                top: 5px !important;
                left: calc(5px + (var(--icon-size)) * var(--i)) !important;
                z-index: 2 !important;
            }
        `,
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
        wrapLinkWithContainer: '<section style="float: left; margin: 2px 4px 0 0"></section>',
        insertWhere: 'prepend',
        iconStyle: 'width: 12px;',
        getSearch: function(_el,doc){ 
            var a=_el && _el.querySelector('a'); 
            return (a && (a.textContent||'').trim())||''; 
        }
    });

    var Movie = Def({
        id: 'simkl',
        key: 'simkl-movie',
        urlIncludes: ['simkl.com/movie'],
        siteType: 'radarr',
        deferMs: 1000,
        containerSelector: 'td.SimklTVDetailPoster td > div:first-of-type',
        wrapLinkWithContainer: '<div class="servarr-simkl-movie"></div>',
        injectStyles: `
            .servarr-simkl-movie { 
                --i: 0; 
                --icon-size: 48px;
            }
            .servarr-simkl-movie:nth-of-type(2) { --i: 1; }
            .servarr-simkl-movie:nth-of-type(3) { --i: 2; }
            .servarr-simkl-movie:nth-of-type(4) { --i: 3; }
            .servarr-simkl-movie:nth-of-type(5) { --i: 4; }
            .servarr-simkl-movie:nth-of-type(6) { --i: 5; }

            .servarr-simkl-movie { 
                position: absolute !important;
                top: 5px !important;
                left: calc(5px + (var(--icon-size)) * var(--i)) !important;
                z-index: 2 !important;
            }
        `,
        insertWhere: 'prepend',
        iconStyle: 'width: 40px;',
        getSearch: function(_el,doc){ 
            var n=doc.querySelector('h1'); 
            return (n && (n.textContent||'').trim())||''; 
        }
    });

    window.__servarrEngines.list.push(TV, TVCalendar, Movie);
})();
