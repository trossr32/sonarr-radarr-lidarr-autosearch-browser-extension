async function getCurrentTab() {
    try {
        const [tab] = await browser.tabs.query({ active: true, lastFocusedWindow: true });
        return tab || null;
    } catch (e) {
        await log(['Error getting current tab', e], 'warn');
        return null;
    }
}

// Determine if the URL is eligible for content script injection
function isInjectableUrl(url) {
    if (!url || typeof url !== 'string') return false;
    // Disallow internal and restricted schemes/domains
    const forbiddenSchemes = ['chrome:', 'edge:', 'about:', 'moz-extension:', 'chrome-extension:', 'devtools:', 'view-source:'];
    if (forbiddenSchemes.some(p => url.startsWith(p))) return false;
    // Firefox Add-ons and extension pages are non-injectable
    if (url.startsWith('https://addons.mozilla.org')) return false;
    // Only inject into http/https pages here
    if (url.startsWith('http://') || url.startsWith('https://')) return true;
    return false;
}

/**
 * Get settings, set the extension icon and execute the content script
 */
async function initRun(tabId, evt) {
    await log(`running init from ${evt} event`);
    
    try {
        const settings = await getSettings();

        await setIcon(settings);
        await buildMenus(settings);
        // Guard: only inject into injectable URLs
        try {
            const tab = await browser.tabs.get(tabId);
            if (!isInjectableUrl(tab && tab.url)) {
                await log(['Skipping injection for non-injectable URL', tab && tab.url]);
                return;
            }
        } catch (e) {
            await log(['Failed to resolve tab for injection', e], 'warn');
            return;
        }
        // Explicitly target the tab to avoid implicit/ambiguous injection target
        await browser.tabs.executeScript(tabId, { file: 'content/js/browser-polyfill.min.js' });
        await browser.tabs.executeScript(tabId, { file: 'content/js/icons.js' });
        await browser.tabs.executeScript(tabId, { file: 'content/js/content_script.js' });
    }
    catch(e) {
        await log(e.message, 'error');
    }
}

browser.tabs.onActivated.addListener(function (activeInfo) {
    if (activeInfo && typeof activeInfo.tabId === 'number') {
        initRun(activeInfo.tabId, 'onActivated');
    }
});

browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    log(['change info status', changeInfo]);

    if (changeInfo.status == 'complete') {
        initRun(tabId, 'onUpdated')
    }
});

browser.runtime.onConnect.addListener(function(port) {
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
            port.onMessage.addListener(async function (request) {
                const settings = await getSettings();
                
                await setIcon(settings);
            });
            break;
    }
});

/**
 * Build the browser context menus
 * @param {Settings} settings 
 */
async function buildMenus(settings) {
    // clear all before we decide to gtfo or not
    await browser.contextMenus?.removeAll();

    // if unavailable, extension is disabled or context menu option is disabled gtfo
    if (!browser.contextMenus || !settings.config.enabled || !settings.config.contextMenu) {
        return;
    }

    let enabledSites = settings.sites.filter(site => { return site.enabled; });

    // if no sites are enabled gtfo
    if (enabledSites.length === 0) {
        return;
    }

    // create parent menu
    browser.contextMenus.create({ "title": "Search Servarr", "id": "sonarrRadarrLidarr", "contexts": ["selection"] });

    // Helper: format a type id like 'readarr_ebook' => 'Readarr (Ebook)'
    function titleType(type) {
        if (!type) return '';
        if (type.indexOf('_') > -1) {
            const parts = type.split('_');
            return parts[0].charAt(0).toUpperCase() + parts[0].slice(1) + ' (' + (parts[1].charAt(0).toUpperCase() + parts[1].slice(1)) + ')';
        }
        return type.charAt(0).toUpperCase() + type.slice(1);
    }

    // Group enabled sites by type so multiple instances of the same type are nested
    const groupsByType = enabledSites.reduce((acc, s) => {
        const t = s.type || s.id;
        acc[t] = acc[t] || [];
        acc[t].push(s);
        return acc;
    }, {});

    for (const type of Object.keys(groupsByType)) {
        const group = groupsByType[type];
        const typeTitle = titleType(type);
        if (group.length > 1) {
            // Create a submenu for the type
            const parentId = `type-${type}`;
            browser.contextMenus.create({ title: typeTitle, id: parentId, parentId: 'sonarrRadarrLidarr', contexts: ['selection'] });
            // Add each instance under the type submenu, labelled with its instance name
            for (const site of group) {
                const label = `Search ${site.name || typeTitle}`;
                browser.contextMenus.create({ title: label, parentId, id: `${site.id}Menu`, contexts: ['selection'] });
            }
        } else {
            // Single instance for this type: add directly under the root
            const site = group[0];
            const label = `Search ${site.name || typeTitle}`;
            browser.contextMenus.create({ title: label, parentId: 'sonarrRadarrLidarr', id: `${site.id}Menu`, contexts: ['selection'] });
        }
    }
}

/**
 * Context menu click handler
 * @param {*} info 
 * @param {*} tab 
 */
async function onClickHandler(info, tab) {
    const settings = await getSettings();

    for (let i = 0; i < settings.sites.length; i++) {
        if (info.menuItemId == (`${settings.sites[i].id}Menu`)) {
            await browser.tabs.create({
                'url': settings.sites[i].domain.replace(/\/$/, '') + settings.sites[i].searchPath + encodeURIComponent(info.selectionText).replace(/\./g, ' ')
            });
        }
    }
};

browser.contextMenus?.onClicked.addListener(onClickHandler);

/**
 * set up context menu tree at install time.
 */
browser.runtime.onInstalled.addListener(async function () {
    const settings = await getSettings();

    buildMenus(settings);
});

/**
 * Listen for storage changes affecting context menu so updates apply immediately without requiring tab events.
 */
browser.storage.onChanged.addListener(async (changes, area) => {
    if (!changes.hasOwnProperty('sonarrRadarrLidarrAutosearchSettings')) return;
    try {
        const newSettings = changes.sonarrRadarrLidarrAutosearchSettings.newValue;
        // Rebuild context menus when enabled / contextMenu flags or site enablement changes.
        await buildMenus(newSettings);
    } catch (e) {
        await log(['Failed rebuilding context menus from storage change', e], 'error');
    }
});

/**
 * Set the extension icon
 * @param {Settings} settings 
 */
async function setIcon(settings) {
    let img = `content/assets/images/SonarrRadarrLidarr${(settings.config.enabled ? '' : '-faded')}16.png`;

    await browser.browserAction.setIcon({ path: img });
};
