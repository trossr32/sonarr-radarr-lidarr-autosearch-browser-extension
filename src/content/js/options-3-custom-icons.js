let __customIconPreviewCount = 1;

const siteTypes = ['sonarr', 'radarr', 'lidarr'];

var getUnitFromOffset = (offset) => offset.match(/(?<amount>[\d|\.]+)(?<unit>.+)/i).groups.unit;

var getAmountFromOffset = (offset) => offset.match(/(?<amount>[\d|\.]+)(?<unit>.+)/i).groups.amount;

/**
 * Get HTML markup for a custom icon to inject into the body.
 * Renders N icons side-by-side, picking the icon type from `siteTypes[i]`.
 * @param {InjectedIconConfig} injectedIconConfig
 * @param {string} _siteType  // ignored (kept for compatibility with existing calls)
 * @param {string} linkHref
 * @param {number} [count=1] how many icons to render in a row
 * @returns {string}
 */
function getCustomIconMarkup(injectedIconConfig, _siteType, linkHref, count = 1) {
    const n = Math.max(1, Math.min(3, Number(count) || 1));
    const multi = n > 1;

    // Build N tiles, each with its own background image from siteTypes[i]
    const icons = Array.from({ length: n }, (_, i) => {
        const t = siteTypes[i] || siteTypes[siteTypes.length - 1]; // safe fallback
        const dataUri = getIconAsDataUri(t, null, null);
        return `<div class="servarr-ext_icon-image" data-type="${t}" style="background-image:url('${dataUri}')"></div>`;
    }).join('');

    return `<style id="servarr-ext_custom-icon-style">
.servarr-ext_icon a {
    position: absolute;
    background-color: ${injectedIconConfig.backgroundColor};
    text-decoration: none;
    height: 52px;
    z-index: 9999999;
    ${injectedIconConfig.position}: ${injectedIconConfig.positionOffset};
    display: inline-flex;
    gap: 14px;
}
.servarr-ext_anchored-icon a {
    padding: 0 15px;
    ${multi ? 'width:auto;' : 'width:60px;'}
}
.servarr-ext_floating-icon a {
    ${injectedIconConfig.side}: ${injectedIconConfig.sideOffset};
    border-radius: 50px;
    ${multi ? 'width:auto; padding:6px;' : 'width:52px; padding:6px 0 0 6px;'}
}
.servarr-ext_anchored-left-icon a  { left: 0;  border-radius: 0 50px 50px 0; }
.servarr-ext_anchored-right-icon a { right: 0; border-radius: 50px 0 0 50px; }

.servarr-ext_icon-image {
    width: 40px;
    height: 40px;
    background-repeat: no-repeat;
    background-size: 40px 40px;
}
.servarr-ext_anchored-icon .servarr-ext_icon-image { margin: 6px -10px 0 0; }
</style>
<div id="servarr-ext_custom-icon-wrapper"
     class="servarr-ext_icon servarr-ext_${injectedIconConfig.type}-icon ${(injectedIconConfig.type == 'anchored' ? (`servarr-ext_anchored-${injectedIconConfig.side}-icon`) : '')}"
     data-count="${n}">
    <a href="${linkHref}" target="_blank" data-servarr-icon="true">
        ${icons}
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
        `<input type="text" id="icon-background-color" class="text-white w-40 rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" maxlength="9" />`
    ).val(settings.injectedIconConfig.backgroundColor);

    controls.append(colorInput);
    bgRow.append(controls);
    body.append(bgRow);

    // Preview count slider
    const previewRow = $('<div class="flex items-center gap-4"></div>');
    
    previewRow.append('<div class="min-w-[12rem]"><label for="icon-preview-count" class="font-medium">Preview count</label><p class="text-xs text-slate-400">Preview multiple icons</p></div>');
    
    const sliderWrap = $('<div class="flex items-center gap-2"></div>');
    const slider = $(`<input type="range" id="icon-preview-count" min="1" max="3" step="1" value="1" class="w-40">`);
    const sliderVal = $('<span id="icon-preview-count-value" class="text-xs text-slate-400">1</span>');

    sliderWrap.append(slider, sliderVal);
    previewRow.append(sliderWrap);
    body.append(previewRow);

    // Keep module variable in sync and refresh preview; DO NOT save to settings
    slider.on('input change', async function () {
        __customIconPreviewCount = Math.max(1, Math.min(3, Number($(this).val()) || 1));

        $('#icon-preview-count-value').text(String(__customIconPreviewCount));
        
        await maybeShowCustomIconPreview();
    });

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
    initSpectrumColorPicker(colorInput, settings.injectedIconConfig.backgroundColor, async function () {
        await setSettingsPropertiesFromCustomIconForm();
        await maybeShowCustomIconPreview();
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

    // Initial state sync
    syncEnabledDisabled();
};

/** 
 * number → "12px" or "12%" (non-negative, finite) 
 * @param {string|number} rawNumberLike - input to parse
 * @param {'px'|'%'} unit - unit to append
 * @param {string} fallback - fallback value if input is invalid (default "0px")
 * @returns {string} - e.g. "12px" or "12%"
 */
function toPxOrPercent(rawNumberLike, unit /* 'px' | '%' */, fallback = '0px') {
    const n = Number.parseFloat(String(rawNumberLike).trim());
    if (!Number.isFinite(n) || n < 0) return fallback;
    return `${n}${unit}`;
}

/**
 * 'top' | 'bottom' only 
 * @param {string} token - input to normalize
 * @param {string} fallback - fallback value if input is invalid (default "bottom")
 * @returns {string} - 'top' | 'bottom' 
*/
function normalizeVerticalPos(token, fallback = 'bottom') {
    return token === 'top' ? 'top' : token === 'bottom' ? 'bottom' : fallback;
}

/** 
 * 'left' | 'right' only (if you have a side setting) 
 * @param {string} token - input to normalize
 * @param {string} fallback - fallback value if input is invalid (default "right")
 * @returns {string} - 'left' | 'right'
 */
function normalizeSide(token, fallback = 'right') {
    return token === 'left' ? 'left' : token === 'right' ? 'right' : fallback;
}

/** 
 * strict hex: #rgb | #rrggbb
 * @param {string} value - input to normalize
 * @param {string} fallback - fallback value if input is invalid (default "#000000")
 * @returns {string} - e.g. "#ff0000"
 */
function normalizeHexColour(value, fallback = '#000000') {
    const v = String(value || '').trim();
    return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v) ? v : fallback;
}

/** 
 * only allow safe IDs/keys for icon names, etc. 
 * @param {string} value - input to normalize
 * @param {string} fallback - fallback value if input is invalid (default "sonarr")
 * @returns {string} - e.g. "sonarr", "radarr", "lidarr"
 */
function safeToken(value, fallback = 'sonarr') {
    const v = String(value || '').trim();
    return /^[a-z0-9_-]{1,40}$/i.test(v) ? v : fallback;
}

/**
 * Update settings from the custom icon tab form fields (sanitized)
 */
async function setSettingsPropertiesFromCustomIconForm() {
    const settings = await getSettings();
    
    settings.injectedIconConfig = settings.injectedIconConfig || {};

    // Booleans
    const useCustomIcon = Boolean($('#toggle-use-custom-icon').prop('checked'));
    const isAnchored = Boolean($('#toggle-icon-type').prop('checked'));
    const isLeftSide = Boolean($('#toggle-side').prop('checked'));
    const sideInPx = Boolean($('#toggle-side-offset').prop('checked'));
    const isTopPosition = Boolean($('#toggle-position').prop('checked'));
    const positionInPx = Boolean($('#toggle-position-offset').prop('checked'));

    // Units & numeric inputs → sanitized CSS lengths
    const sideUnit = sideInPx ? 'px' : '%';
    const posUnit = positionInPx ? 'px' : '%';
    const sideRaw = $('#side-offset').val();
    const posRaw = $('#position-offset').val();
    const sideOffset = toPxOrPercent(sideRaw, sideUnit, `0${sideUnit}`);
    const positionOffset = toPxOrPercent(posRaw, posUnit, `0${posUnit}`);

    // Enum-like fields (normalized)
    const side = normalizeSide(isLeftSide ? 'left' : 'right');
    const position = normalizeVerticalPos(isTopPosition ? 'top' : 'bottom');

    // Colours (strict hex only)
    const backgroundColor = normalizeHexColour($('#icon-background-color').val());

    // Type (anchor/floating) – set from boolean, no free-form strings
    const type = isAnchored ? 'anchored' : 'floating';

    // Assign to settings (only sanitized values)
    settings.config.customIconPosition = useCustomIcon;
    settings.injectedIconConfig.type = type;
    settings.injectedIconConfig.side = side;
    settings.injectedIconConfig.sideOffset = sideOffset;
    settings.injectedIconConfig.position = position;
    settings.injectedIconConfig.positionOffset = positionOffset;
    settings.injectedIconConfig.backgroundColor = backgroundColor;

    // Remove any existing preview nodes/styles before re-injecting
    $("#servarr-ext_custom-icon-wrapper, #servarr-ext_custom-icon-style").remove();

    // Re-inject preview only if the custom icon tab is currently active (aria-selected)
    const customIconTabActive = $('#tab-custom-icon[aria-selected="true"]').length > 0;

    if (useCustomIcon && customIconTabActive) {
        // If you have a Node-based renderer, prefer that. Keeping your existing markup call:
        $('body').prepend(getCustomIconMarkup(settings.injectedIconConfig, 'sonarr', '#', __customIconPreviewCount));
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

        $('body').prepend(getCustomIconMarkup(settings.injectedIconConfig, 'sonarr', '#', __customIconPreviewCount));
    }
}