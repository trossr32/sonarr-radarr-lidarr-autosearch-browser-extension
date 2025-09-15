/**
 * Build the advanced settings tab
 * @param {Setting} settings The current settings object
 */
var initialiseAdvancedForm = function (settings) {
    const wrapper = $('<div class="grid gap-6 md:grid-cols-2"></div>');

    $.each(settings.sites, function (i, site) {
        const card = $('<div class="rounded-lg bg-white/5 border border-slate-700 shadow overflow-hidden flex flex-col"></div>');
        const header = $('<div class="flex items-center justify-between gap-4 px-4 py-3 border-b border-slate-700"></div>');
        const left = $('<div class="flex items-center gap-3"></div>')
            .append($(`<img src="content/assets/images/${site.id}/${title(site.id, false)}48.png" class="h-8 w-8" alt="${title(site.id, false)} icon" />`))
            .append($(`<h3 class="text-base font-semibold m-0">${title(site.id, true)}</h3>`));
        const toggleContainer = $('<div class="w-44"></div>')
            .append($(`<input type="checkbox" id="toggle-${site.id}-advanced" data-site-id="${site.id}" class="hidden">`).prop('checked', site.autoPopAdvancedFromApi));
        header.append(left, toggleContainer);

    const body = $(`<div class="relative p-4 space-y-6"></div>`);

        // Search path
        body.append(
            $('<div class="space-y-1"></div>')
                .append($('<label class="text-sm font-medium">Search path URL</label>'))
                .append($(`<input type="text" id="${site.id}SearchPath" aria-describedby="${site.id}SearchPathHelp" data-site-id="${site.id}" class="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">`).val(site.searchPath))
                .append($(`<p id="${site.id}SearchPathHelp" class="text-xs text-slate-400">Path appended to your instance base used for adding new content.</p>`))
        );

        // Search input selector
        body.append(
            $('<div class="space-y-1"></div>')
                .append($('<label class="text-sm font-medium">Search field selector</label>'))
                .append($(`<input type="text" id="${site.id}SearchInputSelector" aria-describedby="${site.id}SearchInputSelectorHelp" data-site-id="${site.id}" class="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">`).val(site.searchInputSelector))
                .append($(`<p id="${site.id}SearchInputSelectorHelp" class="text-xs text-slate-400">jQuery selector used to find the search input element.</p>`))
        );

        // Hint (appears when auto-pop ON because inputs disabled)
        body.append($(`<p id="${site.id}AdvancedDisabledHint" class="text-[11px] text-amber-400 ${(site.autoPopAdvancedFromApi ? '' : 'hidden')}">Disable auto population to edit these values manually.</p>`));

        card.append(header, body);
        wrapper.append(card);
    });

    // Version config card
    const versionCard = $('<div class="rounded-lg bg-white/5 border border-slate-700 shadow overflow-hidden flex flex-col"></div>')
        .append($('<div class="flex items-start gap-4 px-4 py-3 border-b border-slate-700"></div>')
            .append($('<i class="fa-solid fa-project-diagram fa-lg text-indigo-400"></i>'))
            .append($('<h3 class="font-semibold text-base m-0">Version config</h3>'))
        )
        .append($('<div class="p-4 space-y-8 text-sm text-slate-300"></div>')
            .append($('<div class="space-y-2"></div>')
                .append($('<h4 class="font-semibold">Sonarr version config</h4>'))
                .append($('<p>Defaults assume v4.<i>n</i>. For v2.<i>n</i> use:</p>'))
                .append($('<p>Search path url: <b>/addseries/</b></p>'))
                .append($('<p>Search field selector: <b>.add-series-search .x-series-search</b></p>'))
            )
            .append($('<div class="space-y-2"></div>')
                .append($('<h4 class="font-semibold">Radarr version config</h4>'))
                .append($('<p>Defaults assume v4.<i>n</i>. For v0.<i>n</i> use:</p>'))
                .append($('<p>Search path url: <b>/addmovies/</b></p>'))
                .append($('<p>Search field selector: <b>.add-movies-search .x-movies-search</b></p>'))
            )
        );
    wrapper.append(versionCard);

    $('#advancedOptionsForm').empty().append(wrapper);

    $.each(settings.sites, function (is, site) {
        const $toggle = $(`#toggle-${site.id}-advanced`);
        initToggle($toggle, { on: 'Auto populate from API', off: 'Prevent auto populate' }, function () {
            const sid = $(this).attr('data-site-id');
            const auto = $(this).prop('checked');
            setAdvancedAutoPopulateState(sid, auto);
            $(`#${sid}AdvancedDisabledHint`).toggleClass('hidden', !auto);
            setSettingsPropertiesFromAdvancedForm();
        });
        setAdvancedAutoPopulateState(site.id, site.autoPopAdvancedFromApi);
        $(`#${site.id}AdvancedDisabledHint`).toggleClass('hidden', !site.autoPopAdvancedFromApi);
        $.each(['SearchPath', 'SearchInputSelector'], function (iv, v) {
            $(`#${site.id}${v}`).on('input', setSettingsPropertiesFromAdvancedForm);
        });
    });
};

/**
 * Enable/disable advanced fields based on autoPopulateActive state.
 * @param {string} siteId
 * @param {boolean} autoPopulateActive
 */
function setAdvancedAutoPopulateState(siteId, autoPopulateActive) {
    // When autoPopulateActive == true we DISABLE manual editing
    const disabled = autoPopulateActive;
    const $path = $(`#${siteId}SearchPath`);
    const $sel = $(`#${siteId}SearchInputSelector`);
    const hintId = `${siteId}AdvancedDisabledHint`;
    
    [$path, $sel].forEach($el => {
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
    
    [$path, $sel].forEach($el => { 
        if ($el.length) { 
            $el.prop('disabled', disabled); $el.toggleClass(DISABLED_CLASSES, disabled); 
        }
    });
}

/**
 * Update the advanced settings tab form fields from settings
 * @param {Setting} settings The current settings object
 */
var updateAdvancedForm = function (settings) {
    $.each(settings.sites, function (is, site) {
        const auto = $(`#toggle-${site.id}-advanced`).prop('checked');
        
        if (auto) {
            $(`#${site.id}SearchPath`).val(site.searchPath);
            $(`#${site.id}SearchInputSelector`).val(site.searchInputSelector);
        }

        setAdvancedAutoPopulateState(site.id, auto);
        
        $(`#${site.id}AdvancedDisabledHint`).toggleClass('hidden', !auto);
    }); 
};

/**
 * Update settings from the advanced settings tab form fields
 */
async function setSettingsPropertiesFromAdvancedForm() {
    const settings = await getSettings();

    for (let i = 0; i < settings.sites.length; i++) {
        settings.sites[i].searchPath = $(`#${settings.sites[i].id}SearchPath`).val();
        settings.sites[i].searchInputSelector = $(`#${settings.sites[i].id}SearchInputSelector`).val();
        settings.sites[i].autoPopAdvancedFromApi = $(`#toggle-${settings.sites[i].id}-advanced`).prop('checked');
    }

    await setSettings(settings);
}