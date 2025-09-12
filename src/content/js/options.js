var iconPort = browser.runtime.connect({ name: 'icon' });

// Lazy loader promise for Coloris (color picker). Only loaded when custom icon tab is first opened.
let colorisLoadPromise = null;

/**
 * Ensure Coloris is loaded, returning a promise that resolves when done.
 * @returns {Promise<void>}
 */
function ensureColoris() {
    if (colorisLoadPromise) {
        return colorisLoadPromise;
    }

    colorisLoadPromise = new Promise((resolve, reject) => {
        // If Coloris already present (user navigated back) just resolve.
        if (window.Coloris) { resolve(); return; }
        const script = document.createElement('script');
        script.src = 'content/js/coloris.min.js';
        script.async = true;
        script.onload = () => {
            // Small defer to allow script to register global
            setTimeout(() => resolve(), 0);
        };
        script.onerror = (e) => { 
            console.error('Failed to load Coloris', e); 
            reject(e);
        };
        document.head.appendChild(script);
    });

    return colorisLoadPromise;
}

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
    [$domain, $apiKey].forEach($el => { if ($el.length){ $el.prop('disabled', disabled); $el.toggleClass(DISABLED_CLASSES, disabled); }});
    if ($test.length) { $test.prop('disabled', disabled).attr('aria-disabled', disabled ? 'true' : null).toggleClass(DISABLED_CLASSES, disabled); }
    if (disabled) { $(`#${siteId}ApiTestMessage`).addClass('hidden'); }
}

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
    [$path, $sel].forEach($el => { if ($el.length){ $el.prop('disabled', disabled); $el.toggleClass(DISABLED_CLASSES, disabled); }});
}

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
                btn.classList.add('is-active', 'bg-white/10');
            } else {
                btn.classList.remove('is-active', 'bg-white/10');
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
            // Ensure Coloris loaded then show preview (and re-init field if needed)
            ensureColoris().then(() => {
                if (window.Coloris) {
                    Coloris({
                        el: 'input[data-coloris]',
                        theme: 'large',
                        themeMode: 'dark',
                        alpha: false,
                        format: 'hex',
                        closeButton: true,
                        clearButton: true,
                    });
                }

                maybeShowCustomIconPreview();
            }).catch(() => {
                // Fallback: still attempt preview even if picker failed
                maybeShowCustomIconPreview();
            });
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

/**
 * Deep merge utility (non-destructive). Arrays are replaced; objects merged.
 */
function deepMerge(target, source) {
    if (Array.isArray(source)) return source.slice();
    if (source && typeof source === 'object') {
        const out = (target && typeof target === 'object') ? Object.assign({}, target) : {};
        Object.keys(source).forEach(k => {
            out[k] = deepMerge(target ? target[k] : undefined, source[k]);
        });
        return out;
    }
    return source;
}

/**
 * Validate a candidate settings object. Returns { valid, errors[] }
 */
function validateSettingsShape(obj) {
    const errors = [];
    if (!obj || typeof obj !== 'object') {
        errors.push('Root is not an object.');
    } else {
        if (!obj.config || typeof obj.config !== 'object') errors.push('Missing or invalid config');
        if (!Array.isArray(obj.sites)) errors.push('Missing or invalid sites array');
        if (!Array.isArray(obj.integrations)) errors.push('Missing or invalid integrations array');
        // Optional: injectedIconConfig presence
        if (obj.injectedIconConfig && typeof obj.injectedIconConfig !== 'object') errors.push('Invalid injectedIconConfig');
    }
    return { valid: errors.length === 0, errors };
}

/**
 * Build the backup/restore tab
 */
async function initialiseBackupForm(settings) {
    const container = $('<div class="grid gap-6 md:grid-cols-2"></div>');

    // Backup schema envelope constants
    const BACKUP_TYPE = 'servarr-autosearch-settings';
    const BACKUP_SCHEMA_VERSION = 1;

    // Backup card
    const backupCard = $('<div class="rounded-lg bg-white/5 border border-slate-700 shadow overflow-hidden flex flex-col"></div>')
        .append($('<div class="flex items-center gap-3 px-4 py-3 border-b border-slate-700"></div>')
            .append($('<i class="fa-solid fa-file-export text-indigo-400"></i>'))
            .append($('<h3 class="font-semibold text-base m-0">Backup settings</h3>')))
        .append($('<div class="p-4 space-y-3 text-sm"></div>')
            .append($('<p class="text-slate-300">Download a JSON backup of your current settings.</p>'))
            .append($('<div></div>')
                .append($('<button id="btnBackup" type="button" class="inline-flex items-center gap-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"></button>')
                    .append($('<i class="fa-solid fa-download"></i>'))
                    .append($('<span>Download backup</span>'))))
        );

    // Restore card
    const restoreCard = $('<div class="rounded-lg bg-white/5 border border-slate-700 shadow overflow-hidden flex flex-col"></div>')
        .append($('<div class="flex items-center gap-3 px-4 py-3 border-b border-slate-700"></div>')
            .append($('<i class="fa-solid fa-file-import text-emerald-400"></i>'))
            .append($('<h3 class="font-semibold text-base m-0">Restore settings</h3>')))
        .append($('<div class="p-4 space-y-3 text-sm"></div>')
            .append($('<p class="text-slate-300">Choose a previously saved JSON file to merge into your current settings.</p>'))
            .append($('<div class="flex items-center gap-3 flex-wrap"></div>')
                .append($('<input id="fileRestore" type="file" accept="application/json,.json" class="block w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-slate-700 file:text-white hover:file:bg-slate-600" />'))
                .append($('<button id="btnRestore" type="button" class="inline-flex items-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed" disabled></button>')
                    .append($('<i class="fa-solid fa-upload"></i>'))
                    .append($('<span>Restore</span>')))
                .append($('<button id="btnPreview" type="button" class="inline-flex items-center gap-2 rounded-md bg-slate-600 hover:bg-slate-500 text-white text-xs font-medium px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 disabled:opacity-60 disabled:cursor-not-allowed" disabled></button>')
                    .append($('<i class="fa-solid fa-eye"></i>'))
                    .append($('<span>Preview changes</span>'))))
            .append($('<label class="flex items-center gap-2 text-xs text-slate-300"></label>')
                .append($('<input type="checkbox" id="restore-replace" class="rounded border-slate-600 bg-slate-800" />'))
                .append($('<span>Replace existing settings instead of merging</span>')))
            .append($('<div id="restoreMessage" class="text-xs"></div>'))
            .append($('<div id="restoreDiff" class="hidden mt-2 rounded bg-black/30 border border-slate-700 p-2 max-h-60 overflow-auto text-[11px] font-mono whitespace-pre-wrap"></div>'))
        );

    container.append(backupCard, restoreCard);
    $('#backupOptionsForm').empty().append(container);

    // Utility: sanitize settings for export (remove any volatile/internal fields if ever added)
    function sanitizeSettingsForExport(obj) {
        // Deep clone via JSON (settings is JSON-safe)
        var clone;
        try { clone = JSON.parse(JSON.stringify(obj)); } catch (e) { clone = obj; }

        // Remove known internal/volatile placeholders if present (future-proof)
        // Convention: keys starting with '_' or '__' are internal and stripped
        function strip(o) {
            if (!o || typeof o !== 'object') return;
            if (Array.isArray(o)) {
                for (var i = 0; i < o.length; i++) strip(o[i]);
                return;
            }
            for (var k in o) {
                if (!o.hasOwnProperty(k)) continue;
                if (k && (k.charAt(0) === '_' || (k.length > 1 && k.substring(0,2) === '__'))) {
                    delete o[k];
                } else {
                    strip(o[k]);
                }
            }
        }
        strip(clone);
        return clone;
    }

    // Envelope helpers
    function makeBackupEnvelope(sanitizedSettings) {
        let manifestVersion = 'unknown';
        try {
            const manifest = browser && browser.runtime && browser.runtime.getManifest ? browser.runtime.getManifest() : null;
            if (manifest && manifest.version) manifestVersion = manifest.version;
        } catch (e) { /* ignore */ }
        return {
            type: BACKUP_TYPE,
            schemaVersion: BACKUP_SCHEMA_VERSION,
            exportedAt: new Date().toISOString(),
            appVersion: manifestVersion,
            data: sanitizedSettings
        };
    }

    async function parseBackupJsonText(text) {
        const result = { kind: 'unknown', settings: null, envelope: null, schemaVersion: null, errors: [], warnings: [] };
        let obj;
        try { obj = JSON.parse(text); } catch (e) {
            result.errors.push('Selected file is not valid JSON.');
            return result;
        }

        // Envelope path
        if (obj && typeof obj === 'object' && obj.type === BACKUP_TYPE && obj.data) {
            result.kind = 'envelope';
            result.envelope = obj;
            result.schemaVersion = (typeof obj.schemaVersion === 'number') ? obj.schemaVersion : 0;
            result.settings = obj.data;
            if (result.schemaVersion > BACKUP_SCHEMA_VERSION) {
                result.warnings.push('Backup file uses a newer schema (' + result.schemaVersion + ') than this extension supports (' + BACKUP_SCHEMA_VERSION + ').');
            } else if (result.schemaVersion < BACKUP_SCHEMA_VERSION) {
                result.warnings.push('Backup file uses an older schema (' + result.schemaVersion + '). It will be normalized on import.');
            }
            return result;
        }

        // Legacy plain settings path
        result.kind = 'legacy';
        result.settings = obj;
        result.schemaVersion = 0;
        result.warnings.push('Legacy backup without schema detected. Importing as-is.');
        return result;
    }

    // Download logic (export)
    $('#btnBackup').on('click', async function () {
        try {
            var current = await getSettings();
            var sanitized = sanitizeSettingsForExport(current);
            const envelope = makeBackupEnvelope(sanitized);
            const json = JSON.stringify(envelope, null, 2);
            const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const ts = new Date().toISOString().replace(/[:]/g, '-');
            a.href = url;
            a.download = `servarr-autosearch-settings-${ts}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error('Backup failed', e);
        }
    });

    // Enable restore button when a file is chosen
    const $file = $('#fileRestore');
    const $btnRestore = $('#btnRestore');
    const $msg = $('#restoreMessage');
    $file.on('change', function () {
        var hasFile = $file[0].files && $file[0].files.length;
        $btnRestore.prop('disabled', !hasFile);
        $('#btnPreview').prop('disabled', !hasFile);
        $msg.text('');
        $('#restoreDiff').addClass('hidden').text('');
    });

    // Simple object diff for preview (reports added/removed/changed paths)
    function diffObjects(a, b, path, out) {
        path = path || '';
        out = out || [];
        if (a === b) return out;
        var aIsObj = a && typeof a === 'object';
        var bIsObj = b && typeof b === 'object';
        if (!aIsObj || !bIsObj) {
            // Primitive or type change
            out.push('~ ' + path + ': ' + JSON.stringify(a) + ' -> ' + JSON.stringify(b));
            return out;
        }
        // Arrays: compare by length and JSON if needed
        var aIsArr = Array.isArray(a), bIsArr = Array.isArray(b);
        if (aIsArr || bIsArr) {
            if (aIsArr !== bIsArr) {
                out.push('~ ' + path + ': (type) ' + (aIsArr ? 'array' : typeof a) + ' -> ' + (bIsArr ? 'array' : typeof b));
                return out;
            }
            if (a.length !== b.length || JSON.stringify(a) !== JSON.stringify(b)) {
                out.push('~ ' + path + ': array changed (len ' + a.length + ' -> ' + b.length + ')');
            }
            return out;
        }
        // Objects: keys union
        var seen = {};
        for (var ka in a) { if (a.hasOwnProperty(ka)) seen[ka] = true; }
        for (var kb in b) { if (b.hasOwnProperty(kb)) seen[kb] = true; }
        for (var k in seen) {
            var subPath = path ? (path + '.' + k) : k;
            if (!a.hasOwnProperty(k)) {
                out.push('+ ' + subPath + ': ' + JSON.stringify(b[k]));
            } else if (!b.hasOwnProperty(k)) {
                out.push('- ' + subPath + ': ' + JSON.stringify(a[k]));
            } else {
                diffObjects(a[k], b[k], subPath, out);
            }
        }
        return out;
    }

    async function renderPreview() {
        $('#restoreDiff').removeClass('hidden').text('Generating preview...');
        try {
            if (!$file[0].files || !$file[0].files.length) {
                $('#restoreDiff').text('No file selected.');
                return;
            }
            var file = $file[0].files[0];
            var text = await file.text();
            var parsed = await parseBackupJsonText(text);
            if (parsed.errors.length) { $('#restoreDiff').text(parsed.errors.join('\n')); return; }
            var candidate = parsed.settings;
            var v = validateSettingsShape(candidate);
            if (!v.valid) {
                $('#restoreDiff').text('Invalid settings file: ' + v.errors.join(', '));
                return;
            }
            var current = await getSettings();
            var replace = $('#restore-replace').prop('checked');
            var next = replace ? candidate : deepMerge(current, candidate);
            var lines = diffObjects(current, next, '', []);
            if (!lines.length) {
                $('#restoreDiff').text('No changes detected.');
            } else {
                $('#restoreDiff').text(lines.join('\n'));
            }
        } catch (e) {
            $('#restoreDiff').text('Failed to generate preview: ' + (e && e.message ? e.message : 'Unknown error'));
        }
    }

    $('#btnPreview').on('click', renderPreview);
    $('#restore-replace').on('change', function () {
        if (!$('#restoreDiff').hasClass('hidden')) { renderPreview(); }
    });

    // Restore logic
    $btnRestore.on('click', async function () {
        if (!$file[0].files || !$file[0].files.length) return;
        const file = $file[0].files[0];
        try {
            const text = await file.text();
            const parsed = await parseBackupJsonText(text);
            if (parsed.errors.length) { $msg.removeClass().addClass('text-xs text-rose-400').text(parsed.errors.join(', ')); return; }
            const candidate = parsed.settings;
            const { valid, errors } = validateSettingsShape(candidate);
            if (!valid) {
                $msg.removeClass().addClass('text-xs text-rose-400').text('Invalid settings file: ' + errors.join(', '));
                return;
            }
            // Confirm apply with schema warning if needed
            var confirmMsg = 'Apply settings from backup? This will ' + ($('#restore-replace').prop('checked') ? 'replace' : 'merge over') + ' your current configuration.';
            if (parsed.kind === 'envelope' && parsed.schemaVersion > BACKUP_SCHEMA_VERSION) {
                confirmMsg += '\n\nWarning: The backup file uses a newer schema (' + parsed.schemaVersion + ') than this extension supports (' + BACKUP_SCHEMA_VERSION + '). Attempt import anyway?';
            }
            if (!confirm(confirmMsg)) return;

            const current = await getSettings();
            const replace = $('#restore-replace').prop('checked');
            const next = replace ? candidate : deepMerge(current, candidate);
            await setSettings(next);
            $msg.removeClass().addClass('text-xs text-emerald-400').text('Settings restored successfully.');
        } catch (e) {
            console.error('Restore failed', e);
            $msg.removeClass().addClass('text-xs text-rose-400').text('Restore failed: ' + (e && e.message ? e.message : 'Unknown error'));
        }
    });
}

// Custom icon preview injection/removal
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
 * Build the toggle button
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
            .append($(`<button id="${site.id}ApiKeyTest" type="button" data-site-id="${site.id}" class="inline-flex items-center gap-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-3 py-2 shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">` +
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

// Update or create API status badge states
function updateStatusBadge(siteId, state, version) {
    const badge = $('#'+siteId+'StatusBadge');
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
 * Build the advanced settings tab
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
 * Update the advanced settings tab form fields from settings
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
 * Build the integrations tab
 */
var initialiseIntegrationsForm = function (settings) {
    const wrapper = $('<div class="grid gap-4 grid-cols-2 md:grid-cols-4 xl:grid-cols-6"></div>');

    $.each(settings.integrations, function (i, integration) {
        const card = $('<div class="relative rounded-lg bg-white/5 border border-slate-700 shadow overflow-hidden flex flex-col pt-2 px-2"></div>');

        if (integration.hasOwnProperty('warning')) {
            // Unified notice element: icon + label; icon/button triggers tooltip
            const notice = $(
                `<div class="absolute top-1 left-1 right-1">
                    <div class="relative flex items-center gap-1 bg-amber-600/20 border border-amber-500/40 text-amber-400 rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide select-none">
                        <button type="button" class="flex items-center gap-1 focus:outline-none" aria-describedby="card-warning-tooltip-${i}" aria-label="Integration notice warning">
                            <i class="fa-solid fa-exclamation-triangle"></i>
                            <span>NOTICE</span>
                        </button>
                        <div id="card-warning-tooltip-${i}" role="tooltip" class="hidden absolute z-20 top-full left-0 right-0 mt-1 w-full text-xs rounded-md bg-amber-600 text-white px-2 py-1 shadow-lg">${escapeHtml(integration.warning)}</div>
                    </div>
                </div>`
            );
            const btn = notice.find('button');
            const tip = notice.find(`#card-warning-tooltip-${i}`);
            btn.on('mouseover focus', () => tip.removeClass('hidden'))
               .on('mouseout blur', () => tip.addClass('hidden'));
            card.append(notice);
        }

        card.append($(`<div class="h-24 w-full bg-center bg-no-repeat bg-contain" style="background-image: url('content/assets/images/integrations/${integration.image}');"></div>`));
        const body = $('<div class="p-3 flex flex-col items-center gap-3 text-center"></div>')
            .append($(`<h4 class="text-sm font-semibold leading-tight">${integration.name}</h4>`))
            .append($(`<input type="checkbox" id="toggle-${integration.id}" class="hidden">`).prop('checked', integration.enabled));
        card.append(body);
        wrapper.append(card);
    });

    $('#integrationsOptionsForm').empty().prepend(wrapper);

    $.each(settings.integrations, function (i, integration) {
        const $toggle = $(`#toggle-${integration.id}`);
        initToggle($toggle, {}, setSettingsPropertiesFromIntegrationsForm);
    });
};

var getUnitFromOffset = (offset) => offset.match(/(?<amount>[\d|\.]+)(?<unit>.+)/i).groups.unit;

var getAmountFromOffset = (offset) => offset.match(/(?<amount>[\d|\.]+)(?<unit>.+)/i).groups.amount;

/**
 * Build the custom icon settings tab
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

    // Background colour
    const bgRow = $('<div class="space-y-2 flex gap-4"></div>')
        .append($('<div><label for="icon-background-color" class="font-medium pt-1">Icon background colour</label></div>'))
        .append($(`<input type="text" id="icon-background-color" data-coloris class=" text-white w-40 rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />`).val(settings.injectedIconConfig.backgroundColor));
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

    function syncEnabledDisabled() {
        const using = $('#toggle-use-custom-icon').prop('checked');
        const anchored = $('#toggle-icon-type').prop('checked');

        const enableAll = (sel, en) => {
            $(sel).each(function () { $(this).bootstrapToggle(en ? 'enable' : 'disable'); });
        };

        enableAll('#toggle-icon-type, #toggle-side, #toggle-position, #toggle-side-offset, #toggle-position-offset', using);
        $('#side-offset, #position-offset, #icon-background-color').prop('disabled', !using);

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
    $('#side-offset, #position-offset, #icon-background-color').on('input', setSettingsPropertiesFromCustomIconForm);

    document.addEventListener('coloris:pick', () => setSettingsPropertiesFromCustomIconForm());

    // Initial state sync
    syncEnabledDisabled();
};

/**
 * Build the context menu tab
 */
var initialiseContextMenuForm = function (settings) {
    const card = $('<div class="rounded-lg bg-white/5 border border-slate-700 shadow overflow-hidden"></div>');
    const header = $('<div class="flex items-center gap-3 px-4 py-3 border-b border-slate-700"></div>')
        .append($('<i class="fa-solid fa-mouse-pointer text-indigo-400"></i>'))
        .append($('<h3 class="font-semibold text-base m-0">Context menu</h3>'));
    const body = $('<div class="p-4 space-y-4 text-sm"></div>');

    if (browser.contextMenus) {
        const row = $('<div class="flex items-start justify-between gap-4"></div>')
            .append($('<div class="flex-1"></div>')
                .append($('<label for="toggle-context-menu" class="font-medium">Enable context menu</label>'))
                .append($('<p class="mt-1 text-xs text-slate-400">Adds a right-click option to send highlighted text directly to your configured Servarr instance search.</p>')))
            .append($('<div class="w-28 flex-shrink-0"></div>')
                .append($('<input type="checkbox" id="toggle-context-menu" class="hidden">').prop('checked', settings.config.contextMenu))
            );
        body.append(row);
    } else {
        body.append($('<p class="text-xs text-red-400">Context menus are not supported in this browser.</p>'));
    }

    card.append(header, body);
    $('#contextMenuOptionsForm').empty().append(card);

    if (browser.contextMenus) {
        initToggle('#toggle-context-menu', {}, setSettingsPropertiesFromContextMenuForm);
    }
};

/**
 * Build the debug tab
 */
var initialiseDebugForm = function (settings) {
    const waitForElTicks = [100,200,300,400,500];
    const maxAttemptsTicks = [10,20,30,40,50];

    const card = $('<div class="rounded-lg bg-white/5 border border-slate-700 shadow overflow-hidden"></div>');
    const header = $('<div class="flex items-center gap-3 px-4 py-3 border-b border-slate-700"></div>')
        .append($('<i class="fa-solid fa-bug text-indigo-400"></i>'))
        .append($('<h3 class="font-semibold text-base m-0">Debug & timing</h3>'));
    const body = $('<div class="p-4 space-y-8 text-sm"></div>');

    // Logging toggle
    const loggingRow = $('<div class="flex items-start justify-between gap-4"></div>')
        .append($('<div class="flex-1"></div>')
            .append($('<label for="toggle-debug" class="font-medium">Turn on console logging</label>'))
            .append($('<p class="mt-1 text-xs text-slate-400">Outputs verbose diagnostic information to the browser console.</p>')))
        .append($('<div class="w-28 flex-shrink-0"></div>')
            .append($('<input type="checkbox" id="toggle-debug" class="hidden">').prop('checked', settings.config.debug))
        );
    body.append(loggingRow);

    // Range control factory
    function buildRange(id, label, ticks, value, min, max, step, unitHelp) {
        const container = $('<div class="space-y-2"></div>');
        container.append($(`<label for="${id}" class="font-medium">${label}</label>`));
        const sliderWrap = $('<div class="space-y-1"></div>');
        const input = $(`<input type="range" id="${id}" class="w-full accent-indigo-600" />`) // accent color for supported browsers
            .attr({ min: min, max: max, step: step, value: value });
        const valueLine = $(`<div class="flex justify-between text-[11px] font-mono text-slate-400"></div>`);
        // tick labels
        ticks.forEach(t => valueLine.append($(`<span>${t}</span>`)));
        const liveValue = $(`<div id="${id}Live" class="text-xs font-medium text-indigo-400">${value}</div>`);
        sliderWrap.append(input, valueLine, liveValue);
        if (unitHelp) sliderWrap.append($(`<p class="text-[11px] text-slate-400">${unitHelp}</p>`));
        container.append(sliderWrap);
        return container;
    }

    const waitRange = buildRange('waitForEl', 'Input search element wait time between attempts (ms)', waitForElTicks, settings.config.searchInputWaitForMs, waitForElTicks[0], waitForElTicks[waitForElTicks.length-1], 100, 'Shorter times attempt DOM lookup more aggressively.');
    const attemptsRange = buildRange('maxAttempts', 'Input search element max attempts', maxAttemptsTicks, settings.config.searchInputMaxAttempts, maxAttemptsTicks[0], maxAttemptsTicks[maxAttemptsTicks.length-1], 10, 'Controls how many times the search field will be queried.');

    body.append($('<div class="space-y-6"></div>').append(waitRange, attemptsRange));

    // Total time summary
    const total = settings.config.searchInputMaxAttempts * settings.config.searchInputWaitForMs;
    const totalSummary = $(`<div class="rounded-md bg-white/10 px-3 py-2 text-xs flex items-center justify-between">
        <span>Total search input element lookup time</span>
        <span id="totalTimeSpan" class="font-semibold">${total} ms</span>
    </div>`);
    body.append(totalSummary);

    card.append(header, body);
    $('#debugOptionsForm').empty().append(card);

    // Toggle init
    initToggle('#toggle-debug', {}, setSettingsPropertiesFromDebugForm);

    function recompute() {
        const wait = parseInt($('#waitForEl').val(), 10);
        const attempts = parseInt($('#maxAttempts').val(), 10);
        $('#waitForElLive').text(wait);
        $('#maxAttemptsLive').text(attempts);
        $('#totalTimeSpan').text(`${wait * attempts} ms`);
        setSettingsPropertiesFromDebugForm();
    }

    $('#waitForEl, #maxAttempts').on('input change', recompute);
};

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

/**
 * Update settings from the integrations tab form fields
 */
async function setSettingsPropertiesFromIntegrationsForm() {
    const settings = await getSettings();

    for (let i = 0; i < settings.integrations.length; i++) {
        settings.integrations[i].enabled = $(`#toggle-${settings.integrations[i].id}`).prop('checked');
    }

    await setSettings(settings);
}

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
 * Update settings from the context menu form fields
 */
async function setSettingsPropertiesFromContextMenuForm() {
    const settings = await getSettings();

    const $menu = $('#toggle-context-menu');
    // Only update if the element exists (Firefox MV2 vs MV3 differences or future conditional rendering)
    if ($menu.length) {
        const newVal = $menu.prop('checked');
        if (settings.config.contextMenu !== newVal) {
            console.log('[ServarrExt] Updating contextMenu setting ->', newVal);
        }
        settings.config.contextMenu = newVal;
    } else {
        // Fallback to false if toggle not present
        settings.config.contextMenu = false;
    }

    await setSettings(settings);
}

/**
 * Update settings from the debug tab form fields
 */
async function setSettingsPropertiesFromDebugForm() {
    const settings = await getSettings();

    settings.config.debug = $('#toggle-debug').prop('checked');
    settings.config.searchInputWaitForMs = parseInt($('#waitForEl').val());
    settings.config.searchInputMaxAttempts = parseInt($('#maxAttempts').val());

    await setSettings(settings);
}

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

    // If user reloads page while custom icon tab is initially active (e.g., deep link in future) ensure Coloris loads.
    if (document.querySelector('#tab-custom-icon[aria-selected="true"]')) {
        ensureColoris();
    }

    // Signal to tests that options initialisation finished.
    window.__optionsReady = true;
});