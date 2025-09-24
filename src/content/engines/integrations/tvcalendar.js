(function () {
  if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };

  var Def = window.__servarrEngines.helpers.DefaultEngine;

  // TVCalendar (pogdesign) — right-aligned, non-overlapping icons
  var Engine = Def({
    id: 'tvcalendar',
    key: 'tvcalendar',
    urlIncludes: ['pogdesign.co.uk/cat'],
    siteType: 'sonarr',
    containerSelector: 'p[data-episode]',

    // PREPEND (important): let the text wrap around the float
    insertWhere: 'prepend',

    // Right “slot” for one or many icons; no negative margins
    wrapLinkWithContainer: '<span class="servarr-ext-right-slot" style="float:right; display:inline-flex; margin-left:8px;"></span>',

    // Keep the svg simple; let the wrapper do the layout
    iconStyle: 'width:18px; height:18px; display:block;',

    getSearch: function (_el,doc) {
      var a = _el && _el.querySelector('a:first-of-type');
      return (a && (a.textContent || '').trim()) || '';
    }
  });

  window.__servarrEngines.list.push(Engine);
})();