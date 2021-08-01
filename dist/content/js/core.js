/**
 * API request variables
 * @typedef {Object} ApiRequest
 * @property {string} siteId - (sonarr / radarr / lidarr)
 * @property {string} endpoint - (Version / Status / Lookup / GetEntity / SetEntity / QualityProfiles)
 */

/**
 * An API response
 * @typedef {Object} ApiResponse
 * @property {Object} data - the API response
 * @property {ApiRequest} request - the API method request variables
 * @property {bool} success - success flag
 * @property {string} error - error details
 */

/**
 * All settings
 * @typedef {Object} Setting
 * @property {SiteSetting[]} sites - all site settings
 * @property {Integration[]} integrations - all integrations
 * @property {bool} enabled - is enabled
 * @property {bool} debug - log to console
 * @property {int} searchInputWaitForMs - jQuery selector for the search input on the search page
 * @property {int} searchInputMaxAttempts - text that is shown for this site's entry in the context menu
 */

/**
 * A Servarr site setting
 * @typedef {Object} SiteSetting
 * @property {string} id - site identifier (sonarr / radarr / lidarr)
 * @property {string} domain - site domain
 * @property {bool} enabled - is enabled
 * @property {string} searchPath - URL path to the site search / add new page
 * @property {string} searchInputSelector - jQuery selector for the search input on the search page
 * @property {string} menuText - text that is shown for this site's entry in the context menu
 * @property {string} apiKey - API key
 * @property {bool} autoPopAdvancedFromApi - whether the search path / selector settings should be updated from the API
 */

/**
 * A site integration
 * @typedef {Object} Integration
 * @property {string} id - integration identifier
 * @property {string} name - integration name
 * @property {string} image - logo
 * @property {bool} enabled - is enabled
 */

/**
 * All instance API specific configurations
 * @typedef {ApiConfig[]} ApiConfigs
 */

/**
 * API configuration endpoints for a Servarr instance
 * @typedef {Object} ApiConfig
 * @property {string} id - site identifier (sonarr / radarr / lidarr)
 * @property {ApiConfigEndpoint[]} endpoints - API endpoints for the Servarr instance
 */

/**
 * API configuration endpoint details
 * @typedef {Object} ApiConfigEndpoint
 * @property {string} key - identifier
 * @property {string} value - API URL part
 */

/**
 * All site version specific configurations
 * @typedef {VersionConfig[]} VersionConfigs
 */

/**
 * Version configurations for a site
 * @typedef {Object} VersionConfig
 * @property {string} id - site identifier (sonarr / radarr / lidarr)
 * @property {VersionConfigItem[]} configs - configs for all versions to be matched against current version
 */

/**
 * Version configuration for a site version
 * @typedef {Object} VersionConfigItem
 * @property {string} versionMatch - regex pattern to match against the site version
 * @property {string} searchPath - URL path to the site search / add new page
 * @property {string} searchInputSelector - jQuery selector for the search input on the search page
 */

/**
 * Global variables
 */
var sessionId,
    defaultSettings = {
        sites: [
            {
                id: 'sonarr',
                domain: 'http://my.sonarrurl.domain',
                enabled: true,
                searchPath: '/addseries/',
                searchInputSelector: '.add-series-search .x-series-search',
                menuText: 'Search Sonarr for tv',
                apiKey: '',
                autoPopAdvancedFromApi: true
            }, {
                id: 'radarr',
                domain: 'http://my.radarrurl.domain',
                enabled: true,
                searchPath: '/addmovies/',
                searchInputSelector: '.add-movies-search .x-movies-search',
                menuText: 'Search Radarr for movie',
                apiKey: '',
                autoPopAdvancedFromApi: true
            }, {
                id: 'lidarr',
                domain: 'http://my.lidarrurl.domain',
                enabled: false,
                searchPath: '/add/search/',
                searchInputSelector: 'input[name="searchBox"]',
                menuText: 'Search Lidarr for artist',
                apiKey: '',
                autoPopAdvancedFromApi: true
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
            },
            {
                id: 'musicbrainz',
                name: 'MusicBrainz',
                image: 'musicbrainz.svg',
                enabled: true
            },
            {
                id: 'letterboxd',
                name: 'Letterboxd',
                image: 'letterboxd.svg',
                enabled: true
            },
            {
                id: 'tvcalendar',
                name: 'TV Calendar',
                image: 'tvcalendar.png',
                enabled: true
            }
        ],
        config: {
            enabled: true,
            debug: false,        
            searchInputWaitForMs: 300,
            searchInputMaxAttempts: 20
        }
    },
    /* may need to expand this out differently for use with v3, as adding a v3 to the URL for a v3 of radarr or sonarr gives some more or different info. 
     * the issue is the version can only be detected from the API, and you can't call a different API version without first knowing the version!
     * may need to do v3 try and fallback, or call the base, save the version setting and use going forward? 
     * Will need to do periodic checks for updates, but this will be done anyway for checking search path / selector configs.
     * For now we're only interested in the version so leaving as is.
     */ 
    apiConfig = [
        {
            id: 'sonarr',
            endpoints: [
                {
                    key: 'Version',
                    value: 'system/status'
                },
                {
                    key: 'Status',
                    value: 'system/status'
                },
                {
                    key: 'QualityProfiles',
                    value: 'profile'
                }
            ]
        },
        {
            id: 'radarr',
            endpoints: [
                {
                    key: 'Version',
                    value: 'system/status'
                },
                {
                    key: 'Status',
                    value: 'system/status'
                },
                {
                    key: 'QualityProfiles',
                    value: 'qualityProfile'
                }
            ]
        },
        {
            id: 'lidarr',
            endpoints: [
                {
                    key: 'Version',
                    value: 'v1/system/status'
                },
                {
                    key: 'Status',
                    value: 'v1/system/status'
                },
                {
                    key: 'QualityProfiles',
                    value: 'v1/qualityprofile'
                }
            ]
        }
    ],
    versionConfig = [
        {
            id: 'sonarr',
            configs: [
                {
                    versionMatch: /^2/,
                    searchPath: '/addseries/',
                    searchInputSelector: '.add-series-search .x-series-search'
                },
                {
                    versionMatch: /^3/,
                    searchPath: '/add/new/',
                    searchInputSelector: 'input[name="seriesLookup"]'
                }
            ]
        },
        {
            id: 'radarr',
            configs: [
                {
                    versionMatch: /^0/,
                    searchPath: '/addmovies/',
                    searchInputSelector: '.add-movies-search .x-movies-search'
                },
                {
                    versionMatch: /^3/,
                    searchPath: '/add/new/',
                    searchInputSelector: 'input[name="movieLookup"]'
                }
            ]
        },
        {
            id: 'lidarr',
            configs: [
                {
                    versionMatch: /^0/,
                    searchPath: '/add/search/',
                    searchInputSelector: 'input[name="searchBox"]'
                }
            ]
        }
    ];

/**
 * Logs to console if the debug flag is set. 
 * Always warns or errors regardless of if the debug flag is set. 
 * Should be a string or array of objects.
 * Adds an identifier to the start of the content if it's a string, otherwise as a string object at the beginning of the array.
 * @param {any[]} content 
 * @param {string} logLevel
 */
async function log(content, logLevel = 'info') {
    const settings = await getSettings();

    if (!settings.config.debug && logLevel === 'info') {
        return;
    }

    const identifier = `[ServarrExt]`;

    // concat identifier if it's a string
    if (typeof content === "string" || content instanceof String) {
        content = `${identifier} ${content}`;
    } 
    // otherwise it's an array
    else {
        content.unshift(identifier);
    }

    switch (logLevel) {
        case 'info':
            console.log(content);
            return;
          
        case 'warn':
            console.warn(content);
            return;
          
        case 'error':
            console.error(content);
            return;  
    }
}

/*
* Log old and new values when an item in a storage area is changed
*/
var logStorageChange = function(changes, area) {
    let changedItems = Object.keys(changes);
  
    for (let item of changedItems) {
        log(`Change in storage area: ${area} to item ${item}`);
        log(['Old value: ', changes[item].oldValue]);
        log(['New value: ', changes[item].newValue]);
    }
};

browser.storage.onChanged.addListener(logStorageChange);

/**
 * Retrieves settings from local storage
 * Checks for potentially missing properties in the settings object (caused by new properties being added on new versions of the code) 
 * and create those properties as defaults or from the defaultSettings object.
 */
async function getSettings() {
    let data = await browser.storage.sync.get({ 'sonarrRadarrLidarrAutosearchSettings': defaultSettings });

    // if (!data.sonarrRadarrLidarrAutosearchSettings.hasOwnProperty('enabled')) {
    //     data.sonarrRadarrLidarrAutosearchSettings.enabled = true;
    // }

    // if (!data.sonarrRadarrLidarrAutosearchSettings.hasOwnProperty('debug')) {
    //     data.sonarrRadarrLidarrAutosearchSettings.debug = false;
    // }

    if (!data.sonarrRadarrLidarrAutosearchSettings.hasOwnProperty('integrations')) {
        data.sonarrRadarrLidarrAutosearchSettings.integrations = defaultSettings.integrations;
    }

    if (!data.sonarrRadarrLidarrAutosearchSettings.hasOwnProperty('config')) {
        data.sonarrRadarrLidarrAutosearchSettings.config = defaultSettings.config;
    }

    // check integrations array
    for (let i = 0; i < defaultSettings.integrations.length; i++) {
        /* jshint ignore:start */
        
        // try to find the integration
        if (data.sonarrRadarrLidarrAutosearchSettings.integrations.some(integration => integration.id === defaultSettings.integrations[i].id)) {
            continue;
        }

        /* jshint ignore:end */

        // integration not found
        data.sonarrRadarrLidarrAutosearchSettings.integrations.push(defaultSettings.integrations[i]);
    }

    // check sites array
    for (let i = 0; i < data.sonarrRadarrLidarrAutosearchSettings.sites.length; i++) {
        if (!data.sonarrRadarrLidarrAutosearchSettings.sites[i].hasOwnProperty('apiKey')) {
            data.sonarrRadarrLidarrAutosearchSettings.sites[i].apiKey = '';
        }

        if (!data.sonarrRadarrLidarrAutosearchSettings.sites[i].hasOwnProperty('autoPopAdvancedFromApi')) {
            data.sonarrRadarrLidarrAutosearchSettings.sites[i].autoPopAdvancedFromApi = true;
        }
    }

    return data.sonarrRadarrLidarrAutosearchSettings;
}

/**
 * Saves settings to local storage
 * Checks for potentially missing properties in the settings object (caused by new properties being added on new versions of the code) 
 * and create those properties as defaults or from the defaultSettings object.
 * @param {Settings} data - settings to save
 */
async function setSettings(data) {
    if (!data.hasOwnProperty('enabled')) {
        data.enabled = true;
    }

    if (!data.hasOwnProperty('debug')) {
        data.enabled = false;
    }

    if (!data.hasOwnProperty('integrations')) {
        data.integrations = defaultSettings.integrations;
    }

    if (!data.hasOwnProperty('config')) {
        data.config = defaultSettings.config;
    }

    let obj = {
        'sonarrRadarrLidarrAutosearchSettings': data
    };
    //obj['sonarrRadarrLidarrAutosearchSettings'] = data;

    await browser.storage.sync.set(obj);
    return data;
}

/**
 * Get search path / selector configuration for a given site and version
 * @param {string} siteId 
 * @param {string} version 
 * @returns {VersionConfigItem}
 */
var getVersionConfig = (siteId, version) =>
    versionConfig
        .find(v => v.id === siteId)
        .configs
            .find(c => c.versionMatch.test(version));

/**
 * Build a URL to call an API
 * @param {string} siteId 
 * @param {string} endpoint 
 * @returns {URL} - the url
 */
var getApiUrl = (site, endpoint) => {
    let _endpoint = apiConfig
        .find(a => a.id == site.id)
        .endpoints
            .find(e => e.key == endpoint);

    let url = new URL(`${site.domain.replace(/(.+)\/$/, '$1')}/api/${_endpoint.value}`);

    url.searchParams.append('apikey', site.apiKey);

    return url;
};

/**
 * Call an instance API
 * @param {ApiRequest} request
 * @returns {Promise<ApiResponse>}
 */
async function callApi(request) {
    const settings = await getSettings();
    let site = settings.sites
        .filter(s => s.enabled)
        .find(s => s.id == request.siteId);

    if (site == null) {
        return {
            data: null,
            request: request,
            success: false,
            error: 'site config not found (likely it\'s not enabled)'
        };
    }

    if (site.apiKey == null || site.apiKey === '') {
        return {
            data: null,
            request: request,
            success: false,
            error: 'no api key set for site'
        };
    }

    let url = getApiUrl(site, request.endpoint);

    try {
        const data = await $.getJSON(url);

        switch (request.endpoint) {
            // if this is a 'Version' call try to update settings if with version specific data
            case 'Version':
                // if auto population is turned off the just return response
                if (!site.autoPopAdvancedFromApi && request.source != 'ApiAutoPopEnabled') {
                    return {
                        data: data,
                        request: request,
                        success: true,
                        error: null
                    };
                }

                // auto population is enabled, so get the config for this version and update settings
                let config = getVersionConfig(site.id, data.version);

                for (let i = 0; i < settings.sites.length; i++) {
                    if (settings.sites[i].id === site.id) {
                        settings.sites[i].searchPath = config.searchPath;
                        settings.sites[i].searchInputSelector = config.searchInputSelector;
                    }
                }

                await setSettings(settings);

                return {
                    data: data,
                    request: request,
                    success: true,
                    error: null
                };

            default:
                return {
                    data: data,
                    request: request,
                    success: true,
                    error: null
                };
        }
    } catch (error) {
        return {
            data: null,
            request: request,
            success: false,
            error: error
        };
    }
}