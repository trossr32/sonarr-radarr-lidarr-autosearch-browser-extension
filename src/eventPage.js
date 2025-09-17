// Firefox MV2 background script

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
    const forbiddenSchemes = ['chrome:', 'edge:', 'about:', 'moz-extension:', 'chrome-extension:', 'devtools:', 'view-source:'];
    if (forbiddenSchemes.some(p => url.startsWith(p))) return false;
    // Block both stores for parity
    if (url.startsWith('https://addons.mozilla.org')) return false;
    if (url.startsWith('https://chrome.google.com/webstore')) return false;
    return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Get settings, set the extension icon and execute the content script
 */
async function initRun(tabOrId, evt) {
   await log(`running init from ${evt} event`);
   try {
        const settings = await getSettings();

        await setIcon(settings);
        await buildMenus(settings);

        if (!settings?.config?.enabled) {
            await log('Extension disabled: skipping injection.');
            return;
        }

        // Use provided Tab object when available; fall back to tabs.get
        let tab = (tabOrId && typeof tabOrId === 'object') ? tabOrId : null;
        if (!tab) {
            try {
                tab = await browser.tabs.get(tabOrId);
            } catch (e) {
                await log(['Failed to resolve tab for injection', e], 'warn');
                return;
            }
        }

        if (!isInjectableUrl(tab?.url)) {
            await log(['Skipping injection for non-injectable URL', tab?.url]);
            return;
        }

        // Explicitly target the tab
        await browser.tabs.executeScript(tab.id, { file: 'content/js/browser-polyfill.min.js' });
        await browser.tabs.executeScript(tab.id, { file: 'content/js/icons.js' });
        await browser.tabs.executeScript(tab.id, { file: 'content/js/content_script.js' });
   } catch (e) {
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
    if (changeInfo.status === 'complete') {
        initRun(tab, 'onUpdated');
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

// Support one-shot message listener for init and icon messages 
browser.runtime.onMessage.addListener(async (msg, sender) => {
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'init') {
        if (sender?.tab) {
            await initRun(sender.tab, 'onMessage'); // pass full tab
        } else {
            const tab = await getCurrentTab();
            if (tab?.id) await initRun(tab, 'onMessage');
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

/** Set the extension icon */
async function setIcon(settings) {
    const img = `content/assets/images/SonarrRadarrLidarr${(settings?.config?.enabled ? '' : '-faded')}16.png`;
    await browser.browserAction.setIcon({ path: img });
};
