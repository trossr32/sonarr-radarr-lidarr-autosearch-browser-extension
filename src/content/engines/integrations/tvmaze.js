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
        getSearch: function (el, doc) {
            return (el && (el.textContent || '').trim()) || '';
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
        getSearch: function (el, doc) {
            return (el && (el.textContent || '').trim()) || '';
        }
    });

    var ShowsList = Def({
        id: 'tvmaze',
        key: 'tvmaze-shows',
        match: function (doc, url) {
            return url.indexOf('tvmaze.com/shows') >= 0 && url.indexOf('tvmaze.com/shows/') === -1;
        },
        siteType: 'sonarr',
        containerSelector: 'span.title h2',
        insertWhere: 'prepend',
        iconStyle: 'width: 16px; height: 16px; margin: -2px 6px 0 0; display: inline-block; vertical-align: middle;',
        getSearch: function (el, doc) {
            return (el && (el.textContent || '').trim()) || '';
        }
    });

    window.__servarrEngines.list.push(ShowPage, Countdown, ShowsList);
})();
