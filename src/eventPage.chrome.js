importScripts("./content/js/browser-polyfill.min.js");
importScripts("./content/js/core.js");

async function getCurrentTab() {
    try {
        let queryOptions = { active: true, lastFocusedWindow: true };
    
        let [tab] = await chrome.tabs.query(queryOptions);
    
        return tab;
    } catch (error) {
        console.warn('Error getting current tab', error);

        return null;
    }
}

function isInjectableUrl(url) {
    if (!url || typeof url !== 'string') return false;
    // Disallow internal and restricted schemes/domains
    const forbiddenSchemes = ['chrome:', 'edge:', 'about:', 'moz-extension:', 'chrome-extension:', 'devtools:', 'view-source:'];
    if (forbiddenSchemes.some(p => url.startsWith(p))) return false;
    // Chrome Web Store and extension pages are non-injectable
    if (url.startsWith('https://chrome.google.com/webstore')) return false;
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

        log('current tab', tabId);

        await setIcon(settings);
        await buildMenus(settings);
        // Guard: only inject into injectable URLs
        try {
            const tab = await chrome.tabs.get(tabId);
            if (!isInjectableUrl(tab && tab.url)) {
                await log(['Skipping injection for non-injectable URL', tab && tab.url]);
                return;
            }
        } catch (e) {
            await log(['Failed to resolve tab for injection', e], 'warn');
            return;
        }
        await browser.scripting.executeScript({ 
            target: {
                tabId: tabId
            },
            files: [
                'content/js/browser-polyfill.min.js',
                'content/js/icons.js',
                'content/js/content_script.js'
            ] 
        });
    }
    catch(e) {
        await log(e.message, 'error');
    }
}

browser.tabs.onActivated.addListener(async function (activeInfo) {
    initRun(activeInfo.tabId, 'onActivated')
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
                let tab = await getCurrentTab();
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
    await browser.contextMenus.removeAll();

    // if extension is disabled or context menu option is disabled gtfo
    if (!settings.config.enabled || !settings.config.contextMenu) {
        return;
    }

    let enabledSites = settings.sites.filter(site => { return site.enabled; });

    // if no sites are enabled gtfo
    if (enabledSites.length === 0) {
        return;
    }

    // create parent menu
    browser.contextMenus.create({ "title": "Search Servarr", "id": "sonarrRadarrLidarr", "contexts": ["selection"] });

    // create child menus from enabled sites array
    for (let i = 0; i < enabledSites.length; i++) {
        browser.contextMenus.create({ "title": enabledSites[i].menuText, "parentId": "sonarrRadarrLidarr", "id": `${enabledSites[i].id}Menu`, "contexts": ["selection"] });
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

browser.contextMenus.onClicked.addListener(onClickHandler);

/**
 * set up context menu tree at install time.
 */
browser.runtime.onInstalled.addListener(async function () {
    const settings = await getSettings();

    buildMenus(settings);
});

// Listen for storage changes affecting context menu so updates apply immediately without requiring tab events.
browser.storage.onChanged.addListener(async (changes, area) => {
    if (!changes.hasOwnProperty('sonarrRadarrLidarrAutosearchSettings')) return;
    try {
        const newSettings = changes.sonarrRadarrLidarrAutosearchSettings.newValue;
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

    await browser.action.setIcon({ path: img });
};
