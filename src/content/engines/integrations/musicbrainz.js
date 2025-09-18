(function () {
    if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };
    
    var Def = window.__servarrEngines.helpers.DefaultEngine;

    function getHref(sel, doc) { var a = doc.querySelector(sel); return (a && a.href) || ''; }

    var Artist = Def({
        id: 'musicbrainz',
        key: 'musicbrainz-artist',
        urlIncludes: ['musicbrainz.org/artist'],
        siteType: 'lidarr',
        containerSelector: '.artistheader > h1',
        insertWhere: 'prepend',
        iconStyle: 'width: 26px; margin: 0 5px -4px 0;',
        getSearch: function (_el, doc) {
            var href = getHref('.artistheader > h1 > a', doc);
            return href ? href.replace('/artist/', 'lidarr:') : '';
        }
    });

    var ReleaseGroup = Def({
        id: 'musicbrainz',
        key: 'musicbrainz-release-group',
        urlIncludes: ['musicbrainz.org/release-group'],
        siteType: 'lidarr',
        containerSelector: '.rgheader > h1',
        insertWhere: 'prepend',
        iconStyle: 'width: 26px; margin: 0 5px -4px 0;',
        getSearch: function (_el, doc) {
            var href = getHref('.rgheader > h1 > a', doc);
            return href ? href.replace('/release-group/', 'lidarr:') : '';
        }
    });

    var Release = Def({
        id: 'musicbrainz',
        key: 'musicbrainz-release',
        urlIncludes: ['musicbrainz.org/release'],
        siteType: 'lidarr',
        containerSelector: '.releaseheader > h1',
        insertWhere: 'prepend',
        iconStyle: 'width: 26px; margin: 0 5px -4px 0;',
        getSearch: function (_el, doc) {
            var href = getHref('.releaseheader > h1 > a', doc);
            return href ? href.replace('/release/', 'lidarr:') : '';
        }
    });

    window.__servarrEngines.list.push(Artist, ReleaseGroup, Release);
})();
