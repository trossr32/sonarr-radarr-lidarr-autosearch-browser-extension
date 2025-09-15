// Passive background status probe state
let backgroundProbeRan = false;

/**
 * Enable/disable basic site fields based on enabled state.
 * @param {string} siteId
 * @param {boolean} enabled
 */
function setBasicSiteEnabledState(siteId, enabled) {
    const disabled = !enabled;
    const $domain = $(`#${siteId}Domain`);
    const $apiKey = $(`#${siteId}ApiKey`);
    const $test = $(`#${siteId}ApiKeyTest`);
    const hintId = `${siteId}BasicDisabledHint`;

    // Manage aria-describedby for inputs when disabled
    [$domain, $apiKey].forEach($el => {
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
    
    [$domain, $apiKey].forEach($el => { 
        if ($el.length) { 
            $el.prop('disabled', disabled); $el.toggleClass(DISABLED_CLASSES, disabled); 
        }
    });
    
    if ($test.length) { 
        $test.prop('disabled', disabled).attr('aria-disabled', disabled ? 'true' : null).toggleClass(DISABLED_CLASSES, disabled); 
    }

    if (disabled) { 
        $(`#${siteId}ApiTestMessage`).addClass('hidden'); 
    }
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

/**
 * Build the settings tab
 */
var initialiseBasicForm = function (settings) {
    const wrapper = $('<div class="grid gap-6 md:grid-cols-2"></div>');

    $.each(settings.sites, function (i, site) {
        const card = $('<div class="rounded-lg bg-white/5 border border-slate-700 shadow overflow-hidden flex flex-col"></div>');
        const header = $('<div class="flex items-center justify-between gap-4 px-4 py-3 border-b border-slate-700"></div>');
        const left = $('<div class="flex items-center gap-3"></div>')
            .append($(`<img src="content/assets/images/${site.id}/${title(site.id, false)}48.png" class="h-8 w-8" alt="${title(site.id, false)} icon" />`))
            .append($(`<h3 class="text-base font-semibold m-0">${title(site.id, true)}</h3>`));
            const badge = $('<span id="'+site.id+'StatusBadge" class="ml-auto mr-3 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-slate-600 text-white select-none">Unknown</span>');
            const toggleContainer = $('<div class="w-32 flex items-center gap-2 justify-end"></div>')
                .append(badge)
            .append($(`<input type="checkbox" id="toggle-${site.id}" data-site-id="${site.id}" class="hidden">`).prop('checked', site.enabled));
        header.append(left, toggleContainer);

        const body = $(`<div class="relative p-4 space-y-5"></div>`);

        // Domain field
        body.append(
            $('<div class="space-y-1"></div>')
                .append($('<label class="text-sm font-medium">Protocol, domain and port</label>'))
                .append($(`<input type="text" id="${site.id}Domain" placeholder="http://192.168.0.1:7357" data-site-id="${site.id}" class="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />`).val(site.domain))
        );

        // API key field + test button
        const apiRow = $('<div class="space-y-1"></div>')
            .append($('<label class="text-sm font-medium">API key</label>'));
        const apiFlex = $('<div class="flex gap-2 items-start"></div>')
            .append($(`<input type="text" id="${site.id}ApiKey" data-site-id="${site.id}" class="flex-1 rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />`).val(site.apiKey))
            .append($(`<button id="${site.id}ApiKeyTest" type="button" data-site-id="${site.id}" class="inline-flex items-center gap-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-3 py-2 shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer">` +
                '<span>Test</span>' +
                `<span id="${site.id}ApiKeyIcon"><i class="fa-solid fa-vial"></i></span>` +
                `<span id="${site.id}ApiKeyIconWorked" class="hidden text-green-400"><i class="fa-solid fa-check"></i></span>` +
                `<span id="${site.id}ApiKeyIconFailed" class="hidden text-red-400"><i class="fa-solid fa-xmark"></i></span>` +
                `<span id="${site.id}ApiKeyIconProgress" class="hidden"><i class="fa-solid fa-spinner fa-spin"></i></span>` +
                '</button>'));
        apiRow.append(apiFlex)
            .append($(`<p id="${site.id}BasicDisabledHint" class="text-[11px] text-amber-400 mt-1 ${(site.enabled ? 'hidden' : '')}">Enable this site to edit connection details.</p>`));
        body.append(apiRow);

        // API test message
        body.append($(`<div id="${site.id}ApiTestMessage" class="hidden w-fit text-xs font-medium px-2 py-1 rounded-full" role="status" aria-live="polite"></div>`));

        card.append(header, body);
        wrapper.append(card);
    });

    $('#generalOptionsForm').empty().prepend(wrapper);

    // Initialise toggles & events
    $.each(settings.sites, function (is, site) {
        const $toggle = $(`#toggle-${site.id}`);

        initToggle($toggle, {}, function () {
            const sid = $(this).attr('data-site-id');
            const enabled = $(this).prop('checked');
            setBasicSiteEnabledState(sid, enabled);
            $(`#${sid}BasicDisabledHint`).toggleClass('hidden', enabled);
            setSettingsPropertiesFromForm();
        });
        
        // Initial sync using shared helper
        setBasicSiteEnabledState(site.id, site.enabled);
        $(`#${site.id}BasicDisabledHint`).toggleClass('hidden', site.enabled);

        // Input events
        $.each(['Domain', 'ApiKey'], function (iv, v) {
            $(`#${site.id}${v}`).on('input', setSettingsPropertiesFromForm);
        });

        // API key test
        $(`#${site.id}ApiKeyTest`).on('click', async function () {
            const siteId = $(this).attr('data-site-id');
            setTestButtonIcon(siteId, 'Progress');
            const $msg = $(`#${site.id}ApiTestMessage`).addClass('hidden');
            const response = await callApi({ siteId: siteId, endpoint: 'Version' });

            if (response.success) {
                setTestButtonIcon(siteId, 'Worked');
                
                $msg.removeClass('hidden bg-red-600').addClass('bg-green-600 text-white').html(`Success! Detected version ${response.data.version}`).removeClass('hidden');
                
                updateStatusBadge(siteId, 'ok', response.data.version);
                
                const settings = await getSettings();
                
                updateAdvancedForm(settings);
            } else {
                setTestButtonIcon(siteId, 'Failed');
                
                $msg.removeClass('hidden bg-green-600').addClass('bg-red-600 text-white').html('Failed, please double check the domain and API key').removeClass('hidden');
                
                updateStatusBadge(siteId, 'fail');
            }
        });
    });
};

/**
 * Update or create API status badge states
 * @param {string} siteId 
 * @param {string} state 
 * @param {string} version 
 * @returns 
 */
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

/**
 * Update settings from the settings tab form fields
 */
async function setSettingsPropertiesFromForm() {
    const settings = await getSettings();

    for (let i = 0; i < settings.sites.length; i++) {
        settings.sites[i].domain = $(`#${settings.sites[i].id}Domain`).val();
        settings.sites[i].apiKey = $(`#${settings.sites[i].id}ApiKey`).val();
        settings.sites[i].enabled = $(`#toggle-${settings.sites[i].id}`).prop('checked');
    }

    await setSettings(settings);
}

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