var getUnitFromOffset = (offset) => offset.match(/(?<amount>[\d|\.]+)(?<unit>.+)/i).groups.unit;

var getAmountFromOffset = (offset) => offset.match(/(?<amount>[\d|\.]+)(?<unit>.+)/i).groups.amount;

/**
 * Get HTML markup for a custom icon to inject into the body.
 * @param {InjectedIconConfig} injectedIconConfig - injected icon config
 * @param {string} iconDataUri - icon data uri
 * @param {string} siteId - id of the servarr site; sonarr, radarr, lidarr, etc.
 * @returns {string} - HTML to inject
 */
function getCustomIconMarkup(injectedIconConfig, siteId, linkHref) {
return `<style id="servarr-ext_custom-icon-style">
.servarr-ext_icon a {
    position: absolute;
    background-color: ${injectedIconConfig.backgroundColor};
    text-decoration: none;
    height: 52px;
    z-index: 9999999;
    ${injectedIconConfig.position}: ${injectedIconConfig.positionOffset};
}

.servarr-ext_anchored-icon a {
    padding: 0 15px;
    width: 60px;
}

.servarr-ext_floating-icon a {
    width: 52px;
    ${injectedIconConfig.side}: ${injectedIconConfig.sideOffset};
    border-radius: 50px;
}

.servarr-ext_anchored-left-icon a {
    left: 0;
    border-radius: 0 50px 50px 0;
}

.servarr-ext_anchored-right-icon a {
    right: 0;
    border-radius: 50px 0 0 50px;
}

.servarr-ext_anchored-left-icon .servarr-ext_anchor-label {
    margin-top: 8px;
}

.servarr-ext_anchored-right-icon .servarr-ext_anchor-label {
    margin: 8px 0 0 50px;
}

.servarr-ext_icon-image {
    width: 40px;
    height: 40px;
    background: url('${base64Icons.find(i => i.id == siteId).fortyPx}') no-repeat;
}

.servarr-ext_anchored-icon .servarr-ext_icon-image {
    top: 6px;
}

.servarr-ext_floating-icon .servarr-ext_icon-image {
    margin: ${(siteId == 'radarr' ? '6px 0px 0px 8px' : '6px 0px 0px 6px')};
}

.servarr-ext_anchored-left-icon .servarr-ext_icon-image {
    float: right;
    margin: ${(siteId == 'radarr' ? '6px -10px 0 0' : '6px -10px 0 0')};
}

.servarr-ext_anchored-right-icon .servarr-ext_icon-image {
    float: left;
    margin: ${(siteId == 'radarr' ? '6px 0px 0px -5px' : '6px 0px 0px -9px')};
}
</style>
<div id="servarr-ext_custom-icon-wrapper" class="servarr-ext_icon servarr-ext_${injectedIconConfig.type}-icon ${(injectedIconConfig.type == 'anchored' ? ('servarr-ext_anchored-' + injectedIconConfig.side + '-icon') : '')}">
    <a href="${linkHref}" target="_blank" data-servarr-icon="true">
        <div class="servarr-ext_icon-image"></div>
        <!-- ${(injectedIconConfig.type == 'anchored' ? ('<div class="servarr-ext_anchor-label">Search<br />' + title(siteId) + '</div>') : '')} -->
    </a>
</div>`;
}

/**
 * Build the custom icon settings tab
 * @param {Settings} settings - current settings
 */
var initialiseCustomIconForm = function (settings) {
    const grid = $('<div class="grid gap-6 md:grid-cols-2"></div>');

    // Primary configuration card
    const mainCard = $('<div class="rounded-lg bg-white/5 border border-slate-700 shadow overflow-hidden flex flex-col"></div>');
    const header = $('<div class="flex items-center gap-3 px-4 py-3 border-b border-slate-700"></div>')
        .append($('<i class="fa-solid fa-icons text-indigo-400"></i>'))
        .append($('<h3 class="font-semibold text-base m-0">Custom icon</h3>'));
    const body = $('<div class="p-4 space-y-6 text-sm"></div>');

    // Use custom icon toggle
    const useRow = $('<div class="flex items-start justify-between gap-4"></div>')
        .append($('<div class="flex-1">' +
            '<label for="toggle-use-custom-icon" class="font-medium">Use custom icon</label>' +
            '<p class="mt-1 text-xs text-slate-400">Enable injecting a floating or anchored quick-search icon on supported sites.</p>' +
            '</div>'))
        .append($('<div class="w-28 flex-shrink-0"></div>')
            .append($('<input type="checkbox" id="toggle-use-custom-icon" class="hidden">').prop('checked', settings.config.customIconPosition))
        );
    body.append(useRow);

    // Icon type toggle
    const typeRow = $('<div class="flex items-start justify-between gap-4"></div>')
        .append($('<div class="flex-1">' +
            '<label for="toggle-icon-type" class="font-medium">Icon type</label>' +
            '<p class="mt-1 text-xs text-slate-400">Anchored icons hug a screen edge; floating icons sit freely.</p>' +
            '</div>'))
        .append($('<div class="w-32 flex-shrink-0"></div>')
            .append($('<input type="checkbox" id="toggle-icon-type" class="hidden">').prop('checked', settings.injectedIconConfig.type === 'anchored')));
    body.append(typeRow);

    // Side + offset (horizontal)
    const sideGroup = $('<div class="grid gap-4 sm:grid-cols-2"></div>');
    const sideCol = $('<div class="space-y-2"></div>')
        .append($('<label for="toggle-side" class="font-medium">Window side</label>'))
        .append($('<input type="checkbox" id="toggle-side" class="hidden">').prop('checked', settings.injectedIconConfig.side === 'left'));
    const sideOffsetCol = $('<div class="space-y-2"></div>')
        .append($('<label for="side-offset" class="font-medium">Horizontal offset</label>'))
        .append($('<div class="flex items-center gap-2"></div>')
            .append($(`<input type="text" id="side-offset" class="w-20 rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" maxlength="4">`).val(getAmountFromOffset(settings.injectedIconConfig.sideOffset)))
            .append($('<input type="checkbox" id="toggle-side-offset" class="hidden">').prop('checked', getUnitFromOffset(settings.injectedIconConfig.sideOffset) === 'px'))
            .append($('<span class="text-xs text-slate-400">Units</span>'))
        );
    sideGroup.append(sideCol, sideOffsetCol);
    body.append(sideGroup);

    // Position + offset (vertical)
    const posGroup = $('<div class="grid gap-4 sm:grid-cols-2"></div>');
    const posCol = $('<div class="space-y-2"></div>')
        .append($('<label for="toggle-position" class="font-medium">Window position</label>'))
        .append($('<input type="checkbox" id="toggle-position" class="hidden">').prop('checked', settings.injectedIconConfig.position === 'top'));
    const posOffsetCol = $('<div class="space-y-2"></div>')
        .append($('<label for="position-offset" class="font-medium">Vertical offset</label>'))
        .append($('<div class="flex items-center gap-2"></div>')
            .append($(`<input type="text" id="position-offset" class="w-20 rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" maxlength="4">`).val(getAmountFromOffset(settings.injectedIconConfig.positionOffset)))
            .append($('<input type="checkbox" id="toggle-position-offset" class="hidden">').prop('checked', getUnitFromOffset(settings.injectedIconConfig.positionOffset) === 'px'))
            .append($('<span class="text-xs text-slate-400">Units</span>'))
        );
    posGroup.append(posCol, posOffsetCol);
    body.append(posGroup);

    // Background colour row (label on the left, controls on the right)
    const bgRow = $('<div class="flex gap-4 items-start"></div>')
        .append($('<div class="pt-1 min-w-[12rem]"><label for="icon-background-color" class="font-medium">Icon background colour</label></div>'));

    // Controls container: input + swatch button
    const controls = $('<div class="flex items-center gap-2"></div>');

    // Text input for manual entry (kept same ID for existing logic)
    const colorInput = $(
        `<input type="text" id="icon-background-color" class="text-white w-40 rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" maxlength="7" />`
    ).val(settings.injectedIconConfig.backgroundColor);

    controls.append(colorInput);
    bgRow.append(controls);
    body.append(bgRow);

    mainCard.append(header, body);
    grid.append(mainCard);

    $('#customIconOptionsForm').empty().append(grid);

    // Initialise toggles with shim
    initToggle('#toggle-use-custom-icon', {}, null);
    initToggle('#toggle-icon-type', { on: 'Anchored', off: 'Floating', offstyle: 'success' }, null);
    initToggle('#toggle-side', { on: 'Left', off: 'Right', offstyle: 'success' }, null);
    initToggle('#toggle-side-offset', { on: 'px', off: '%', offstyle: 'success' }, null);
    initToggle('#toggle-position', { on: 'Top', off: 'Bottom', offstyle: 'success' }, null);
    initToggle('#toggle-position-offset', { on: 'px', off: '%', offstyle: 'success' }, null);

    // Initialize Spectrum on the input
    var spectrumOptions = {
        color: settings.injectedIconConfig.backgroundColor,
        showPalette: false,
        showInput: true,
        showInitial: false,
        showButtons: true,
        clickoutFiresChange: true,
        showAlpha: false,
        allowEmpty: false,
        preferredFormat: 'hex',
        appendTo: 'body',
        // Update when user confirms selection (Choose/OK) or closes the picker
        change: function (color) {
            if (color) {
                syncFromPicker(color);
            } else {
                setTimeout(function () { syncFromPicker(null); }, 0);
            }
        },
        hide: function (color) {
            if (color) {
                syncFromPicker(color);
            } else {
                setTimeout(function () { syncFromPicker(null); }, 0);
            }
        }
    };
    colorInput.spectrum(spectrumOptions);

    async function syncFromPicker(color) {
        var tiny = color;
        if (!tiny) {
            try { tiny = colorInput.spectrum('get'); } catch (e) { tiny = null; }
        }
        if (!tiny) return;
        var hex = tiny.toHexString();
        colorInput.val(hex);
        await setSettingsPropertiesFromCustomIconForm();
        await maybeShowCustomIconPreview();
    }

    // Show picker when focusing or clicking the input (optional UX improvement)
    colorInput.on('focus', function () {
        try { colorInput.spectrum('show'); } catch (e) { /* ignore */ }
    });

    // Update enabled/disabled states consistently (extended to cover button + popover)
    function syncEnabledDisabled() {
        const using = $('#toggle-use-custom-icon').prop('checked');
        const anchored = $('#toggle-icon-type').prop('checked');

        const enableAll = function (sel, en) {
            $(sel).each(function () { $(this).bootstrapToggle(en ? 'enable' : 'disable'); });
        };

        enableAll('#toggle-icon-type, #toggle-side, #toggle-position, #toggle-side-offset, #toggle-position-offset', using);

        // Inputs and color controls
        $('#side-offset, #position-offset, #icon-background-color').prop('disabled', !using);

        try { 
            colorInput.spectrum(using ? 'enable' : 'disable'); 
        } catch (e) { /* ignore */ }
        
        if (!using) { 
            try { 
                colorInput.spectrum('hide'); 
            } catch (e) { /* ignore */ } 
        }

        if (!using) return;

        if (anchored) {
            $('#toggle-side-offset').bootstrapToggle('disable');
            $('#side-offset').prop('disabled', true);
            $('#toggle-side, #toggle-position, #toggle-position-offset').bootstrapToggle('enable');
            $('#position-offset').prop('disabled', false);
        } else {
            $('#toggle-side-offset').bootstrapToggle('enable');
            $('#side-offset').prop('disabled', false);
            $('#toggle-side, #toggle-position, #toggle-position-offset').bootstrapToggle('enable');
            $('#position-offset').prop('disabled', false);
        }
    }

    // Event wiring
    $('#toggle-use-custom-icon').on('change', function () {
        syncEnabledDisabled();
        setSettingsPropertiesFromCustomIconForm();
    });
    
    $('#toggle-icon-type, #toggle-side, #toggle-position, #toggle-side-offset, #toggle-position-offset')
        .on('change', function () { syncEnabledDisabled(); setSettingsPropertiesFromCustomIconForm(); });

    $('#side-offset, #position-offset').on('input', setSettingsPropertiesFromCustomIconForm);

    // Text input changes -> validate & push to settings + picker
    const isValidHex = function (v) { return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim()); };
    colorInput.on('input', async function () {
        var val = $(this).val().trim();
        if (val && val[0] !== '#') {
            val = `#${val}`;
            $(this).val(val);
        }
        if (isValidHex(val)) {
            try { colorInput.spectrum('set', val); } catch (e) { /* ignore */ }
            await setSettingsPropertiesFromCustomIconForm();
            maybeShowCustomIconPreview();
        }
    });

    // Initial state sync
    syncEnabledDisabled();
};

/**
 * Update settings from the custom icon tab form fields
 */
async function setSettingsPropertiesFromCustomIconForm() {
    const settings = await getSettings();

    settings.config.customIconPosition = $('#toggle-use-custom-icon').prop('checked');
    settings.injectedIconConfig.type = $('#toggle-icon-type').prop('checked') ? 'anchored' : 'floating';
    settings.injectedIconConfig.side = $('#toggle-side').prop('checked') ? 'left' : 'right';
    settings.injectedIconConfig.sideOffset = $('#toggle-side-offset').prop('checked') ? `${$('#side-offset').val()}px` : `${$('#side-offset').val()}%`;
    settings.injectedIconConfig.position = $('#toggle-position').prop('checked') ? 'top' : 'bottom';
    settings.injectedIconConfig.positionOffset = $('#toggle-position-offset').prop('checked') ? `${$('#position-offset').val()}px` : `${$('#position-offset').val()}%`;
    settings.injectedIconConfig.backgroundColor = $('#icon-background-color').val();

    $("#servarr-ext_custom-icon-wrapper, #servarr-ext_custom-icon-style").remove();

    // Re-inject preview only if the custom icon tab is currently active (aria-selected)
    const customIconTabActive = $('#tab-custom-icon[aria-selected="true"]').length > 0;
    if (settings.config.customIconPosition && customIconTabActive) {
        $('body').prepend(getCustomIconMarkup(settings.injectedIconConfig, 'sonarr', '#'));
    }

    await setSettings(settings);
}

/**
 * Remove the custom icon preview elements from the DOM.
 */
function removeCustomIconPreview() {
    $("#servarr-ext_custom-icon-wrapper, #servarr-ext_custom-icon-style").remove();
}

/** 
 * Show a preview of the custom icon if enabled in settings.
 * If already shown, remove and re-add (to refresh with latest settings).
 */
async function maybeShowCustomIconPreview() {
    const settings = await getSettings();

    if (settings.config.customIconPosition) {
        removeCustomIconPreview();
        
        $('body').prepend(getCustomIconMarkup(settings.injectedIconConfig, 'sonarr', '#'));
    }
}