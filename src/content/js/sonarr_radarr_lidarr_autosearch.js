var port = browser.runtime.connect({name: 'init'});

var init = async function() {
    port.postMessage({});
};

$(function () {
    console.log('sonarr_radarr_lidarr_autosearch.js loaded');
    init();
});