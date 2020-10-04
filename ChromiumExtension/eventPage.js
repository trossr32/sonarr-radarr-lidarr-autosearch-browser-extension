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

        case 'settings':
            port.onMessage.addListener(function(request) {
                switch (request.method) {
                    case 'get':
                        getSettings(function(settings) { 
                            port.postMessage({ request: request, settings: settings }); 
                        });
                        break;
                    case 'set':
                        setSettings(request.settings, function (settings) {
                            buildMenus(settings);

                            port.postMessage({ request: request, success: true });
                        });
                        break;
                }
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
            chrome.contextMenus.create({ "title": settings.sites[i].menuText, "parentId": "sonarrRadarrLidarr", "id": settings.sites[i].id + "Menu", "contexts": ["selection"] });
        }
    });
}

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

// set up context menu tree at install time.
chrome.runtime.onInstalled.addListener(function () {
    getSettings(function(settings) {
        buildMenus(settings);
    });
});

var sessionId,
    defaultSettings = {
        sites: [
            {
                id: 'sonarr',
                domain: 'http://my.sonarrurl.domain',
                enabled: true,
                searchPath: '/addseries/',
                searchInputSelector: '.add-series-search .x-series-search',
                menuText: 'Search Sonarr for tv'
            }, {
                id: 'radarr',
                domain: 'http://my.radarrurl.domain',
                enabled: true,
                searchPath: '/addmovies/',
                searchInputSelector: '.add-movies-search .x-movies-search',
                menuText: 'Search Radarr for movie'
            }, {
                id: 'lidarr',
                domain: 'http://my.lidarrurl.domain',
                enabled: false,
                searchPath: '/add/new/',
                searchInputSelector: 'input[class*="AddNewArtist-searchInput-"]',
                menuText: 'Search Lidarr for artist'
            }
        ],
        integrations: [
            {
                id: 'imdb',
                name: 'IMDb',
                image: 'imdb.png',
                enabled: true
            },
            {
                id: 'tmdb',
                name: 'TMDb',
                image: 'tmdb.svg',
                enabled: true
            },
            {
                id: 'tvdb',
                name: 'tvdb',
                image: 'tvdb.png',
                enabled: true
            },
            {
                id: 'trakt',
                name: 'Trakt',
                image: 'trakt.png',
                enabled: true
            },
            {
                id: 'tvmaze',
                name: 'TVmaze',
                image: 'tvmaze.png',
                enabled: true
            }
        ],
        enabled: true
    };

var setIcon = function(settings) {
    chrome.tabs.getCurrent(function(tab) {
        var img = 'content/assets/images/SonarrRadarrLidarr' + (settings.enabled ? '' : '-faded') + '16.png';

        chrome.browserAction.setIcon({ path: img });
    });
};

var getSettings = function(callback) {
    chrome.storage.sync.get({ 'sonarrRadarrLidarrAutosearchSettings': defaultSettings }, function (data) {
        if (typeof callback === "function") {
            if (!data.sonarrRadarrLidarrAutosearchSettings.hasOwnProperty('enabled')) {
                data.sonarrRadarrLidarrAutosearchSettings.enabled = true;
            }

            if (!data.sonarrRadarrLidarrAutosearchSettings.hasOwnProperty('integrations')) {
                data.sonarrRadarrLidarrAutosearchSettings.integrations = defaultSettings.integrations;
            }

            // check integrations array
            for (let i = 0; i < defaultSettings.integrations.length; i++) {
                var integrationFound = false;

                for (let j = 0; j < data.sonarrRadarrLidarrAutosearchSettings.integrations.length; j++) {
                    if (data.sonarrRadarrLidarrAutosearchSettings.integrations[j].id == defaultSettings.integrations[i].id) {
                        integrationFound = true;
                    }  
                }

                if (!integrationFound) {
                    data.sonarrRadarrLidarrAutosearchSettings.integrations.push(defaultSettings.integrations[i]);
                }
            }
            
            callback(data.sonarrRadarrLidarrAutosearchSettings);
        }
    });
};

var setSettings = function (data, callback) {
    if (!data.hasOwnProperty('enabled')) {
        data.enabled = true;
    }

    if (!data.hasOwnProperty('integrations')) {
        data.integrations = defaultSettings.integrations;
    }

    var obj = {};
    obj['sonarrRadarrLidarrAutosearchSettings'] = data;

    chrome.storage.sync.set(obj, function() {
        if (typeof callback === "function") {
            callback(data);
        }
    });
};