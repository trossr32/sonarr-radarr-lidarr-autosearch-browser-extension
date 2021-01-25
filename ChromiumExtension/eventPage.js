chrome.runtime.onConnect.addListener(function(port) {
    switch (port.name) {
        case 'init':
            port.onMessage.addListener(function (request) {
                getSettings(function (settings) {
                    setIcon(settings);

                    chrome.tabs.executeScript(null, { file: 'content/js/content_script.js' }, function () {});
                });
            });
            break;

        case 'icon':
            port.onMessage.addListener(function (request) {
                getSettings(function (settings) {
                    setIcon(settings);
                });
            });
            break;
    }
});

/**
 * Build the browser context menus
 * @param {Settings} settings 
 */
function buildMenus(settings) {
    chrome.contextMenus.removeAll(function () {
        // if extension is disabled gtfo
        if (!settings.enabled) {
            return;
        }

        var enabledSites = settings.sites.filter(site => { return site.enabled; });

        // if no sites are enabled gtfo
        if (enabledSites.length === 0) {
            return;
        }

        // create parent menu
        chrome.contextMenus.create({ "title": "Search Sonarr/Radarr/Lidarr", "id": "sonarrRadarrLidarr", "contexts": ["selection"] });

        // create child menus from enabled sites array
        for (var i = 0; i < enabledSites.length; i++) {
            chrome.contextMenus.create({ "title": enabledSites[i].menuText, "parentId": "sonarrRadarrLidarr", "id": enabledSites[i].id + "Menu", "contexts": ["selection"] });
        }
    });
}

/**
 * Context menu click handler
 * @param {*} info 
 * @param {*} tab 
 */
function onClickHandler(info, tab) {
    getSettings(function (settings) {
        for (var i = 0; i < settings.sites.length; i++) {
            if (info.menuItemId == (settings.sites[i].id + 'Menu')) {
                chrome.tabs.create({
                    'url': settings.sites[i].domain.replace(/\/$/, '') + settings.sites[i].searchPath + encodeURIComponent(info.selectionText).replace(/\./g, ' ')
                });
            }
        }
    });
};

chrome.contextMenus.onClicked.addListener(onClickHandler);

/**
 * set up context menu tree at install time.
 */
chrome.runtime.onInstalled.addListener(function () {
    getSettings(function(settings) {
        buildMenus(settings);
    });
});

/**
 * Set the extension icon
 * @param {Settings} settings 
 */
var setIcon = function(settings) {
    chrome.tabs.getCurrent(function(tab) {
        var img = 'content/assets/images/SonarrRadarrLidarr' + (settings.enabled ? '' : '-faded') + '16.png';

        chrome.browserAction.setIcon({ path: img });
    });
};