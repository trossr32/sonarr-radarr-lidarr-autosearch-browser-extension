(function(){
    if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };

    var Def = window.__servarrEngines.helpers.DefaultEngine;

    var Album = Def({
        id: 'rateyourmusic',
        key: 'rateyourmusic-album',
        urlIncludes: ['rateyourmusic.com/release/album'],
        siteType: 'lidarr',
        containerSelector: '.album_title',
        insertWhere: 'prepend',
        iconStyle: 'width: 20px; margin-right: 5px;',
        getSearch: function(_el,doc){ 
            var qat = doc.querySelector('.album_title'); 
            var album = (qat && (qat.textContent||'').split("  ")[0].trim())||''; 
            return album; 
        }
    });

    var Artist = Def({
        id: 'rateyourmusic',
        key: 'rateyourmusic-artist',
        urlIncludes: ['rateyourmusic.com/artist'],
        siteType: 'lidarr',
        containerSelector: '.artist_name_hdr',
        insertWhere: 'prepend',
        iconStyle: 'width: 20px; margin-right: 5px;',
        getSearch: function(_el,doc){ 
            var n=doc.querySelector('.artist_name_hdr'); 
            return (n && (n.textContent||'').trim())||''; 
        }
    });

    window.__servarrEngines.list.push(Album, Artist);
})();
