(function(){
    if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };

    var Def = window.__servarrEngines.helpers.DefaultEngine;

    var ArtistHeader = Def({
        id: 'lastfm',
        key: 'lastfm-artist-header',
        urlIncludes: ['last.fm/music'],
        siteType: 'lidarr',
        containerSelector: '.header-new-title',
        insertWhere: 'prepend',
        iconStyle: 'width: 35px; margin: 0 10px 0 0;',
        getSearch: function(_el,doc){ 
            var n=doc.querySelector('.header-new-title'); 
            return (n && (n.textContent||'').trim())||''; 
        }
    });

    var Crumb = Def({
        id: 'lastfm',
        key: 'lastfm-crumb',
        urlIncludes: ['last.fm/music'],
        siteType: 'lidarr',
        containerSelector: '.header-new-crumb > span',
        insertWhere: 'prepend',
        iconStyle: 'width: 25px; margin: 0 10px 0 0;',
        getSearch: function(_el,doc){ 
            var n=doc.querySelector('.header-new-crumb > span'); 
            return (n && (n.textContent||'').trim())||''; 
        }
    });

    window.__servarrEngines.list.push(ArtistHeader, Crumb);
})();
