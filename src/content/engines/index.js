(function () {
    // Global namespace for engines. Reset on every (re)injection so the engine
    // list can never accumulate duplicates if the content script is injected
    // more than once (e.g. declarative content_scripts + a programmatic fallback).
    // index.js always runs first in the injected file order, and the engine files
    // that follow repopulate the list synchronously.
    window.__servarrEngines = { list: [], helpers: {} };
})();
