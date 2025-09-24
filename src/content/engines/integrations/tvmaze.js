// content/engines/integrations/tvmaze.js
(function () {
    if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };
    var Def = window.__servarrEngines.helpers.DefaultEngine;

    var ShowPage = Def({
        id: 'tvmaze',
        key: 'tvmaze-show',
        urlIncludes: ['tvmaze.com/shows/'],
        siteType: 'sonarr',
        containerSelector: 'h1.show-for-medium',
        insertWhere: 'prepend',
        iconStyle: 'width: 32px; margin: -8px 10px 0 0;',
        getSearch: function (_el, doc) {
            var n = doc.querySelector('h1.show-for-medium');
            return (n && (n.textContent || '').trim()) || '';
        }
    });

    var Countdown = Def({
        id: 'tvmaze',
        key: 'tvmaze-countdown',
        urlIncludes: ['tvmaze.com/countdown'],
        siteType: 'sonarr',
        containerSelector: 'div.show-name',
        insertWhere: 'prepend',
        iconStyle: 'width: 24px; margin: -8px 10px 0 0;',
        getSearch: function (_el, doc) {
            var n = doc.querySelector('div.show-name');
            return (n && (n.textContent || '').trim()) || '';
        }
    });

    window.__servarrEngines.list.push(ShowPage, Countdown);
})();
