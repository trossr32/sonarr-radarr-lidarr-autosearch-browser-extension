/**
 * Attempts to find a jQuery element using the supplied selector every n milliseconds 
 * (defined by waitForMs param) until found or the max number of attempts is reached.
 * Wait interval and max attempts are defined in settings.
 * @param {string} selector - jQuery selector
 * @param {function} callback - callback function
 * @param {int32} maxAttempts - max attempts
 * @param {int32} waitForMs - time in ms to wait between attempts
 * @param {int32} count - attempt iterator
 */
var waitForEl = function(selector, callback, maxAttempts, waitForMs, count) {
    if (!count || count === 0) {
        log('waiting for search input element to be available...');
    }    

    if ($(selector).length) {
        if (!count || count === 0) {
            log('found search input without any retry attempts');
        } else {
            log(`took ${count * waitForMs} ms for the search input to be found`);
        }

        callback();
    } else {     
        setTimeout(function() {
            if (!count) {
                count = 0;
            }

            count++;
            
            if (count < maxAttempts) {
                waitForEl(selector, callback, maxAttempts, waitForMs, count);
            } else {
                log('Failed to find the input search element. Try refreshing the page or increasing the wait time in the debug settings. If neither of these work the jQuery selectors for the search input element may be incorrect.', 'error');

                return;
            }
        }, waitForMs);
    }
};

/**
 * gets a value from an element based on the supplied selector
 * @param {any} el - jQuery element
 * @param {string} selector - selector type
 * @returns {string}
 */
var getElementValue = function(el, selector) {
    switch (selector) {
        case 'text':
            return el.text();
            
        default: // attribute
            return el.attr(selector);
    }
};

/**
 * Convert string to title case
 * @param {string} s - string to convert
 * @param {boolean} removeUnderscore - whether to replace underscore
 * @returns {string} - converted string
 */
var title = (s, removeUnderscore) => {
    if (s.indexOf('_') > 0 && removeUnderscore) {
        let split = s.split('_');

        s = `${split[0]} (${split[1]})`;
    }

    return s.replace(/(^|\s)\S/g, (t) => t.toUpperCase());
};

/**
 * Add/update the floating/anchored custom icon row and inject one clickable icon
 * for the given site instance.
 * Uses siteIconConfig to pick the correct image and siteId to keep classes/IDs unique.
 * Multiple calls simply append another <a> into the same row with a small gap.
 * @param {InjectedIconConfig} injectedIconConfig
 * @param {SiteSetting} site
 * @param {string} linkHref
 */
function addCustomIconMarkup(injectedIconConfig, site, linkHref) {
    const isAnchored = injectedIconConfig.type === 'anchored';
    const side = injectedIconConfig.side;                 // 'left' | 'right'
    const sideOffset = injectedIconConfig.sideOffset;     // '12px' | '12%'
    const pos = injectedIconConfig.position;              // 'top' | 'bottom'
    const posOffset = injectedIconConfig.positionOffset;  // '12px' | '12%'

    // Base style only once (generic, no per-site background rules)
    if (!document.getElementById('servarr-ext_custom-icon-style')) {
        const base = document.createElement('style');
        base.id = 'servarr-ext_custom-icon-style';
        base.textContent = `
/* Positioned click-row that holds N anchors side-by-side */
#servarr-ext_custom-icon-row {
  position: absolute;
  height: 52px;
  display: inline-flex;
  align-items: center;
  z-index: 9999999;
}

/* Floating vs anchored look & feel */
.servarr-ext_floating-icon #servarr-ext_custom-icon-row {
  border-radius: 50px;
}
.servarr-ext_anchored-icon #servarr-ext_custom-icon-row {
  padding: 0 0 0 15px;
}
.servarr-ext_anchored-left-icon #servarr-ext_custom-icon-row  { left: 0;  border-radius: 0 50px 50px 0; }
.servarr-ext_anchored-right-icon #servarr-ext_custom-icon-row { right: 0; border-radius: 50px 0 0 50px; }

/* Per-anchor sizing */
#servarr-ext_custom-icon-row > a {
  width: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

/* Icon image box */
#servarr-ext_custom-icon-row .servarr-ext_icon-image {
  width: 40px;
  height: 40px;
  background-size: 40px 40px;
  background-repeat: no-repeat;
}
`;
        document.head.appendChild(base);
    }

    // Create wrapper and row once
    let $wrapper = $('#servarr-ext_custom-icon-wrapper');
    if (!$wrapper.length) {
        const anchoredSideClass = isAnchored ? `servarr-ext_anchored-${side}-icon` : '';
        $('body').prepend(`
<div id="servarr-ext_custom-icon-wrapper"
     class="servarr-ext_icon servarr-ext_${injectedIconConfig.type}-icon ${anchoredSideClass}">
  <div id="servarr-ext_custom-icon-row"></div>
</div>`);
        $wrapper = $('#servarr-ext_custom-icon-wrapper');
    }

    // Keep row styled/positioned from latest config
    const $row = $('#servarr-ext_custom-icon-row');
    $row.css({
        backgroundColor: injectedIconConfig.backgroundColor,
        // vertical position, match previous anchored offset behaviour
        [pos]: isAnchored ? `calc(${posOffset} ${pos === 'top' ? '+' : '-'} 57px)` : posOffset,
        // horizontal position, anchored row hugs left/right via wrapper class
        ...(isAnchored ? {} : { [side]: sideOffset })
    });

    // Append one clickable icon for this specific site instance if not already present
    if (!$row.find(`.servarr-ext_anchor-${site.id}`).length) {
        const iconUrl = getIconAsDataUri(site.icon.type, site.icon.fg, site.icon.bg);
        const $a = $(`<a href="${linkHref}" target="_blank" rel="noopener" class="servarr-ext_anchor-${site.id}" data-servarr-icon="true" title="Search ${site.name}"></a>`);
        $a.append(
            $(`<div class="servarr-ext_icon-image" style="background-image:url('${iconUrl}')"></div>`)
        );
        $row.append($a);
    }
}

/**
 * Detect Servarr instance pages and auto-fill the search input,
 * using the original logic with minimal changes.
 * Runs independently of third-party “engine” injections.
 */
async function runServarrSearchInjection() {
    try {
        const settings = await getSettings();
        if (!settings || !settings.config || !settings.config.enabled) return;

        // Optional: prevent double-run on SPA reloads
        if (window.__servarrSearchInjected) return;
        window.__servarrSearchInjected = true;

        log(['settings.sites: ', settings.sites]);

        $.each(settings.sites, function (i, site) {
            try {
                if (!site || !site.enabled || !site.domain || !site.searchPath || !site.searchInputSelector) return;

                // Remove basic-auth creds from domain (https://user:pass@host -> https://host)
                const domain = (site.domain || '').replace(/^(https?:\/\/)(.+):(.+)@/, '$1');

                // Only proceed if we are on a Servarr domain page
                if (!domain || window.location.href.indexOf(domain) === -1) return;

                log(['servarr site match found: ', site]);

                // Must be on the site’s search path
                if (window.location.href.indexOf(site.searchPath) === -1) return;

                // Extract the trailing part after the last slash, then strip the path prefix characters
                let search = window.location.href.replace(/(.+\/)/g, '');
                const sdef = (site.searchPath || '').replace(/(\/)/g, '');
                search = search.replace(sdef, '');

                if (search && search.trim() !== '') {
                    // Wait for the configured search input and type into it
                    waitForEl(
                        site.searchInputSelector,
                        function () {
                            // jQuery selector, then take the DOM node
                            const searchInput = $(site.searchInputSelector)[0];
                            if (!searchInput) return;

                            // Fill value and trigger native 'input' so the app reacts
                            searchInput.value = decodeURIComponent(search.trim());

                            const event = document.createEvent('Event');
                            event.initEvent('input', true, true);
                            searchInput.dispatchEvent(event);

                            log(['Injected Servarr search term into input: ', searchInput.value]);
                        },
                        settings.config.searchInputMaxAttempts,
                        settings.config.searchInputWaitForMs
                    );
                }
            } catch (e) {
                log(['Servarr search injection error for site', site, e], 'error');
            }
        });
    } catch (e) {
        log(['Servarr search injection failed', e], 'error');
    }
}

// URL change detection for SPA navigation
let currentUrl = window.location.href;
let urlChangeCheckInterval = null;
let activeSpaConfig = null; // Store the active SPA configuration

/**
 * Starts monitoring URL changes for SPA navigation based on the provided configuration.
 * @param {DefaultEngineConfig} engine - The engine object containing spa config and deferMs
 * @param {SiteSetting[]} sites - The list of enabled site settings for this engine
 */
function startUrlChangeDetection(engine, sites) {
    // Clear any existing interval
    if (urlChangeCheckInterval) {
        clearInterval(urlChangeCheckInterval);
    }
    
    activeSpaConfig = engine.spa;
    const checkInterval = (engine.spa && engine.spa.urlCheckIntervalMs) || 500;
    
    const setupUrlMonitoring = () => {
        // Check for URL changes
        urlChangeCheckInterval = setInterval(async () => {
            const newUrl = window.location.href;
            if (newUrl !== currentUrl) {
                log(`URL changed from ${currentUrl} to ${newUrl} - re-running engines`);
                currentUrl = newUrl;
                
                // Check if we're still on a domain that needs SPA detection
                const stillOnSpaDomain = engine.spa && engine.spa.domains && 
                    engine.spa.domains.some(domain => newUrl.includes(domain));
                
                if (!stillOnSpaDomain) {
                    log('Navigated away from SPA domain - stopping URL change detection');
                    stopUrlChangeDetection();
                    return;
                }
                
                // Clear previous injection markers to allow re-injection on new pages
                document.querySelectorAll('[data-servarr-icon]').forEach(el => {
                    el.remove();
                });
                
                // Remove any existing custom icon wrapper
                const customWrapper = document.getElementById('servarr-ext_custom-icon-wrapper');
                if (customWrapper) {
                    customWrapper.remove();
                }
                
                // Clear per-site completion markers on all elements
                sites.forEach(function (site) {
                    document.querySelectorAll(`[data-servarr-ext-${site.id}-completed]`).forEach(el => {
                        el.removeAttribute(`data-servarr-ext-${site.id}-completed`);
                    });
                });
                
                // Defer re-running engines if deferMs is set, otherwise run immediately
                if (engine.deferMs && engine.deferMs > 0) {
                    log(`Deferring engine execution by ${engine.deferMs}ms to allow page rendering`);
                    setTimeout(() => {
                        runEngines();
                    }, engine.deferMs);
                } else {
                    runEngines();
                }
            }
        }, checkInterval);
    };

    setupUrlMonitoring();
}

/**
 * Stops URL change detection for SPA navigation.
 */
function stopUrlChangeDetection() {
    if (urlChangeCheckInterval) {
        clearInterval(urlChangeCheckInterval);
        urlChangeCheckInterval = null;
    }
}

/**
 * Runs the active search engines.
 * @returns {Promise<void>}
 */
async function runEngines() {
    try {
        const settings = await getSettings();
        if (!settings || !settings.config || !settings.config.enabled) return;

        const url = window.location.href;

        // Figure out which integration IDs are enabled in user settings
        // Expecting: settings.integrations = [{ id: 'imdb', enabled: true }, ...]
        const enabledIds = new Set(
            (settings.integrations || [])
            .filter(it => it && it.id && it.enabled === true)
            .map(it => it.id)
        );

        // Start from all registered engines…
        const allEngines = (window.__servarrEngines && window.__servarrEngines.list) ? window.__servarrEngines.list : [];

        // Build a flat list of engine ids, then dedupe
        const allIds = (allEngines || [])
            .map(e => e && e.id)
            .filter(Boolean);

        const uniqueEngineIds = Array.from(new Set(allIds));

        // Intersections & diffs vs user settings
        const enabledUniqueIds = uniqueEngineIds.filter(id => enabledIds.has(id));
        const missingFromRegistry = Array.from(enabledIds).filter(id => !uniqueEngineIds.includes(id));
        const presentButDisabled = uniqueEngineIds.filter(id => !enabledIds.has(id));

        // Logs
        log(`Engines: ${allEngines.length} instances, ${uniqueEngineIds.length} unique ids.`);
        log(`Enabled in settings: ${enabledIds.size} → [${Array.from(enabledIds).join(', ')}]`);
        log(`Enabled & present: ${enabledUniqueIds.length} → [${enabledUniqueIds.join(', ')}]`);
        if (missingFromRegistry.length) log(`Enabled but no engine registered: [${missingFromRegistry.join(', ')}]`);
        if (presentButDisabled.length) log(`Registered but disabled in settings: [${presentButDisabled.join(', ')}]`);

        // Only run engines that are enabled in settings
        const enginesToRun = allEngines.filter(e => e && enabledIds.has(e.id));
        log(`Will run ${enginesToRun.length} engine instance(s) across ${enabledUniqueIds.length} enabled id(s).`);
        
        // then keep only the enabled ones.
        // If the user has *no* integration settings yet, run all engines so we don't silently disable everything.
        const engines = enabledIds.size > 0 ? allEngines.filter(e => e && enabledIds.has(e.id)) : allEngines;

        log(`Found ${engines.length} matching engines for current URL`);

        if (!engines.length) {
            if (typeof log === 'function') log('No enabled engines registered');
            return;
        }

        const runEngine = function (candidates, sites, settingsObj) {
            candidates.elements.forEach(function (el) {
                if (!el || (el.hasAttribute && el.hasAttribute('data-servarr-icon'))) return;

                const term = (candidates.getSearch(el) || '').trim();
                if (!term) return;

                sites.forEach(function (site) {
                    const perSiteAttr = `data-servarr-ext-${site.id}-completed`;
                    if (el.getAttribute && el.getAttribute(perSiteAttr)) return;

                    const base = (site.domain || '').replace(/\/$/, '');
                    const path = (site.searchPath || '');
                    const link = base + path + encodeURIComponent(term).replace(/%3A/g, ':');

                    try {
                        // custom floating/anchored vs inline
                        const useCustomIcon = !!settingsObj.config.customIconPosition && candidates.elements.length <= 1;

                        if (useCustomIcon) {
                            addCustomIconMarkup(settingsObj.injectedIconConfig, site, link);
                        } else {
                            candidates.insert({ el, link, site, styles: null });
                        }
                        
                        if (el.setAttribute) el.setAttribute(perSiteAttr, 'true');
                    } catch (e) {
                        if (typeof log === 'function') log(['injection failed', e], 'error');
                    }
                });
            });
        };

        // Check for SPA engines that should start URL monitoring based on domain match
        // This happens before the normal engine matching to catch domain-level SPA detection
        let spaEngineToMonitor = null;
        
        for (let i = 0; i < engines.length; i++) {
            const engine = engines[i];
            
            // Check if this engine has SPA configuration and we're on a matching domain
            if (engine && engine.spa && engine.spa.domains) {
                const isOnSpaDomain = engine.spa.domains.some(domain => url.includes(domain));
                if (isOnSpaDomain && enabledIds.has(engine.id)) {
                    spaEngineToMonitor = engine;
                    break; // Use the first matching SPA engine
                }
            }
        }
        
        // Start URL change detection if we found a SPA engine for this domain
        if (spaEngineToMonitor && !urlChangeCheckInterval) {
            log(`Starting URL change detection for SPA domain using engine: ${spaEngineToMonitor.id}`);

            const sites = (settings.sites || []).filter(s => s && s.enabled);

            if (spaEngineToMonitor.deferMs && spaEngineToMonitor.deferMs > 0) {
                setTimeout(function () { startUrlChangeDetection(spaEngineToMonitor, sites); }, spaEngineToMonitor.deferMs);
            } else {
                startUrlChangeDetection(spaEngineToMonitor, sites);
            }
        }

        // Normal engine loop
        for (let i = 0; i < engines.length; i++) {
            const engine = engines[i];
            
            if (!engine || typeof engine.match !== 'function' || !engine.match(document, url)) continue;

            const candidates = engine.candidates({ settings, url, document });
            if (!candidates || !candidates.siteType || !candidates.elements || !candidates.getSearch || !candidates.insert) continue;

            // Enabled instances for this site type
            const sites = (settings.sites || []).filter(s => s && s.enabled && s.type === candidates.siteType);
            if (!sites.length) continue;

            if (engine.deferMs && engine.deferMs > 0) {
                setTimeout(function () { runEngine(candidates, sites, settings); }, engine.deferMs);
            } else {
                runEngine(candidates, sites, settings);
            }
        }
    } catch (e) {
        if (typeof log === 'function') log(['engine run failed', e], 'error');
    }
}

(function () {
    runServarrSearchInjection();

    runEngines();
    
    // Cleanup URL change detection when page unloads
    window.addEventListener('beforeunload', () => {
        stopUrlChangeDetection();
    });
})();