// ---------- Host permission helpers ----------
function getRt() {
  // Prefer native chrome.* in Chromium to avoid polyfill arity issues
  if (typeof chrome !== 'undefined' &&
      chrome &&
      chrome.permissions &&
      typeof chrome.permissions.request === 'function') {
    return chrome; // callback-style API
  }
  if (typeof browser !== 'undefined' && browser) {
    return browser; // promise-style API (Firefox / polyfill)
  }
  return null;
}

/**
 * Build an origin pattern from a user-entered domain.
 * Requires a valid scheme in the domain (no http/https fallback here).
 * @returns {string|null} like "https://example.com/*"
 */
function parseOriginFromDomain(domain) {
    try {
        const u = new URL(String(domain || ''));
        // Host permissions pattern: scheme + host + /*
        return `${u.protocol}//${u.hostname}/*`;
    } catch (_) {
        return null; // invalid or missing scheme
    }
}

/** Check if we already hold host permission for the given origin pattern. */
function containsHostPermission(originPattern) {
    const rt = getRt();
    if (!rt || !originPattern) return Promise.resolve(false);

    const req = { origins: [originPattern] };

    return new Promise((res) => {
        try {
            // Chrome callback API
            if (rt === chrome) {
                chrome.permissions.contains(req, ok => res(Boolean(ok)));
                return;
            }
            // Firefox / Promise API
            rt.permissions.contains(req).then(x => res(!!x)).catch(() => {
                log(['Failed to request host permission', e], 'error');
                res(false);
            });
        } catch (_) {
            res(false);
        }
    });
}

/** Request host permission for the given origin pattern. Must be called from a user gesture. */
function requestHostPermission(originPattern) {
    const rt = getRt();
    if (!rt || !originPattern) return Promise.resolve(false);

    const req = { origins: [originPattern] };

    return new Promise((res) => {
        try {
            // Must be invoked from a user gesture
            if (rt === chrome) {
                chrome.permissions.request(req, granted => res(Boolean(granted)));
                return;
            }

            rt.permissions.request(req).then(x => res(!!x)).catch(() => {        
                log(['Failed to request host permission', e], 'error');
            
                res(false);
            });
        } catch (e) {
            log(['Failed to request host permission', e], 'error');
            
            res(false);
        }
    });
}


// Small debounce helper for per-site domain checks
const __permTimers = {};
function debounceUpdatePerm(siteId, fn, ms) {
    if (__permTimers[siteId]) clearTimeout(__permTimers[siteId]);
    __permTimers[siteId] = setTimeout(fn, ms || 400);
}

/**
 * Build the settings tab
 * @param {Setting} settings
 */
var initialiseBasicForm = function (settings) {
    // Clean up any existing Spectrum instances from previous render
    $('input[id$="IconFg"], input[id$="IconBg"]').each(function(){ destroySpectrum($(this)); });
    $('.sp-container').remove(); // remove any stray containers

    const wrapper = $('<div class="grid gap-6 md:grid-cols-2"></div>');

    // Add instance + Show/Hide advanced
    window.__showAdvancedInSettings = Boolean(window.__showAdvancedInSettings);

    const addBtnRow = $('<div class="md:col-span-2 flex justify-end gap-2"></div>')
        .append($('<button type="button" id="btnToggleAdvanced" class="inline-flex items-center gap-2 rounded-md bg-indigo-600 hover:bg-indigo-500 cursor-pointer text-white text-xs font-medium px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-600"></button>')
            .append($('<i class="fa-solid fa-cogs"></i>'))
            .append($('<span id="btnToggleAdvancedLabel"></span>'))
            .on('click', function(){
                window.__showAdvancedInSettings = !window.__showAdvancedInSettings;
                updateAdvancedVisibility();
            })
        )
        .append($('<button type="button" id="btnAddInstance" class="inline-flex items-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-500 cursor-pointer text-white text-xs font-medium px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"></button>')
             .append($('<i class="fa-solid fa-plus"></i>'))
             .append($('<span>Add instance</span>')));

     wrapper.append(addBtnRow);

    /**
     * Renders a card for a site configuration.
     * @param {SiteSetting} site 
     */
    function renderSiteCard(site) {
        const card = $('<div class="rounded-lg bg-white/5 border border-slate-700 shadow overflow-hidden flex flex-col"></div>');

        // ---------- HEADER ----------
        const header = $('<div class="flex items-center justify-between gap-4 px-4 py-3 border-b border-slate-700"></div>');
        const $nameInput = $(
            `<input type="text" id="${site.id}Name" data-site-id="${site.id}" placeholder="Display name" class="rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-40 disabled:cursor-not-allowed" />`
        ).val(site.name || title(site.type, true));
        const left = $('<div class="flex items-center gap-3"></div>')
            .append($(`<span id="${site.id}HeaderIcon" class="inline-flex h-8 w-8 items-center justify-center"></span>`)
                .append($(getIconFromSiteIconConfig(site.icon, 'width:32px;height:32px;', 'icon h-8 w-8'))))
            .append($nameInput);

        const right = $('<div class="flex items-center gap-2 ml-auto"></div>');
        const $siteEnabledInput = $(`<input type="checkbox" id="toggle-${site.id}" data-site-id="${site.id}" class="disabled:cursor-not-allowed">`).prop('checked', site.enabled);
        const toggleWrap = $('<div class="flex-shrink-0"></div>').append($siteEnabledInput);
        const delBtn = $(
            `<button type="button" class="inline-flex items-center justify-center h-7 w-7 rounded bg-slate-700 hover:bg-slate-600 text-white text-xs cursor-pointer" title="Remove">
                <i class="fa-solid fa-trash text-xs"></i>
            </button>`
        ).on('click', async function(){ await removeSite(site.id); });
        // Permission grant button
        const $grantBtn = $(
            `<button type="button" id="${site.id}PermGrant" class="hidden items-center gap-1 h-7 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs cursor-pointer px-2 py-0.5"
                title="Grant host permission">Grant</button>`
        );

        $grantBtn.on('click', async function () {
            // Must be a user gesture
            const origin = $(this).data('origin') || parseOriginFromDomain(($(`#${site.id}Domain`).val() || '').trim());
            
            if (!origin) { 
                // origin invalid; chip already shows why
                return; 
            }
            
            const granted = await requestHostPermission(origin);

            if (granted) {
                await updatePermissionChips();
            } else {
                await updatePermissionChip(site.id);
            }
        });

        right.append(toggleWrap, $grantBtn, delBtn);
        header.append(left, right);

        // Body - Basic settings
        const body = $(`<div class="relative p-4 space-y-5"></div>`);

        const $typeSelect = $(`<select id="${site.id}Type" data-site-id="${site.id}" class="w-full rounded-md border border-slate-600 bg-slate-800 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"></select>`)
            .append(`<option value="sonarr" ${site.type==='sonarr'?'selected':''}>Sonarr</option>`)
            .append(`<option value="radarr" ${site.type==='radarr'?'selected':''}>Radarr</option>`)
            .append(`<option value="lidarr" ${site.type==='lidarr'?'selected':''}>Lidarr</option>`)
            .append(`<option value="readarr_ebook" ${site.type==='readarr_ebook'?'selected':''}>Readarr (ebook)</option>`)
            .append(`<option value="readarr_audiobook" ${site.type==='readarr_audiobook'?'selected':''}>Readarr (audiobook)</option>`);

        const $domainInput = $(
            `<input type="text" id="${site.id}Domain" placeholder="http://192.168.0.1:7357" data-site-id="${site.id}" class="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed" />`
        ).val(site.domain);

        // Permission chip
        const $permChip = $(`<span id="${site.id}PermChip" class="rounded-full px-2 text-xxs font-medium select-none bg-slate-600 text-white shrink" title="Host permission status">Permission unknown</span>`);

        const typeRow = $('<div class="grid gap-2 grid-cols-3"></div>')
            .append($('<div class="space-y-1"></div>')
                .append($('<div class="text-sm font-medium">Type</div>'))
                .append($typeSelect))
            .append($('<div class="space-y-1 col-span-2"></div>')
                .append($('<div class="flex items-center"></div>')
                .append($('<label class="text-sm font-medium flex-auto">Protocol, domain and port</label>'))
                .append($permChip))
                .append($domainInput));

        body.append(typeRow);

        const badge = $(`<span id="${site.id}StatusBadge" class="rounded-full px-2 text-xxs font-medium tracking-wide bg-slate-600 text-white select-none shrink">Unknown</span>`);

        const apiRow = $('<div class="space-y-1"></div>')
            .append($('<div class="flex items-center gap-4"></div>')
            .append($('<label class="text-sm font-medium shrink">API key</label>'))
            .append(badge));
        const $apiKeyInput = $(
            `<input type="text" id="${site.id}ApiKey" data-site-id="${site.id}" class="flex-1 rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed" />`
        ).val(site.apiKey);
        const $testBtn = $(
            `<button id="${site.id}ApiKeyTest" type="button" data-site-id="${site.id}" class="inline-flex items-center gap-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-3 py-2 shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer">
                <span>Test</span>
                <span id="${site.id}ApiKeyIcon"><i class="fa-solid fa-vial"></i></span>
                <span id="${site.id}ApiKeyIconWorked" class="hidden text-green-400"><i class="fa-solid fa-check"></i></span>
                <span id="${site.id}ApiKeyIconFailed" class="hidden text-rose-400"><i class="fa-solid fa-xmark"></i></span>
                <span id="${site.id}ApiKeyIconProgress" class="hidden"><i class="fa-solid fa-spinner fa-spin"></i></span>
            </button>`
        );
        const apiFlex = $('<div class="flex gap-2 items-start"></div>').append($apiKeyInput).append($testBtn);

        apiRow.append(apiFlex)
            .append($(
                `<p id="${site.id}BasicDisabledHint" class="text-xs text-amber-400 mt-1 ${site.enabled ? 'hidden' : ''}">
                    Enable this site to edit connection details.
                </p>`
            ));
        body.append(apiRow);

        body.append($(`<div id="${site.id}ApiTestMessage" class="hidden w-fit text-xs font-medium px-2 py-1 rounded-full" role="status" aria-live="polite"></div>`));

        // Footer - Icon colors + Advanced
        const footer = $('<div class="js-adv-block"></div>');
        const footerHead = $('<div class="flex items-center justify-between gap-4 px-4 py-3 border-t border-slate-700"></div>');
        const footerTitle = $('<div class="text-sm font-medium">Icon palette</div>');
        const footerRight = $('<div class="flex items-center gap-2 ml-auto"></div>');
        const resetDefaultsBtn = $('<div class="flex-shrink-0"></div>').append(
            $(
                `<button type="button" class="inline-flex items-center gap-2 justify-center px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white text-xs cursor-pointer">
                <span>Reset colours</span><span><i class="fa-solid fa-palette"></i></span>
                </button>`
            ).on('click', async function(){
                const def = await getDefaultIconColors(site.type);
                
                $(`#${site.id}IconFg`).val(def.fg);
                $(`#${site.id}IconBg`).val(def.bg);
                
                setSettingsPropertiesFromForm();

                document.querySelector(`#${site.id}IconFg`).dispatchEvent(new Event('input', { bubbles: true }));
                document.querySelector(`#${site.id}IconBg`).dispatchEvent(new Event('input', { bubbles: true }));
                
                await updateSiteIconUI(site.id, site, true);
            })
        );

        footerHead.append(footerTitle, footerRight.append(resetDefaultsBtn));
        footer.append(footerHead);

        const iconRow = $('<div class="flex flex-col gap-2 px-4 py-3"></div>');
        const $fgInput = $(`<input type="text" id="${site.id}IconFg" class="text-white w-40 rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed" />`)
            .val(site.icon && site.icon.fg ? site.icon.fg : (site.type.indexOf('readarr')>=0 ? '#8e2222' : '#ffffff'));
        const $bgInput = $(`<input type="text" id="${site.id}IconBg" class="text-white w-40 rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed" />`)
            .val(site.icon && site.icon.bg ? site.icon.bg : (site.type.indexOf('readarr')>=0 ? '#eeeeee' : '#000000'));
        const fgGroup = $('<div class="flex items-center gap-4"></div>')
            .append($(`<div class="w-40 shrink-0"><div for="${site.id}IconFg" class="text-sm pt-1">Icon foreground colour</div></div>`))
            .append($fgInput);
        const bgGroup = $('<div class="flex items-center gap-4"></div>')
            .append($(`<div class="w-40 shrink-0"><div for="${site.id}IconBg" class="text-sm pt-1">Icon background colour</div></div>`))
            .append($bgInput);

        iconRow.append(fgGroup, bgGroup);
        footer.append(iconRow);

        const adv = $('<div class="js-adv-block border-t border-slate-700"></div>');

        const $advToggleInput = $(`<input type="checkbox" id="toggle-${site.id}-advanced" data-site-id="${site.id}">`)
            .prop('checked', !!site.autoPopAdvancedFromApi);

        const advHeader = $('<div class="flex items-start justify-between gap-4 px-4 pt-3"></div>')
            .append($('<div class="text-sm font-medium pt-1">Advanced settings</div>'))
            .append($('<div class="flex-shrink-0"></div>').append($advToggleInput));

        const advBody = $('<div class="p-4 space-y-4"></div>')
            .append(
                $('<div class="space-y-1"></div>')
                    .append($('<div class="text-sm font-medium">Search path URL</div>'))
                    .append($(`<input type="text" id="${site.id}SearchPath" aria-describedby="${site.id}SearchPathHelp" data-site-id="${site.id}" class="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed">`).val(site.searchPath))
                    .append($(`<p id="${site.id}SearchPathHelp" class="text-xs text-slate-400">Path appended to your instance base used for adding new content.</p>`))
            )
            .append(
                $('<div class="space-y-1"></div>')
                    .append($('<div class="text-sm font-medium">Search field selector</div>'))
                    .append($(`<input type="text" id="${site.id}SearchInputSelector" aria-describedby="${site.id}SearchInputSelectorHelp" data-site-id="${site.id}" class="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed">`).val(site.searchInputSelector))
                    .append($(`<p id="${site.id}SearchInputSelectorHelp" class="text-xs text-slate-400">jQuery selector used to find the search input element.</p>`))
            )
            .append($(
                `<p id="${site.id}AdvancedDisabledHint" class="text-xs text-amber-400 ${site.autoPopAdvancedFromApi ? '' : 'hidden'}">
                Disable auto population to edit these values manually.
                </p>`
            ));
        adv.append(advHeader, advBody);

        // Compose the card
        card.append(header, body, footer, adv);
        wrapper.append(card);

        // Site enabled/disabled pill
        initToggle($siteEnabledInput, {}, function () {
            const sid = $(this).attr('data-site-id');
            const enabled = $(this).prop('checked');

            // Apply base enable/disable to basic fields
            setBasicSiteEnabledState(sid, enabled);
            $(`#${sid}BasicDisabledHint`).toggleClass('hidden', enabled);

            // Re-evaluate Advanced fields from combined rule (site + auto)
            const auto = $(`#toggle-${sid}-advanced`).prop('checked');
            setAdvancedAutoPopulateState(sid, auto);

            setSettingsPropertiesFromForm();
        });

        // Advanced pill 
        initToggle($advToggleInput, {
            on: 'Auto populate from API',
            off: 'Manual (no auto populate)',
            onstyle: 'success',
            offstyle: 'danger'
        }, function () {
            const sid = $(this).attr('data-site-id');
            const auto = $(this).prop('checked');

            setAdvancedAutoPopulateState(sid, auto);
            
            $(`#${sid}AdvancedDisabledHint`).toggleClass('hidden', !auto);
            
            setSettingsPropertiesFromForm();
        });

        // Basic inputs, save & keep test button logic in sync
        $nameInput.on('input change', async function(){ await setSettingsPropertiesFromForm(); updateTestButtonState(site.id); });
        $apiKeyInput.on('input change', async function(){ await setSettingsPropertiesFromForm(); updateTestButtonState(site.id); });
        
        $domainInput.on('input change', async function(){ 
            await setSettingsPropertiesFromForm(); 
            updateTestButtonState(site.id);  
            debounceUpdatePerm(site.id, function () { updatePermissionChip(site.id); }, 450);
        });

        $typeSelect.on('change', async function() {
            $(`#${site.id}Name`).val(title($(`#${site.id}Type`).val(), true));
            
            await setSettingsPropertiesFromForm();
            
            const cur = await getSettings();
            
            await updateSiteIconUI(site.id, cur.sites.find(s=>s.id===site.id), true);
            
            updateTestButtonState(site.id);
        });

        // Advanced fields save as-you-type
        const $advInputs = $(`#${site.id}SearchPath, #${site.id}SearchInputSelector`);
        $advInputs.on('input change blur', async function () {
            await setSettingsPropertiesFromForm();
        });

        // Test button
        $testBtn.on('click', async function () {
            const siteId = $(this).attr('data-site-id');
            const siteEnabled = $(`#toggle-${siteId}`).prop('checked');

            if (!siteEnabled) {
                const $msg = $(`#${siteId}ApiTestMessage`)
                    .removeClass('hidden bg-green-600')
                    .addClass('bg-rose-600 text-white')
                    .html('Enable this site to test the API connection');

                setTestButtonIcon(siteId, 'Failed');
                return;
            }

            await setSettingsPropertiesFromForm();
            setTestButtonIcon(siteId, 'Progress');

            // Ensure host permission before calling API
            const $msg = $(`#${siteId}ApiTestMessage`).addClass('hidden');
            const origin = parseOriginFromDomain(($(`#${siteId}Domain`).val() || '').trim());
            
            if (!origin) {
                setTestButtonIcon(siteId, 'Failed');

                $msg
                    .removeClass('hidden bg-green-600')
                    .addClass('bg-rose-600 text-white')
                    .html('Invalid base URL (must include scheme, e.g. http://host:port/).')
                    .removeClass('hidden');
                
                return;
            }

            const hasPerm = await containsHostPermission(origin);
            
            if (!hasPerm) {
                const granted = await requestHostPermission(origin);

                if (granted) {
                    await updatePermissionChips();
                } else {
                    await updatePermissionChip(siteId);

                    setTestButtonIcon(siteId, 'Failed');
                    
                    $msg
                        .removeClass('hidden bg-green-600')
                        .addClass('bg-rose-600 text-white')
                        .html('Host permission denied. Cannot contact this instance until permission is granted.')
                        .removeClass('hidden');
                    
                        return;
                }
            }

            let response;
            try {
                response = await callApi({ siteId: siteId, endpoint: 'Version' });
            } catch (e) {
                response = { success: false, error: e };
            }

            if (response && response.success) {
                setTestButtonIcon(siteId, 'Worked');
                $msg.removeClass('hidden bg-rose-600').addClass('bg-green-600 text-white').html(`Success! Detected version ${response.data.version}`).removeClass('hidden');
                updateStatusBadge(siteId, 'ok', response.data.version);
                const settings = await getSettings();
                updateAdvancedForm(settings); // keep inputs in sync with any server-provided values
            } else {
                setTestButtonIcon(siteId, 'Failed');
                const errText = (response && response.error) ? (response.error.message || String(response.error)) : 'Unknown error';
                $msg.removeClass('hidden bg-green-600').addClass('bg-rose-600 text-white').html(`Failed: ${errText}. Please check the domain and API key.`).removeClass('hidden');
                updateStatusBadge(siteId, 'fail');
            }
        });

        // Spectrum colour pickers
        // On colour change, update settings and site icon
        const onColorChanged = async () => {
            const s = await getSettings();
            const curSite = s.sites.find(x => x.id === site.id) || site;

            if (!curSite.icon) {
                curSite.icon = { type: (curSite.type.indexOf('readarr') >= 0 ? 'readarr' : curSite.type), fg: null, bg: null };
            }

            const def = await getDefaultIconColors(curSite.type);
            const fgVal = $fgInput.val();
            const bgVal = $bgInput.val();

            curSite.icon.fg = fgVal || def.fg;
            curSite.icon.bg = bgVal || def.bg;
            curSite.icon.type = (curSite.type.indexOf('readarr') >= 0 ? 'readarr' : curSite.type);

            await setSettings(s);
            await updateSiteIconUI(site.id, curSite);
        };

        initSpectrumColorPicker($fgInput, $fgInput.val(), onColorChanged);
        initSpectrumColorPicker($bgInput, $bgInput.val(), onColorChanged);

        setBasicSiteEnabledState(site.id, site.enabled);
        $(`#${site.id}BasicDisabledHint`).toggleClass('hidden', site.enabled);

        setAdvancedAutoPopulateState(site.id, !!site.autoPopAdvancedFromApi);
        $(`#${site.id}AdvancedDisabledHint`).toggleClass('hidden', !site.autoPopAdvancedFromApi);

        updateTestButtonState(site.id);

        updatePermissionChip(site.id);

        requestAnimationFrame(() => {updateTestButtonState(site.id); updatePermissionChip(site.id);});
    }

    settings.sites.forEach(renderSiteCard);

    $('#generalOptionsForm').empty().prepend(wrapper);

    settings.sites.forEach(s => {
        const auto = $(`#toggle-${s.id}-advanced`).prop('checked');
        setAdvancedAutoPopulateState(s.id, auto);

        $(`#${s.id}AdvancedDisabledHint`).toggleClass('hidden', !auto);
        updateTestButtonState(s.id);
    });

    updateAdvancedVisibility();

    /**
     * Update visibility of advanced sections in the settings tab based on memory flag
     */
    function updateAdvancedVisibility() {
        const on = !!window.__showAdvancedInSettings;

        $('.js-adv-block').toggleClass('hidden', !on);
        $('#btnToggleAdvancedLabel').text(on ? 'Hide advanced' : 'Show advanced');

        if (on) {
            getSettings().then(s => {
                s.sites.forEach(site => {
                    const auto = $(`#toggle-${site.id}-advanced`).prop('checked');

                    setAdvancedAutoPopulateState(site.id, auto);

                    $(`#${site.id}AdvancedDisabledHint`).toggleClass('hidden', !auto);
                });
            });
        }
    }

    // Delegated handlers ensure events keep working if cards are rebuilt
    if (!window.__optionsDelegatedHandlersInstalled) {
        const $root = $('#generalOptionsForm');
        
        $root.on('input change blur', 'input[id$="Name"], input[id$="ApiKey"]', async function(){
            await setSettingsPropertiesFromForm();

            const siteId = $(this).attr('data-site-id') || (this.id || '').replace(/(Name|ApiKey)$/,'');

            if (siteId) updateTestButtonState(siteId);
        });
        
        $root.on('input change blur', 'input[id$="Domain"]', async function(){
            await setSettingsPropertiesFromForm();

            const siteId = $(this).attr('data-site-id') || (this.id || '').replace(/(Domain)$/,'');

            if (siteId) {
                updateTestButtonState(siteId);

                debounceUpdatePerm(siteId, function () { updatePermissionChip(siteId); }, 450);
            }
        });
        
        $root.on('change', 'select[id$="Type"]', async function(){
            await setSettingsPropertiesFromForm();
            
            const cur = await getSettings();
            const siteId = $(this).attr('data-site-id') || (this.id || '').replace(/Type$/,'');

            if (siteId) {
                const curSite = cur.sites.find(s=>s.id===siteId);
                
                $(`#${siteId}Name`).val(title(curSite.type, true));
                
                await updateSiteIconUI(siteId, curSite, true);
                
                updateTestButtonState(siteId);
            }
        });
        
        $root.on('click', 'button[id$="ApiKeyTest"]', async function(){
            const siteId = $(this).attr('data-site-id');
            const siteEnabled = $(`#toggle-${siteId}`).prop('checked');
            
            if (!siteEnabled) {
                const $msg = $(`#${siteId}ApiTestMessage`).removeClass('hidden bg-green-600').addClass('bg-rose-600 text-white').html('Enable this site to test the API connection');
                setTestButtonIcon(siteId, 'Failed');
                return;
            }

            await setSettingsPropertiesFromForm();
            setTestButtonIcon(siteId, 'Progress');

            // Ensure host permission before calling API
            const $msg = $(`#${siteId}ApiTestMessage`).addClass('hidden');
            const origin = parseOriginFromDomain(($(`#${siteId}Domain`).val() || '').trim());
            
            if (!origin) {
                setTestButtonIcon(siteId, 'Failed');

                $msg
                    .removeClass('hidden bg-green-600')
                    .addClass('bg-rose-600 text-white')
                    .html('Invalid base URL (must include scheme, e.g. http://host:port/).')
                    .removeClass('hidden');
                
                return;
            }

            const hasPerm = await containsHostPermission(origin);
            
            if (!hasPerm) {
                const granted = await requestHostPermission(origin);
                
                if (granted) {
                    await updatePermissionChips();
                } else {
                    await updatePermissionChip(site.id);

                    setTestButtonIcon(siteId, 'Failed');
                    
                    $msg
                        .removeClass('hidden bg-green-600')
                        .addClass('bg-rose-600 text-white')
                        .html('Host permission denied. Cannot contact this instance until permission is granted.')
                        .removeClass('hidden');
                    
                        return;
                }
            }
                        
            let response;
            
            try { 
                response = await callApi({ siteId, endpoint: 'Version' }); 
            } catch(e) { 
                response = { success:false, error:e }; 
            }
            
            if (response && response.success) {
                setTestButtonIcon(siteId, 'Worked');
                $msg.removeClass('hidden bg-rose-600').addClass('bg-green-600 text-white').html(`Success! Detected version ${response.data.version}`).removeClass('hidden');
                updateStatusBadge(siteId, 'ok', response.data.version);
                const settings = await getSettings();
                updateAdvancedForm(settings);
            } else {
                setTestButtonIcon(siteId, 'Failed');
                const errText = (response && response.error) ? (response.error.message || String(response.error)) : 'Unknown error';
                $msg.removeClass('hidden bg-green-600').addClass('bg-rose-600 text-white').html(`Failed: ${errText}. Please check the domain and API key.`).removeClass('hidden');
                updateStatusBadge(siteId, 'fail');
            }
        });
        
        // Advanced inputs (Search path + Selector) – delegated too
        $root.on('input change blur', 'input[id$="SearchPath"], input[id$="SearchInputSelector"]', async function () {
            await setSettingsPropertiesFromForm();
        });
        
        window.__optionsDelegatedHandlersInstalled = true;
    }

    // Add instance behaviour
    $('#btnAddInstance').on('click', async function(){
        const s = await getSettings();
        const newId = `instance_${Math.random().toString(36).slice(2, 8)}`;
        const newSite = {
            id: newId,
            type: 'sonarr',
            name: 'Sonarr',
            domain: 'http://localhost:8989',
            enabled: true,
            searchPath: '/add/new/',
            searchInputSelector: 'input[name="seriesLookup"]',
            menuText: 'Search Sonarr',
            apiKey: '',
            autoPopAdvancedFromApi: true,
            icon: getSiteIconConfig('sonarr')
        };

        s.sites.push(newSite);
        
        await setSettings(s);
        
        initialiseBasicForm(await getSettings());
    });

    /**
     * Remove a site from the settings.
     * @param {string} siteId - The ID of the site to remove.
     */
    async function removeSite(siteId) {
        const s = await getSettings();
        const idx = s.sites.findIndex(x => x.id === siteId);
        if (idx >= 0) {
            s.sites.splice(idx,1);
            await setSettings(s);
            initialiseBasicForm(await getSettings());
        }
    }
};

/**
 * Update settings from the settings tab form fields
 * @param {Setting} settings
 */
async function setSettingsPropertiesFromForm() {    
    const settings = await getSettings();

    for (let i = 0; i < settings.sites.length; i++) {
        const s = settings.sites[i];
        s.name = $(`#${s.id}Name`).val() || s.name;

        const prevType = s.type;
        s.type = $(`#${s.id}Type`).val() || s.type;
        s.domain = $(`#${s.id}Domain`).val();
        s.apiKey = $(`#${s.id}ApiKey`).val();
        s.enabled = $(`#toggle-${s.id}`).prop('checked');

        // Advanced (if present on this tab)
        const $sp = $(`#${s.id}SearchPath`);
        const $si = $(`#${s.id}SearchInputSelector`);
        const $at = $(`#toggle-${s.id}-advanced`);

        if ($sp.length) s.searchPath = $sp.val();
        if ($si.length) s.searchInputSelector = $si.val();
        if ($at.length) s.autoPopAdvancedFromApi = $at.prop('checked');

        // Persist icon colours if inputs exist
        const $fg = $(`#${s.id}IconFg`);
        const $bg = $(`#${s.id}IconBg`);

        if ($fg.length || $bg.length) {
            if (!s.icon) s.icon = { type: (s.type.indexOf('readarr')>=0 ? 'readarr' : s.type), fg: null, bg: null };
            const def = await getDefaultIconColors(s.type);
            const newFg = $fg.length ? ($fg.val() || def.fg) : (s.icon.fg || def.fg);
            const newBg = $bg.length ? ($bg.val() || def.bg) : (s.icon.bg || def.bg);
            s.icon.type = (s.type.indexOf('readarr')>=0 ? 'readarr' : s.type);
            s.icon.fg = newFg;
            s.icon.bg = newBg;
        }
        
        if (prevType !== s.type) {
            s.menuText = `Search ${title(s.type, true)}`;
            
            if (!s.name || s.name.trim() === '' || s.name === title(prevType, true)) {
                s.name = title(s.type, true);
            }

            const def = await getDefaultIconColors(s.type);
            
            if (!s.icon) s.icon = { type: (s.type.indexOf('readarr')>=0 ? 'readarr' : s.type), fg: def.fg, bg: def.bg };
            
            s.icon.type = (s.type.indexOf('readarr')>=0 ? 'readarr' : s.type);
            s.icon.fg = def.fg;
            s.icon.bg = def.bg;
        }
    }

    await setSettings(settings);    
}

/**
 * Enable/disable basic site fields based on enabled state.
 * @param {string} siteId
 * @param {boolean} enabled
 */
function setBasicSiteEnabledState(siteId, enabled) {
    const disabled = !enabled;
    const $name = $(`#${siteId}Name`);
    const $type = $(`#${siteId}Type`);
    const $domain = $(`#${siteId}Domain`);
    const $apiKey = $(`#${siteId}ApiKey`);
    const $fg = $(`#${siteId}IconFg`);
    const $bg = $(`#${siteId}IconBg`);
    const $test = $(`#${siteId}ApiKeyTest`);
    const hintId = `${siteId}BasicDisabledHint`;
    
    // Manage aria-describedby for inputs when disabled
    [$name, $type, $domain, $apiKey].forEach($el => {
        if (!$el.length) return;
        
        if (disabled) {
            const existing = ($el.attr('aria-describedby') || '').split(/\s+/).filter(x=>x);
            if (!existing.includes(hintId)) existing.push(hintId);
            $el.attr('aria-describedby', existing.join(' '));
        } else {
            const existing = ($el.attr('aria-describedby') || '').split(/\s+/).filter(x=>x && x!==hintId);
            if (existing.length) $el.attr('aria-describedby', existing.join(' ')); else $el.removeAttr('aria-describedby');
        }
    });

    [$name, $type, $domain, $apiKey].forEach($el => { 
        if ($el.length) { 
            $el.prop('disabled', disabled); 
            $el.toggleClass(DISABLED_CLASSES, disabled); 
        }
    });

    // Recompute Advanced inputs disabled/enabled from combined rule
    const auto = $(`#toggle-${siteId}-advanced`).prop('checked');
    setAdvancedAutoPopulateState(siteId, auto);

    // Spectrum picker enable/disable
    if ($fg.length) { $fg.prop('disabled', disabled); setSpectrumEnabled($fg, !disabled); }
    if ($bg.length) { $bg.prop('disabled', disabled); setSpectrumEnabled($bg, !disabled); }

    if ($test.length) { 
        $test.prop('disabled', disabled).attr('aria-disabled', disabled ? 'true' : null).attr('title', disabled ? 'Enable this site to test' : null).toggleClass(DISABLED_CLASSES, disabled); 
    }
    
    if (disabled) { 
        $(`#${siteId}ApiTestMessage`).addClass('hidden'); 
    }
    
    updateTestButtonState(siteId);

    updatePermissionChip(siteId);
}

/** 
 * Disable/enable Test buttons based on field validity
 * @param {string} siteId
 */
function updateTestButtonState(siteId) {
    const enabled = $(`#toggle-${siteId}`).prop('checked');
    const domain = ($(`#${siteId}Domain`).val() || '').trim();
    const apiKey = ($(`#${siteId}ApiKey`).val() || '').trim();
    const missing = !domain || !apiKey;
    const $test = $(`#${siteId}ApiKeyTest`);
    const shouldDisable = !enabled || missing;
    const title = !enabled ? 'Enable this site to test' : (missing ? 'Enter domain and API key to test' : null);

    if ($test.length) { 
        $test
            .prop('disabled', shouldDisable)
            .attr('aria-disabled', shouldDisable ? 'true' : null)
            .attr('title', title)
            .toggleClass(DISABLED_CLASSES, shouldDisable); 
    }
}

async function updatePermissionChips() {
    const settings = await getSettings();

    for (const siteId of settings.sites.map(s => s.id)) {
        await updatePermissionChip(siteId);
    }

    initialisePermissionsForm(settings);
}

async function updatePermissionChip(siteId) {
    const $chip = $(`#${siteId}PermChip`);
    const $btn  = $(`#${siteId}PermGrant`);
    const domain = ($(`#${siteId}Domain`).val() || '').trim();

    // Disabled style follows the site enabled toggle
    const siteEnabled = $(`#toggle-${siteId}`).prop('checked');

    // Reset base styles
    $chip.removeClass('bg-emerald-600 bg-rose-600 bg-slate-600 text-white animate-pulse')
        .addClass('bg-slate-600');
    $btn.addClass('hidden').attr('aria-disabled', null).prop('disabled', false);

    if (!domain) {
        $chip.text('No URL').attr('title', 'Enter a base URL including scheme, e.g. http://localhost:8989/');
        return;
    }

    const origin = parseOriginFromDomain(domain);
    if (!origin) {
        $chip.text('Invalid URL').attr('title', 'URL must include a scheme, e.g. http://host:port/');
        return;
    }

    $chip.text('Checking…').addClass('animate-pulse').attr('title', 'Checking host permission…');

    const has = await containsHostPermission(origin);

    $chip.removeClass('animate-pulse');

    if (has) {
        $chip.text('Permission granted')
            .removeClass('bg-slate-600')
            .addClass('bg-emerald-600')
            .attr('title', `Host permission granted for ${origin}`);
        $btn.addClass('hidden');
    } else {
        $chip.text('Permission missing')
            .removeClass('bg-slate-600')
            .addClass('bg-rose-600')
            .attr('title', `Click Grant to allow access to ${origin}`);

        // Show grant button; disable it visually if site itself is disabled
        if (siteEnabled) {
            $btn.removeClass('hidden').data('origin', origin);
        } else {
            $btn.removeClass('hidden').attr('aria-disabled', 'true').prop('disabled', true)
                .attr('title', 'Enable this site to grant permission');
        }
    }
}

/**
 * Enable/disable advanced fields based on autoPopulateActive state.
 * @param {string} siteId
 * @param {boolean} autoPopulateActive
 */
function setAdvancedAutoPopulateState(siteId, autoPopulateActive) {
    // Disabled if: site is disabled OR auto-populate is ON
    const siteEnabled = $(`#toggle-${siteId}`).prop('checked');
    const disabled = !siteEnabled || !!autoPopulateActive;

    const $path = $(`#${siteId}SearchPath`);
    const $sel  = $(`#${siteId}SearchInputSelector`);
    const hintId = `${siteId}AdvancedDisabledHint`;

    [$path, $sel].forEach($el => {
        if (!$el.length) return;

        if (disabled) {
            const existing = ($el.attr('aria-describedby') || '').split(/\s+/).filter(Boolean);
            if (!existing.includes(hintId)) existing.push(hintId);
            $el.attr('aria-describedby', existing.join(' '));
        } else {
            const existing = ($el.attr('aria-describedby') || '').split(/\s+/).filter(x => x && x !== hintId);
            if (existing.length) $el.attr('aria-describedby', existing.join(' ')); else $el.removeAttr('aria-describedby');
        }

        $el.prop('disabled', disabled).toggleClass(DISABLED_CLASSES, disabled);
    });
}


/**
 * Update the advanced settings tab form fields from settings
 * @param {Setting} settings
 */
var updateAdvancedForm = function (settings) {
    $.each(settings.sites, function (is, site) {
        // Always reflect latest values in the inputs
        $(`#${site.id}SearchPath`).val(site.searchPath || '');
        $(`#${site.id}SearchInputSelector`).val(site.searchInputSelector || '');

        // Apply disabled/enabled based on current toggle + site enabled
        const auto = $(`#toggle-${site.id}-advanced`).prop('checked');
        setAdvancedAutoPopulateState(site.id, auto);
        $(`#${site.id}AdvancedDisabledHint`).toggleClass('hidden', !auto);
    });
};

/**
 * Update the rendered header SVG icon and inputs for a site
 * @param {string} siteId
 * @param {object|null} siteObj Optional site object to avoid refetch
 */
async function updateSiteIconUI(siteId, siteObj = null, forceDefault = false) {
    const settings = siteObj ? null : await getSettings();
    const site = siteObj || (settings && settings.sites.find(s => s.id === siteId));

    if (!site) return;
    
    try {
        const $wrap = $(`#${site.id}HeaderIcon`);
        
        if ($wrap.length) {
            $wrap.empty().append($(getIconFromSiteIconConfig(site.icon, null, 'icon h-8 w-8')));
        }
        
        // keep inputs in sync if present
        const $fg = $(`#${site.id}IconFg`);
        const $bg = $(`#${site.id}IconBg`);
        const def = await getDefaultIconColors(site.type);

        if (forceDefault) {
            if ($fg.length) $fg.val(def.fg);
            if ($bg.length) $bg.val(def.bg);

            document.querySelector(`#${site.id}IconFg`).dispatchEvent(new Event('input', { bubbles: true }));
            document.querySelector(`#${site.id}IconBg`).dispatchEvent(new Event('input', { bubbles: true }));
            return;
        }

        if ($fg.length) $fg.val(site.icon && site.icon.fg ? site.icon.fg : def.fg);
        if ($bg.length) $bg.val(site.icon && site.icon.bg ? site.icon.bg : def.bg);
    } catch(e) { /* ignore */ }
}

/**
 * Shows the icon in the test button for the given site id where the suffix matches the end of the icon id; hides all other icons
 * @param {string} siteId - site identifier (sonarr /radarr / lidarr)
 * @param {string} suffix - suffix of the icon to show in the test button
 */
var setTestButtonIcon = (siteId, suffix) => {
    $.each(['', 'Worked', 'Failed', 'Progress'], function (i, x) {
        $(`#${siteId}ApiKeyIcon${x}`).css('display', (x === suffix ? 'block' : 'none'));
    });
};

// Update or create API status badge states
function updateStatusBadge(siteId, state, version) {
    const badge = $(`#${siteId}StatusBadge`);
    
    if (!badge.length) return;
    
    badge.removeClass('bg-slate-600 bg-amber-600 bg-green-600 bg-rose-600 animate-pulse').text('');

    switch(state) {
        case 'loading':
            badge.addClass('bg-amber-600 animate-pulse').text('Testing');
            break;
        case 'ok':
            badge.addClass('bg-green-600').text(version ? `v${version}` : 'OK');
            break;
        case 'fail':
            badge.addClass('bg-rose-600').text('Fail');
            break;
        default:
            badge.addClass('bg-slate-600').text('Unknown');
    }
}

// Passive background status probe state
let backgroundProbeRan = false;

/**
 * Run a background probe to update status badges for all enabled sites.
 * @returns {Promise<void>}
 */
async function runInitialBackgroundProbe() {
    if (backgroundProbeRan) {
        return; // safeguard
    }

    backgroundProbeRan = true;

    const settings = await getSettings();

    // Stagger requests slightly to avoid burst (50ms increments)
    const enabledSites = settings.sites.filter(s => s.enabled && s.domain && s.apiKey);

    enabledSites.forEach((site, idx) => {
        updateStatusBadge(site.id, 'loading');

        setTimeout(async () => {
            try {
                const response = await callApi({ siteId: site.id, endpoint: 'Version' });
                if (response.success) {
                    updateStatusBadge(site.id, 'ok', response.data.version);
                    updateAdvancedForm(settings);
                } else {
                    updateStatusBadge(site.id, 'fail');
                }
            } catch (e) {
                updateStatusBadge(site.id, 'fail');
            }
        }, 50 * idx);
    });
}

/**
 * Get default icon colours for a given site type from svgIcons (icons.js)
 * @param {string} type
 * @returns {{fg:string, bg:string}}
 */
async function getDefaultIconColors(type) {
    const t = type && type.indexOf('readarr') >= 0 ? 'readarr' : type;
    const icon = (typeof svgIcons !== 'undefined' && svgIcons) ? svgIcons.find(i => i.type === t) : null;
    return {
        fg: icon && icon.fg ? icon.fg : '#ffffff',
        bg: icon && icon.bg ? icon.bg : '#000000'
    };
}
