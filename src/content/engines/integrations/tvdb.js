(function () {
    if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };

    var Def = window.__servarrEngines.helpers.DefaultEngine;

    function infoText(doc) {
        var n = doc.querySelector('#series_basic_info');
        return (n && (n.textContent || n.innerText) || '').toLowerCase();
    }

    var Engine = Def({
        id: 'tvdb',
        key: 'tvdb',
        urlIncludes: ['thetvdb.com'],
        containerSelector: '#series_title',
        insertWhere: 'prepend',
        iconStyle: 'width: 25px; margin: -8px 10px 0 0;',
        resolveSiteType: function (document, url) {
            if (/thetvdb\.com\/series\//i.test(url)) return 'sonarr';
            if (/thetvdb\.com\/movie\//i.test(url)) return 'radarr';
            
            var txt = infoText(document);
            
            if (/series/.test(txt)) return 'sonarr';
            if (/movie/.test(txt)) return 'radarr';
            
            return null;
        },
        getSearch: function (_el, document, url) {
            var siteType = (/thetvdb\.com\/series\//i.test(url)) ? 'sonarr' : (/thetvdb\.com\/movie\//i.test(url)) ? 'radarr' : null;

            if (siteType === 'sonarr') {
                var s = document.querySelector('#series_basic_info > ul > li:first-of-type > span');
                var v = (s && (s.textContent || '')).trim();
                return v ? (`tvdb:${v}`) : '';
            }
            
            var t = document.querySelector('#series_title');
            
            return (t && (t.textContent || '').trim()) || '';
        }
    });

    window.__servarrEngines.list.push(Engine);
})();
