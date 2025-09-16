/**
 * Small shim replicating the bootstrapToggle API.
 * Supported features:
 *  - Initialisation via $(el).bootstrapToggle({ on, off, onstyle, offstyle, width })
 *  - Methods: 'enable', 'disable'
 *  - Keeping the underlying checkbox in sync & firing its native 'change' events
 */
(function ($) {
    $.fn.bootstrapToggle = function (arg) {
        this.each(function () {
            const $checkbox = $(this);

            // If already initialised and we have a command
            if (typeof arg === 'string') {
                const cmd = arg.toLowerCase();
                const $btn = $checkbox.data('twToggleButton');
                if (!$btn) return; // not initialised yet
                if (cmd === 'enable') {
                    $btn.removeClass('opacity-50 pointer-events-none');
                } else if (cmd === 'disable') {
                    $btn.addClass('opacity-50 pointer-events-none');
                }
                return;
            }

            // Only initialise once
            if ($checkbox.data('twToggleInitialised')) return;
            const opts = $.extend({
                on: 'On',
                off: 'Off',
                onstyle: 'success',
                offstyle: 'danger',
                width: '100%',
                size: 'small'
            }, (typeof arg === 'object' ? arg : {}));

            $checkbox.hide();

            const styleMap = (style, active) => {
                const base = 'inline-flex items-center justify-center rounded-md text-xs font-medium px-2 py-1 transition-colors transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 w-full select-none cursor-pointer active:scale-[.97]';
                const palette = style === 'success' ? (active ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-green-700/30 text-green-400') : (style === 'danger' ? (active ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-red-700/30 text-red-400') : (active ? 'bg-slate-600 hover:bg-slate-500 text-white' : 'bg-slate-600/20 text-slate-300'));
                return base + ' ' + palette;
            };

            const makeLabel = () => $checkbox.prop('checked') ? opts.on : opts.off;
            const computeClass = () => styleMap($checkbox.prop('checked') ? opts.onstyle : opts.offstyle, true);

            const $btn = $('<button type="button"></button>')
                .attr('aria-pressed', $checkbox.prop('checked'))
                .attr('data-test', 'toggle-btn')
                .addClass(computeClass())
                .css('width', opts.width)
                .text(makeLabel())
                .on('click', function () {
                    if ($btn.hasClass('opacity-50')) {
                        return; // disabled
                    }

                    $checkbox.prop('checked', !$checkbox.prop('checked'));
                    $btn.attr('aria-pressed', $checkbox.prop('checked'))
                        .removeClass()
                        .addClass(computeClass())
                        .text(makeLabel());
                    $checkbox.trigger('change');
                });

            $checkbox.after($btn);
            $checkbox.data('twToggleButton', $btn).data('twToggleInitialised', true);
        });

        return this;
    };
})(jQuery);

/**
 * Centralised helper to initialise a toggle with common defaults & attach change handler.
 * Usage: initToggle('#selector', { on:'Enabled', off:'Disabled' }, handlerFn)
 * @param {jQuery|HTMLElement} selector - The target element(s) to initialize.
 * @param {Object} opts - Custom options for the toggle.
 * @param {Function} onChange - Change event handler.
 * @returns {jQuery} The initialized element(s).
 */
function initToggle(selector, opts, onChange) {
    const $el = (selector instanceof jQuery) ? selector : $(selector);
    
    if (!$el.length) {
        return $el;
    }
    
    const base = {
        on: 'Enabled',
        off: 'Disabled',
        onstyle: 'success',
        offstyle: 'danger',
        width: '100%',
        size: 'small'
    };
    
    $el.bootstrapToggle($.extend({}, base, opts || {}));
    
    if (onChange) { 
        $el.on('change', onChange); 
    }
    
    return $el;
}

// Shared enable/disable helpers
const DISABLED_CLASSES = 'opacity-50 cursor-not-allowed';

/**
 * Initialize the tab system.
 * @returns {Promise<void>}
 */
function initTabs() {
    const tabTriggers = Array.from(document.querySelectorAll('.tab-trigger'));
    const panels = Array.from(document.querySelectorAll('[role="tabpanel"].panel'));
    if (!tabTriggers.length) return;

    function activate(id) {
        tabTriggers.forEach(btn => {
            const isActive = btn.id === id;
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
            if (isActive) {
                btn.classList.add('is-active', 'bg-white/10', 'text-white');
                btn.classList.remove('text-slate-300');
            } else {
                btn.classList.remove('is-active', 'bg-white/10', 'text-white');
                btn.classList.add('text-slate-300');
            }
        });
        panels.forEach(panel => {
            const match = 'panel-' + id.replace('tab-', '');
            const show = panel.id === match;
            if (show) {
                panel.removeAttribute('hidden');
                panel.classList.remove('hidden');
            } else {
                panel.setAttribute('hidden', '');
                panel.classList.add('hidden');
            }
        });

        // Custom icon preview injection logic previously tied to Bootstrap tab activation
        if (id === 'tab-custom-icon') {
            maybeShowCustomIconPreview();
        } else {
            removeCustomIconPreview();
        }
    }

    tabTriggers.forEach(btn => {
        btn.addEventListener('click', () => activate(btn.id));
        btn.addEventListener('keydown', e => {
            const idx = tabTriggers.indexOf(btn);
            if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) {
                e.preventDefault();
                let nextIndex = idx;
                if (e.key === 'ArrowRight') nextIndex = (idx + 1) % tabTriggers.length;
                if (e.key === 'ArrowLeft') nextIndex = (idx - 1 + tabTriggers.length) % tabTriggers.length;
                if (e.key === 'Home') nextIndex = 0;
                if (e.key === 'End') nextIndex = tabTriggers.length - 1;
                tabTriggers[nextIndex].focus();
                activate(tabTriggers[nextIndex].id);
            }
        });
    });

    // Ensure initial active state is correct
    const initiallyActive = tabTriggers.find(b => b.getAttribute('aria-selected') === 'true') || tabTriggers[0];
    activate(initiallyActive.id);
}

var entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
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
 * Escape HTML chars in the supplied string using the declared entityMap
 * @param {string} string 
 * @returns {string}
 */
var escapeHtml = (string) =>
    String(string).replace(/[&<>"'`=\/]/g,
        function(s) {
            return entityMap[s];
        });

/**
 * Build the toggle button
 * @param {Setting} settings The current settings object
 */
var initialiseEnabledDisabledButton = function(settings) {
    const $btn = $('#toggleActive');
    const enabled = settings.config.enabled;
    $btn.removeClass('bg-green-600 hover:bg-green-500 bg-red-600 hover:bg-red-500');
    if (enabled) {
        $btn.addClass('bg-red-600 hover:bg-red-500');
        $('#toggleActiveLabel').text('Disable');
    } else {
        $btn.addClass('bg-green-600 hover:bg-green-500');
        $('#toggleActiveLabel').text('Enable');
    }
    try { if (iconPort && iconPort.postMessage) iconPort.postMessage({ x: "y" }); } catch(e) { /* ignore disconnected port */ }
};

/**
 * Listen for storage changes
 */
browser.storage.onChanged.addListener(async function(changes, area) {
    let changedItems = Object.keys(changes);

    for (let item of changedItems) {
        if (item !== 'sonarrRadarrLidarrAutosearchSettings') {
            continue;
        }

        initialiseEnabledDisabledButton(changes[item].newValue);

        /**
         * call API version type endpoint if the auto populate from API setting is true and:
         * . on the Settings tab the domain or api key for any site has been changed, or the site has been set to enabled
         * . on the Advanced Settings tab the auto populate from API switch has been enabled
         */ 
        for (let i = 0; i < changes[item].oldValue.sites.length; i++) {
            let oldSite = changes[item].oldValue.sites[i],
                newSite = changes[item].newValue.sites[i];
            
            if (newSite.autoPopAdvancedFromApi &&
                newSite.enabled &&
                (oldSite.apiKey != newSite.apiKey ||
                oldSite.domain != newSite.domain ||
                oldSite.enabled != newSite.enabled ||
                oldSite.autoPopAdvancedFromApi != newSite.autoPopAdvancedFromApi)) {
                    log('Advanced settings update check required, calling version API');

                    const response = await callApi({ siteId: newSite.id, endpoint: 'Version' });

                    if (response.success) {
                        log([`API call succeeded, updating advanced settings for ${newSite.id}`, response]);

                        const settings = await getSettings();
                        updateAdvancedForm(settings);
                    } else {
                        log(['API call failed', response]);
                    }

                    // notify?
                }
        }
    }
});

$(async function () {
    // Initialise tab system first so panels exist with correct visibility.
    initTabs();

    const settings = await getSettings();
    initialiseEnabledDisabledButton(settings);
    initialiseBasicForm(settings);
    initialiseAdvancedForm(settings);
    initialiseIntegrationsForm(settings);
    initialiseCustomIconForm(settings);
    initialiseContextMenuForm(settings);
    initialiseDebugForm(settings);
    // Backup/Restore tab
    initialiseBackupForm(settings);

    // After forms built (badges exist), kick off passive status probe
    runInitialBackgroundProbe();

    $('#toggleActive').on('click', async function () {
        const settings = await getSettings();
        settings.config.enabled = !settings.config.enabled;
        await setSettings(settings);
    });

    // Signal to tests that options initialisation finished.
    window.__optionsReady = true;
});