(function () {
    if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };
    
    var Def = window.__servarrEngines.helpers.DefaultEngine;

    var Engine = Def({
        id: 'letterboxd',
        key: 'letterboxd',
        urlIncludes: ['letterboxd.com/film/'],
        siteType: 'radarr',
        containerSelector: '.details > h1',
        insertWhere: 'prepend',
        iconStyle: 'width: 25px; margin: 8px 10px 0 0; float: left;',
        getSearch: function (_el, doc) {
            var b = doc.querySelector('body');
            var id = b && b.getAttribute('data-tmdb-id');
            return id ? ('tmdb:' + id) : '';
        }
    });

    window.__servarrEngines.list.push(Engine);
})();
