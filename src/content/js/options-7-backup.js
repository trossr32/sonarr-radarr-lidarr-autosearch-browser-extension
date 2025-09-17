/**
 * Build the backup/restore tab
 * @param {Setting} settings The current settings object
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
                out.push(`+ ${subPath}: ${JSON.stringify(b[k])}`);
            } else if (!b.hasOwnProperty(k)) {
                out.push(`- ${subPath}: ${JSON.stringify(a[k])}`);
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

/**
 * Deep merge utility (non-destructive). Arrays are replaced; objects merged.
 * @param {Object} target
 * @param {Object} source
 * @returns {Object} New merged object
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
 * @param {Object} obj
 * @returns {Object} { valid: boolean, errors: string[] }
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