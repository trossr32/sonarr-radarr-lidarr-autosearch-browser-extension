/**
 * Build the settings tab
 * @param {Setting} settings
 */
var initialiseBasicForm = function (settings) {
    const wrapper = $('<div class="grid gap-6 md:grid-cols-2"></div>');

    // Add instance button row
    const addBtnRow = $('<div class="md:col-span-2 flex justify-end"></div>')
        .append($('<button type="button" id="btnAddInstance" class="inline-flex items-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"></button>')
            .append($('<i class="fa-solid fa-plus"></i>'))
            .append($('<span>Add instance</span>')));
    wrapper.append(addBtnRow);

    function renderSiteCard(site) {
        const card = $('<div class="rounded-lg bg-white/5 border border-slate-700 shadow overflow-hidden flex flex-col"></div>');
        const header = $('<div class="flex items-center justify-between gap-4 px-4 py-3 border-b border-slate-700"></div>');
        const $nameInput = $(`<input type="text" id="${site.id}Name" data-site-id="${site.id}" placeholder="Display name" class="rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-40 disabled:cursor-not-allowed" />`).val(site.name || title(site.type, true));
        const left = $('<div class="flex items-center gap-3"></div>')
            .append($(`<span id="${site.id}HeaderIcon" class="inline-flex h-8 w-8 items-center justify-center"></span>`).append($(getIconFromSiteIconConfig(site.icon, 'width:32px;height:32px;', 'icon h-8 w-8'))))
            //.append($(`<img src="content/assets/images/${site.type}/${title(site.type, false)}48.png" class="h-8 w-8" alt="${title(site.type, false)} icon" onerror="this.src='content/assets/images/SonarrRadarrLidarr48.png'" />`))
            .append($nameInput);
        const right = $('<div class="flex items-center gap-2 ml-auto"></div>');
        const badge = $(`<span id="${site.id}StatusBadge" class="rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-slate-600 text-white select-none">Unknown</span>`);
        const toggle = $(`<input type="checkbox" id="toggle-${site.id}" data-site-id="${site.id}" class="disabled:cursor-not-allowed">`).prop('checked', site.enabled);
        const toggleWrap = $('<div class="flex-shrink-0"></div>').append(toggle);
        const delBtn = $(`<button type="button" class="inline-flex items-center justify-center h-7 w-7 rounded bg-slate-700 hover:bg-slate-600 text-white" title="Remove">`+
                         `<i class="fa-solid fa-trash text-[11px]"></i></button>`)
                        .on('click', async function(){ await removeSite(site.id); });
        right.append(badge, toggleWrap, delBtn);
        header.append(left, right);

        const body = $(`<div class="relative p-4 space-y-5"></div>`);

        // Type + Domain
        const $typeSelect = $(`<select id="${site.id}Type" data-site-id="${site.id}" class="w-full rounded-md border border-slate-600 bg-slate-800 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"></select>`)
            .append(`<option value="sonarr" ${site.type==='sonarr'?'selected':''}>Sonarr</option>`)
            .append(`<option value="radarr" ${site.type==='radarr'?'selected':''}>Radarr</option>`)
            .append(`<option value="lidarr" ${site.type==='lidarr'?'selected':''}>Lidarr</option>`)
            .append(`<option value="readarr_ebook" ${site.type==='readarr_ebook'?'selected':''}>Readarr (ebook)</option>`)
            .append(`<option value="readarr_audiobook" ${site.type==='readarr_audiobook'?'selected':''}>Readarr (audiobook)</option>`);
        const $domainInput = $(`<input type="text" id="${site.id}Domain" placeholder="http://192.168.0.1:7357" data-site-id="${site.id}" class="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed" />`).val(site.domain);
        const typeRow = $('<div class="grid gap-2 grid-cols-3"></div>')
            .append($('<div class="space-y-1"></div>')
                .append($('<label class="text-sm font-medium">Type</label>'))
                .append($typeSelect))
            .append($('<div class="space-y-1 col-span-2"></div>')
                .append($('<label class="text-sm font-medium">Protocol, domain and port</label>'))
                .append($domainInput)
            );
        body.append(typeRow);

        // API key field + test button
        const apiRow = $('<div class="space-y-1"></div>')
            .append($('<label class="text-sm font-medium">API key</label>'));
        const $apiKeyInput = $(`<input type="text" id="${site.id}ApiKey" data-site-id="${site.id}" class="flex-1 rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed" />`).val(site.apiKey);
        const $testBtn = $(`<button id="${site.id}ApiKeyTest" type="button" data-site-id="${site.id}" class="inline-flex items-center gap-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-3 py-2 shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer">` +
                '<span>Test</span>' +
                `<span id="${site.id}ApiKeyIcon"><i class="fa-solid fa-vial"></i></span>` +
                `<span id="${site.id}ApiKeyIconWorked" class="hidden text-green-400"><i class="fa-solid fa-check"></i></span>` +
                `<span id="${site.id}ApiKeyIconFailed" class="hidden text-red-400"><i class="fa-solid fa-xmark"></i></span>` +
                `<span id="${site.id}ApiKeyIconProgress" class="hidden"><i class="fa-solid fa-spinner fa-spin"></i></span>` +
                '</button>');
    
        const apiFlex = $('<div class="flex gap-2 items-start"></div>')
            .append($apiKeyInput)
            .append($testBtn);
        apiRow.append(apiFlex)
            .append($(`<p id="${site.id}BasicDisabledHint" class="text-[11px] text-amber-400 mt-1 ${(site.enabled ? 'hidden' : '')}">Enable this site to edit connection details.</p>`));
        body.append(apiRow);

        // API test message
        body.append($(`<div id="${site.id}ApiTestMessage" class="hidden w-fit text-xs font-medium px-2 py-1 rounded-full" role="status" aria-live="polite"></div>`));

        // Icons
        const footer = $('<div></div>');
        const footerHead = $('<div class="flex items-center justify-between gap-4 px-4 py-3 border-t border-slate-700"></div>');
        const footerTitle = $('<div class="text-sm font-medium">Icon palette</div>');
        const footerRight = $('<div class="flex items-center gap-2 ml-auto"></div>');
        const resetDefaultsBtn = $('<div class="flex-shrink-0"></div>')
            .append($(`<button type="button" class="inline-flex items-center justify-center px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white cursor-pointer">Reset defaults</button>`)
                .on('click', async function(){ 
                    const def = await getDefaultIconColors(site.type);
                    
                    $(`#${site.id}IconFg`).val(def.fg);
                    $(`#${site.id}IconBg`).val(def.bg);
                    
                    setSettingsPropertiesFromForm();

                    document.querySelector(`#${site.id}IconFg`).dispatchEvent(new Event('input', { bubbles: true }));
                    document.querySelector(`#${site.id}IconBg`).dispatchEvent(new Event('input', { bubbles: true }));

                    await updateSiteIconUI(site.id, site, true);
                }));
        
        footerHead.append(footerTitle, footerRight.append(resetDefaultsBtn));
        footer.append(footerHead);

        // Icon colour pickers
        const iconRow = $('<div class="grid gap-2 grid-cols-1 px-4 py-3"></div>');
        const fgGroup = $('<div class="flex items-center gap-4"></div>')
            .append($(`<div class="w-56 shrink-0"><label for="${site.id}IconFg" class="font-medium pt-1">Icon foreground colour</label></div>`))
            .append($(`<input type="text" id="${site.id}IconFg" data-coloris class="text-white w-40 rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed" />`).val(site.icon && site.icon.fg ? site.icon.fg : (site.type.indexOf('readarr')>=0 ? '#8e2222' : '#fff')));
        const bgGroup = $('<div class="flex items-center gap-4"></div>')
            .append($(`<div class="w-56 shrink-0"><label for="${site.id}IconBg" class="font-medium pt-1">Icon background colour</label></div>`))
            .append($(`<input type="text" id="${site.id}IconBg" data-coloris class="text-white w-40 rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed" />`).val(site.icon && site.icon.bg ? site.icon.bg : (site.type.indexOf('readarr')>=0 ? '#eee' : '#000')));
        iconRow.append(fgGroup, bgGroup);
        footer.append(iconRow);

        card.append(header, body, footer);
        wrapper.append(card);

        // Wire events
        const $toggle = toggle; // initialize on the created element before DOM insert
        initToggle($toggle, {}, function () {
            const sid = $(this).attr('data-site-id');
            const enabled = $(this).prop('checked');
            setBasicSiteEnabledState(sid, enabled);
            $(`#${sid}BasicDisabledHint`).toggleClass('hidden', enabled);
            setSettingsPropertiesFromForm();
        });
        
        setBasicSiteEnabledState(site.id, site.enabled);
        
        $(`#${site.id}BasicDisabledHint`).toggleClass('hidden', site.enabled);
        
        updateTestButtonState(site.id);

        // Bind events directly on created elements
        $nameInput.on('input change', async function(){ await setSettingsPropertiesFromForm(); updateTestButtonState(site.id); });
        
        $typeSelect.on('change', async function(){
            await setSettingsPropertiesFromForm();
            const cur = await getSettings();
            // Refresh the icon immediately and reset colour inputs to defaults for new type if user had cleared
            await updateSiteIconUI(site.id, cur.sites.find(s=>s.id===site.id), true);
            initialiseAdvancedForm(cur);
            updateTestButtonState(site.id);
        });
        
        $domainInput.on('input change', async function(){ await setSettingsPropertiesFromForm(); updateTestButtonState(site.id); });
        $apiKeyInput.on('input change', async function(){ await setSettingsPropertiesFromForm(); updateTestButtonState(site.id); });
        
        $testBtn.on('click', async function () {
            const siteId = $(this).attr('data-site-id');
            
            // Prevent testing when site is disabled (callApi only considers enabled sites)
            const siteEnabled = $(`#toggle-${siteId}`).prop('checked');
            if (!siteEnabled) {
                const $msg = $(`#${siteId}ApiTestMessage`).removeClass('hidden bg-green-600').addClass('bg-red-600 text-white').html('Enable this site to test the API connection');
                setTestButtonIcon(siteId, 'Failed');
                return;
            }
            
            // Persist any unsaved input edits before testing to avoid stale values
            await setSettingsPropertiesFromForm();
            setTestButtonIcon(siteId, 'Progress');
            
            const $msg = $(`#${siteId}ApiTestMessage`).addClass('hidden');
            let response;
            
            try { 
                response = await callApi({ siteId: siteId, endpoint: 'Version' }); 
            } catch (e) { 
                response = { success: false, error: e }; 
            }
            
            if (response && response.success) {
                setTestButtonIcon(siteId, 'Worked');
                $msg.removeClass('hidden bg-red-600').addClass('bg-green-600 text-white').html(`Success! Detected version ${response.data.version}`).removeClass('hidden');
                updateStatusBadge(siteId, 'ok', response.data.version);
                const settings = await getSettings();
                updateAdvancedForm(settings);
            } else {
                setTestButtonIcon(siteId, 'Failed');
                const errText = (response && response.error) ? (response.error.message || String(response.error)) : 'Unknown error';
                $msg.removeClass('hidden bg-green-600').addClass('bg-red-600 text-white').html('Failed: ' + errText + '. Please check the domain and API key.').removeClass('hidden');
                updateStatusBadge(siteId, 'fail');
            }
        });

        // Color input events
        const onColorChanged = async () => {
            const s = await getSettings();
            const curSite = s.sites.find(x => x.id === site.id);
            
            if (!curSite.icon) {
                curSite.icon = { 
                    type: (curSite.type.indexOf('readarr')>=0 ? 'readarr' : curSite.type), 
                    fg: null, 
                    bg: null 
                };
            }

            const def = await getDefaultIconColors(curSite.type);
            const fgVal = $(`#${site.id}IconFg`).val();
            const bgVal = $(`#${site.id}IconBg`).val();

            curSite.icon.fg = fgVal || def.fg;
            curSite.icon.bg = bgVal || def.bg;
            curSite.icon.type = (curSite.type.indexOf('readarr')>=0 ? 'readarr' : curSite.type);

            await setSettings(s);

            await updateSiteIconUI(site.id, curSite);
        };

        // Instantiate coloris pickers
        Coloris({
            el: 'input[data-coloris]',
            theme: 'large',
            themeMode: 'dark',
            alpha: false,
            format: 'hex'
        });

        // Hook Coloris selection and manual input
        $(`#${site.id}IconFg, #${site.id}IconBg`).on('input change', onColorChanged);

        Coloris.setInstance(`#${site.id}IconFg, #${site.id}IconBg`, {
            onChange: (color, input) => onColorChanged()
        });
    }

    settings.sites.forEach(renderSiteCard);

    $('#generalOptionsForm').empty().prepend(wrapper);

    // Delegated handlers ensure events keep working if cards are rebuilt
    if (!window.__optionsDelegatedHandlersInstalled) {
        const $root = $('#generalOptionsForm');
        
        $root.on('input change', 'input[id$="Name"], input[id$="Domain"], input[id$="ApiKey"]', async function(){
            await setSettingsPropertiesFromForm();
            const siteId = $(this).attr('data-site-id') || (this.id || '').replace(/(Name|Domain|ApiKey)$/,'');
            if (siteId) updateTestButtonState(siteId);
        });
        
        $root.on('change', 'select[id$="Type"]', async function(){
            await setSettingsPropertiesFromForm();
            const cur = await getSettings();
            initialiseAdvancedForm(cur);
            const siteId = $(this).attr('data-site-id') || (this.id || '').replace(/Type$/,'');
            if (siteId) {
                const curSite = cur.sites.find(s=>s.id===siteId);
                await updateSiteIconUI(siteId, curSite, true);
                updateTestButtonState(siteId);
            }
        });
        
        $root.on('click', 'button[id$="ApiKeyTest"]', async function(){
            const siteId = $(this).attr('data-site-id');
            const siteEnabled = $(`#toggle-${siteId}`).prop('checked');
            
            if (!siteEnabled) {
                const $msg = $(`#${siteId}ApiTestMessage`).removeClass('hidden bg-green-600').addClass('bg-red-600 text-white').html('Enable this site to test the API connection');
                setTestButtonIcon(siteId, 'Failed');
                return;
            }

            await setSettingsPropertiesFromForm();
            setTestButtonIcon(siteId, 'Progress');
            
            const $msg = $(`#${siteId}ApiTestMessage`).addClass('hidden');
            let response;
            
            try { 
                response = await callApi({ siteId, endpoint: 'Version' }); 
            } catch(e) { 
                response = { success:false, error:e }; 
            }
            
            if (response && response.success) {
                setTestButtonIcon(siteId, 'Worked');
                $msg.removeClass('hidden bg-red-600').addClass('bg-green-600 text-white').html(`Success! Detected version ${response.data.version}`).removeClass('hidden');
                updateStatusBadge(siteId, 'ok', response.data.version);
                const settings = await getSettings();
                updateAdvancedForm(settings);
            } else {
                setTestButtonIcon(siteId, 'Failed');
                const errText = (response && response.error) ? (response.error.message || String(response.error)) : 'Unknown error';
                $msg.removeClass('hidden bg-green-600').addClass('bg-red-600 text-white').html(`Failed: ${errText}. Please check the domain and API key.`).removeClass('hidden');
                updateStatusBadge(siteId, 'fail');
            }
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
            // Update default labels when type changes; keep existing advanced values as-is until API test runs
            s.menuText = 'Search ' + title(s.type, true);
            
            if (!s.name || s.name.trim() === '' || s.name === title(prevType, true)) {
                s.name = title(s.type, true);
            }

            // Reset icon type and colours to defaults for the new type (as requested)
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

    if ($test.length) { 
        $test.prop('disabled', disabled).attr('aria-disabled', disabled ? 'true' : null).attr('title', disabled ? 'Enable this site to test' : null).toggleClass(DISABLED_CLASSES, disabled); 
    }
    
    if (disabled) { 
        $(`#${siteId}ApiTestMessage`).addClass('hidden'); 
    }
    
    // Also re-evaluate Test state when fields change
    updateTestButtonState(siteId);
}

// Disable/enable Test buttons based on field validity
function updateTestButtonState(siteId) {
    const enabled = $(`#toggle-${siteId}`).prop('checked');
    const domain = ($(`#${siteId}Domain`).val() || '').trim();
    const apiKey = ($(`#${siteId}ApiKey`).val() || '').trim();
    const missing = !domain || !apiKey;
    const $test = $(`#${siteId}ApiKeyTest`);
    const shouldDisable = !enabled || missing;
    const title = !enabled ? 'Enable this site to test' : (missing ? 'Enter domain and API key to test' : null);
    if ($test.length) { $test.prop('disabled', shouldDisable).attr('aria-disabled', shouldDisable ? 'true' : null).attr('title', title).toggleClass(DISABLED_CLASSES, shouldDisable); }
}

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
    badge.removeClass('bg-slate-600 bg-amber-500 bg-green-600 bg-red-600 animate-pulse').text('');
    switch(state) {
        case 'loading':
            badge.addClass('bg-amber-500 animate-pulse').text('Testing');
            break;
        case 'ok':
            badge.addClass('bg-green-600').text(version ? 'v'+version : 'OK');
            break;
        case 'fail':
            badge.addClass('bg-red-600').text('Fail');
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
        fg: icon && icon.fg ? icon.fg : '#fff',
        bg: icon && icon.bg ? icon.bg : '#000'
    };
}