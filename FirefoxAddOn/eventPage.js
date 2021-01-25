browser.runtime.onConnect.addListener(function(port) {
    switch (port.name) {
        case 'init':
            port.onMessage.addListener(function (request) {
                getSettings(function (settings) {
                    setIcon(settings);

                    browser.tabs.executeScript({ file: 'content/js/content_script.js' });
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
    browser.contextMenus.removeAll(function () {
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
        browser.contextMenus.create({ "title": "Search Sonarr/Radarr/Lidarr", "id": "sonarrRadarrLidarr", "contexts": ["selection"] });

        // create child menus from enabled sites array
        for (var i = 0; i < enabledSites.length; i++) {
            browser.contextMenus.create({ "title": enabledSites[i].menuText, "parentId": "sonarrRadarrLidarr", "id": enabledSites[i].id + "Menu", "contexts": ["selection"] });
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
                browser.tabs.create({
                    'url': settings.sites[i].domain.replace(/\/$/, '') + settings.sites[i].searchPath + encodeURIComponent(info.selectionText).replace(/\./g, ' ')
                });
            }
        }
    });
};

browser.contextMenus.onClicked.addListener(onClickHandler);

/**
 * set up context menu tree at install time.
 */
browser.runtime.onInstalled.addListener(function () {
    getSettings(function(settings) {
        buildMenus(settings);
    });
});

/**
 * Set the extension icon
 * @param {Settings} settings 
 */
var setIcon = function(settings) {
    browser.tabs.getCurrent(function(tab) {
        var img = 'content/assets/images/SonarrRadarrLidarr' + (settings.enabled ? '' : '-faded') + '16.png';

        browser.browserAction.setIcon({ path: img });
    });
};
