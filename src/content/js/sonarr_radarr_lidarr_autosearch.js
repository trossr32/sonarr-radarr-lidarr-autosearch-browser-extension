async function getCurrentTab() {
    try {
        let queryOptions = { active: true, lastFocusedWindow: true };
    
        let [tab] = await browser.tabs.query(queryOptions);
    
        return tab;
    } catch (error) {
        console.warn('Error getting current tab', error);

        return null;
    }
}

var port = browser.runtime.connect({name: 'init'});

var init = async function() {
    var tab = await getCurrentTab();

    if (tab) {
        port.postMessage({ tabId: tab.id });
    }
};

$(function () {
    console.log('sonarr_radarr_lidarr_autosearch.js loaded');
    init();
});