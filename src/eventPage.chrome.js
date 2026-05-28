// Chrome MV3 service worker

importScripts("./content/js/browser-polyfill.min.js");
importScripts("./content/js/core.js");

/**
 * Get the currently active tab in the focused window
 * @returns {Promise<chrome.tabs.Tab|null>} Tab object or null
 */
async function getCurrentTab() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        return tab || null;
    } catch (error) {
        console.warn('Error getting current tab', error);
        return null;
    }
}

/**
 * Check if a URL is injectable (http(s) and not a browser/system page)
 * @param {string} url 
 * @returns {boolean} True if injectable
 */
function isInjectableUrl(url) {
    if (!url || typeof url !== 'string') return false;
    
    const forbiddenSchemes = ['chrome:', 'edge:', 'about:', 'moz-extension:', 'chrome-extension:', 'devtools:', 'view-source:'];
    if (forbiddenSchemes.some(p => url.startsWith(p))) return false;
    
    // Block extension/addon/webstore sites for parity
    try {
        const parsed = new URL(url);
        const forbiddenHosts = [
            'chrome.google.com',
            'addons.mozilla.org',
            'microsoftedge.microsoft.com'
        ];
        if (
            (parsed.hostname === 'chrome.google.com' && parsed.pathname.startsWith('/webstore')) ||
            (parsed.hostname === 'addons.mozilla.org') ||
            (parsed.hostname === 'microsoftedge.microsoft.com' && parsed.pathname.startsWith('/addons'))
        ) {
            return false;
        }
    } catch (e) {
        // Invalid URL
        return false;
    }

    return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * True if the URL is already handled by a declarative content_scripts entry in
 * the manifest, so the service worker must NOT also inject (it would register
 * the engines twice and double the injected icons).
 * @param {string} url
 * @returns {boolean}
 */
function isCoveredByDeclarative(url) {
    let host;
    try { host = new URL(url).hostname; } catch (e) { return false; }

    const groups = (chrome.runtime.getManifest().content_scripts || []);
    for (const g of groups) {
        for (const pat of (g.matches || [])) {
            // Patterns look like "*://*.imdb.com/*" -> domain "imdb.com"
            const m = pat.match(/:\/\/(?:\*\.)?([^/*]+)\//);
            const domain = m && m[1];
            if (domain && (host === domain || host.endsWith('.' + domain))) return true;
        }
    }
    return false;
}

// Returns one of: 'start' | 'injecting' | 'injected'
async function probeInjection(tabId) {
    try {
        const [res] = await browser.scripting.executeScript({
            target: { tabId },
            func: () => {
                if (window.__servarrInjected === true) return 'injected';
                if (window.__servarrInjecting === true) return 'injecting';
                window.__servarrInjecting = true;
                return 'start';
            }
        });
        return (res && res.result) || 'start';
    } catch (e) {
        await log(['probeInjection failed', e], 'warn');
        return 'start';
    }
}

/**
 * Get settings, set the extension icon and execute the content script
 * @param {number} tabId Tab id
 * @param {string} evt Event name for logging context
 */
async function initRun(tabId, evt) {
    await log(`running init from ${evt} event`);
    try {
        const settings = await getSettings();

        await setIcon(settings);
        await buildMenus(settings);

        // Respect disabled state: don't inject anything when disabled
        if (!settings?.config?.enabled) {
            await log('Extension disabled: skipping injection.');
            return;
        }

        let tab;
        try {
            tab = await chrome.tabs.get(tabId);
        } catch (e) {
            await log(['Failed to resolve tab for injection', e], 'warn');
            return;
        }

        if (!isInjectableUrl(tab?.url)) {
            await log(['Skipping injection for non-injectable URL', tab?.url]);
            return;
        }

        // Integration sites are injected via declarative content_scripts; skip the
        // programmatic path there so engines aren't registered twice.
        if (isCoveredByDeclarative(tab.url)) {
            await log(['Skipping programmatic injection; handled by content_scripts', tab.url]);
            return;
        }

        // probe/lock so we only inject once per page
        const probe = await probeInjection(tabId);
        if (probe !== 'start') {
            await log(`Skipping injection for tab ${tabId}; status=${probe}`);
            return;
        }

        try {
        await browser.scripting.executeScript({
            target: { tabId },
            files: [
                'content/js/jquery.min.js',
                'content/js/browser-polyfill.min.js',
                'content/js/icons.js',
                'content/js/core.js',
                'content/engines/index.js',
                'content/engines/default.js',
                'content/engines/integrations/imdb.js',
                'content/engines/integrations/tmdb.js',
                'content/engines/integrations/tvdb.js',
                'content/engines/integrations/trakt.js',
                'content/engines/integrations/tvmaze.js',
                'content/engines/integrations/musicbrainz.js',
                'content/engines/integrations/letterboxd.js',
                'content/engines/integrations/tvcalendar.js',
                'content/engines/integrations/rottentomatoes.js',
                'content/engines/integrations/metacritic.js',
                'content/engines/integrations/simkl.js',
                'content/engines/integrations/iptorrents.js',
                'content/engines/integrations/lastfm.js',
                'content/engines/integrations/allocine.js',
                'content/engines/integrations/senscritique.js',
                'content/engines/integrations/betaseries.js',
                'content/engines/integrations/primevideo.js',
                'content/engines/integrations/myanimelist.js',
                'content/engines/integrations/rateyourmusic.js',
                'content/engines/integrations/wikipedia.js',
                'content/js/content_script.js'
            ]
        });

        // release lock
        await browser.scripting.executeScript({
            target: { tabId },
            func: () => { window.__servarrInjected = true; delete window.__servarrInjecting; }
        });
        } catch (injectErr) {
            // Injection failed/interrupted (e.g. the service worker was suspended
            // mid-flight). Clear the lock so a later event can retry instead of
            // leaving the page permanently stuck with __servarrInjecting set and
            // no content script.
            try {
                await browser.scripting.executeScript({
                    target: { tabId },
                    func: () => { delete window.__servarrInjecting; }
                });
            } catch (_) { /* tab may have closed/navigated */ }
            throw injectErr;
        }
    } catch (e) {
        await log(e.message, 'error');
    }
}

browser.tabs.onActivated.addListener(async function (activeInfo) {
    if (activeInfo && typeof activeInfo.tabId === 'number') {
        initRun(activeInfo.tabId, 'onActivated');
    }
});

browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    log(['change info status', changeInfo]);

    if (changeInfo.status === 'complete') {
        initRun(tabId, 'onUpdated');
    }
});

browser.runtime.onConnect.addListener(function (port) {
    switch (port.name) {
        case 'init':
            port.onMessage.addListener(async function () {
                const tab = await getCurrentTab();
                if (tab && typeof tab.id === 'number') {
                    await initRun(tab.id, 'onConnect');
                } else {
                    await log('Could not determine current tab id for init run', 'warn');
                }
            });
            break;
        case 'icon':
            port.onMessage.addListener(async function () {
                const settings = await getSettings();
                await setIcon(settings);
            });
            break;
    }
});

// One-shot message listener for init and icon messages
browser.runtime.onMessage.addListener(async (msg, sender) => {
    if (!msg || typeof msg !== 'object') return;

    if (msg.type === 'init') {
        const tabId = sender?.tab?.id ?? (await getCurrentTab())?.id;
        if (typeof tabId === 'number') {
            await initRun(tabId, 'onMessage');
        }
    } else if (msg.type === 'icon') {
        const settings = await getSettings();
        await setIcon(settings);
    }
});

/**
 * Build the browser context menus (grouped by type, parity with Firefox)
 * @param {Setting} settings 
 */
async function buildMenus(settings) {
    await browser.contextMenus?.removeAll();

    if (!browser.contextMenus || !settings?.config?.enabled || !settings?.config?.contextMenu) return;

    const enabledSites = (settings.sites || []).filter(site => site.enabled);
    if (enabledSites.length === 0) return;

    browser.contextMenus.create({ title: 'Search Servarr', id: 'sonarrRadarrLidarr', contexts: ['selection'] });

    function titleType(type) {
        if (!type) return '';
        
        if (type.includes('_')) {
            const [a, b] = type.split('_');
            return `${a.charAt(0).toUpperCase()}${a.slice(1)} (${b.charAt(0).toUpperCase()}${b.slice(1)})`;
        }
        
        return `${type.charAt(0).toUpperCase()}${type.slice(1)}`;
    }

    const groupsByType = enabledSites.reduce((acc, s) => {
        const t = s.type || s.id;
        (acc[t] ||= []).push(s);
        return acc;
    }, {});

    for (const type of Object.keys(groupsByType)) {
        const group = groupsByType[type];
        const typeTitle = titleType(type);
        
        if (group.length > 1) {
            const parentId = `type-${type}`;
            
            browser.contextMenus.create({ title: typeTitle, id: parentId, parentId: 'sonarrRadarrLidarr', contexts: ['selection'] });
            
            for (const site of group) {
                const label = `Search ${site.name || typeTitle}`;
                
                browser.contextMenus.create({ title: label, parentId, id: `${site.id}Menu`, contexts: ['selection'] });
            }
        } else {
            const site = group[0];
            const label = `Search ${site.name || typeTitle}`;
            
            browser.contextMenus.create({ title: label, parentId: 'sonarrRadarrLidarr', id: `${site.id}Menu`, contexts: ['selection'] });
        }
    }
}

/**
 * Context menu click handler
 * @param {object} info 
 * @param {object} tab
 */
async function onClickHandler(info, tab) {
    const settings = await getSettings();

    for (const site of settings.sites || []) {
        if (info.menuItemId === `${site.id}Menu`) {
            await browser.tabs.create({
                url: site.domain.replace(/\/$/, '') + site.searchPath + encodeURIComponent(info.selectionText).replace(/\./g, ' ')
            });
        }
    }
}
browser.contextMenus?.onClicked.addListener(onClickHandler);

/** set up context menu tree at install time. */
browser.runtime.onInstalled.addListener(async function () {
    const settings = await getSettings();
    buildMenus(settings);
});

/** Rebuild menus on storage changes affecting settings. */
browser.storage.onChanged.addListener(async (changes, area) => {
    if (!Object.prototype.hasOwnProperty.call(changes, 'sonarrRadarrLidarrAutosearchSettings')) return;

    try {
        const newSettings = changes.sonarrRadarrLidarrAutosearchSettings.newValue;
        await buildMenus(newSettings);
    } catch (e) {
        await log(['Failed rebuilding context menus from storage change', e], 'error');
    }
});

/** 
 * Set the extension icon 
 * @param {Setting} settings
 */
async function setIcon(settings) {
    const img = `content/assets/images/SonarrRadarrLidarr${(settings?.config?.enabled ? '' : '-faded')}16.png`;
    await browser.action.setIcon({ path: img });
};

// background/event page

// Change these to whatever you want to open
const WELCOME_URL = 'options.html#/welcome';
//const UPDATED_URL = 'options.html#/updated';

// Only open on new versions we haven't shown yet
browser.runtime.onInstalled.addListener(async (details) => {
    const thisVersion = browser.runtime.getManifest().version;
    //const { lastSeenVersion } = await browser.storage.local.get('lastSeenVersion');

    if (details.reason === 'install') {
        await browser.tabs.create({ url: browser.runtime.getURL(WELCOME_URL) });
        await browser.storage.local.set({ lastSeenVersion: thisVersion });
        return;
    }

    // if (details.reason === 'update') {
    //     // don't re-open if we've already shown for this version
    //     if (lastSeenVersion === thisVersion || thisVersion.startsWith('3.0.0')) return;

    //     await browser.tabs.create({ url: browser.runtime.getURL(UPDATED_URL) });
    //     await browser.storage.local.set({ lastSeenVersion: thisVersion });
    // }
});
