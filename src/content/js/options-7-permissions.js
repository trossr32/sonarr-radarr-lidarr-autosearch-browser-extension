async function initialisePermissionsForm(settings) {
    'use strict';

    // Normalisation state (populated after we read the manifest)
    let _apiMandatorySet = new Set(); // API permission names declared in manifest
    let _hostMandatorySet = new Set(); // Host patterns declared (MV3 host_permissions or MV2 filtered)
    let _hostOptionalSet = new Set(); // Host patterns declared as optional (MV2 optional_permissions or MV3 optional_host_permissions)

    function isHostPattern(p) {
        return typeof p === 'string' && (
            p === '<all_urls>' || /^(https?|file|ftp|\*):\/\//i.test(p)
        );
    }

    // Cross-browser helpers (Chrome/Firefox with browser-polyfill)
    function getBrowserRuntime() {
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

    function isPromiseStyle(fn) {
        try { return typeof fn === 'function' && fn.length === 0; }
        catch (_) { return false; }
    }

    function permGetAll() {
        var rt = getBrowserRuntime();
        if (!rt || !rt.permissions) {
            return Promise.resolve({ permissions: [], origins: [] });
        }

        return new Promise(function (res) {
            try {
                if (isPromiseStyle(rt.permissions.getAll)) {
                    rt.permissions.getAll().then(function (all) {
                        res(all || { permissions: [], origins: [] });
                    }).catch(function () { res({ permissions: [], origins: [] }); });
                } else {
                    rt.permissions.getAll(function (all) {
                        res(all || { permissions: [], origins: [] });
                    });
                }
            } catch (_) {
                res({ permissions: [], origins: [] });
            }
        });
    }

    function permRemovePermissions(perms) {
        var rt = getBrowserRuntime();
        if (!rt || !rt.permissions) { return Promise.resolve(false); }

        return new Promise(function (res) {
            var req = { permissions: perms };
            try {
                if (isPromiseStyle(rt.permissions.remove)) {
                    rt.permissions.remove(req).then(function (ok) { res(!!ok); }).catch(function () { res(false); });
                } else {
                    rt.permissions.remove(req, function (ok) { res(Boolean(ok)); });
                }
            } catch (_) { res(false); }
        });
    }

    function permRemoveOrigins(origins) {
        var rt = getBrowserRuntime();
        if (!rt || !rt.permissions) { return Promise.resolve(false); }

        return new Promise(function (res) {
            var req = { origins: origins };
            try {
                if (isPromiseStyle(rt.permissions.remove)) {
                    rt.permissions.remove(req).then(function (ok) { res(!!ok); }).catch(function () { res(false); });
                } else {
                    rt.permissions.remove(req, function (ok) { res(Boolean(ok)); });
                }
            } catch (_) { res(false); }
        });
    }

    // Manifest & matching helpers
    function getManifest() {
        var rt = getBrowserRuntime();
        try { return rt && rt.runtime && typeof rt.runtime.getManifest === 'function' ? rt.runtime.getManifest() : {}; }
        catch (_) { return {}; }
    }

    function escapeRegex(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Revised mandatory tests use the normalised sets if populated
    function isOriginMandatory(origin) {
        if (_hostMandatorySet.size) {
            return _hostMandatorySet.has(origin);
        }
        return false;
    }

    function isApiPermMandatory(name) {
        if (_apiMandatorySet.size) {
            return _apiMandatorySet.has(name);
        }
        return false;
    }

    // Simple text for why each API permission is needed
    var permissionDescriptions = {
        scripting: 'Inject and run content scripts (engines) on matching pages when needed.',
        storage: 'Save and load your extension settings and state.',
        activeTab: 'Run on the current tab when you click the toolbar/popup.',
        contextMenus: `Add the right-click 'Search in Servarr' menu.`,
        menus: `Add the right-click 'Search in Servarr' menu.`
    };

    function getOriginPermissionInfo(origin, settings) {
        // Try to recognize user Servarr instances
        try {
            var sites = (settings && settings.sites) || [];
            for (var i = 0; i < sites.length; i++) {
                var domain = String(sites[i].domain || '').replace(/\/+$/, '');
                
                if (!domain) { continue; }
                
                var regex = new RegExp('^https?:\\/\\/' + escapeRegex(domain.replace(/^https?:\/\//i, '')) + '(?:\/|$)', 'i');
                var oNorm = String(origin).replace(/\/\*$/, '/');

                if (regex.test(oNorm)) { return 'Your Servarr instance'; }
            }
        } catch (_) { /* ignore */ }

        if (origin === 'file:///*') {
            return `Access to local files (controlled by the browser's 'Allow access to file URLs' toggle). Not required for backup/restore uploads.`;
        }
        
        if (origin === '<all_urls>' || origin === '&lt;all_urls&gt;') {
            return 'Wildcard access to all URLs.';
        }

        return 'Integration site';
    }

    // ---------------------------------------------------------------------
    // UI builders
    // ---------------------------------------------------------------------
    function badgeMandatory(text) {
        return `<span class="inline-flex items-center rounded-md bg-slate-700/60 text-slate-200 text-xs font-medium px-2 py-1 border border-slate-600">${text || 'Mandatory'}</span>`;
    }

    function btnRevoke(attr, value) {
        return `<button type="button" 
            class="revokeBtn inline-flex items-center gap-2 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium px-3 py-1 focus:outline-none cursor-pointer" data-${attr}="${String(value).replace(/"/g, '&quot;')}">
            <i class="fa-solid fa-circle-xmark"></i><span>Revoke</span>
            </button>`;
    }

    function row(name, reason, actionHtml, sectionClass) {
        return (
            `<div class="${sectionClass} flex items-start justify-between gap-4 p-3 rounded-md bg-white/5 border border-slate-700">
                <div class="min-w-0">
                    <div class="font-medium text-sm text-white truncate">${escapeHtml(name)}</div>
                    <div class="text-xs text-slate-300 mt-1">${escapeHtml(reason)}</div>
                </div>
                <div class="flex-shrink-0">${actionHtml}</div>
            </div>`
        );
    }

    const noOptionalHostsRow = `<div class="flex items-start justify-between gap-4 p-3 rounded-md text-white bg-rose-600/20 border border-rose-600">
                                    <div class="min-w-0">
                                        <div class="font-medium text-sm truncate">No optional hosts permissions found</div>
                                        <div class="text-sm mt-1">
                                            <p>In order for this extension to work on your servarr pages, it requires permissions for your servarr URLs.</p>
                                            <p>If you haven't done so already, add your Servarr instance(s) in the Settings tab with the correct domain. Either:</p>
                                            <ul class="list-disc list-inside mt-1">
                                                <li>Add an API key and click the 'Test' button to grant permissions</li>
                                                <li>Click the 'Grant' button to grant permissions</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>`;
    
    function buildPermissionsUI(container, all, manifest, settings) {
        container.empty();

        // Host: optional (granted at runtime)
        container.append(
            `<div class="rounded-lg bg-white/5 border border-slate-700 shadow">
                <div class="px-4 py-3 border-b border-slate-700">
                    <h3 class="font-semibold m-0 text-sm">Optional host permissions</h3>
                </div>
                <div id="permHostOptionalList" class="p-3 space-y-2"></div>
            </div>`
        );

        // API section
        container.append(
            `<div class="rounded-lg bg-white/5 border border-slate-700 shadow mb-4">
                <div class="px-4 py-3 border-b border-slate-700">
                    <h3 class="font-semibold m-0 text-sm">API permissions (mandatory)</h3>
                </div>
                <div id="permApiList" class="p-3 space-y-2"></div>
            </div>`
        );

        // Host: mandatory (from manifest.host_permissions or filtered MV2 permissions)
        container.append(
            `<div class="rounded-lg bg-white/5 border border-slate-700 shadow mb-4">
                <div class="px-4 py-3 border-b border-slate-700">
                    <h3 class="font-semibold m-0 text-sm">Site integration host permissions (mandatory)</h3>
                </div>
                <div id="permHostMandatoryList" class="p-3 space-y-2"></div>
            </div>`
        );

        var apiWrap = $('#permApiList');
        var hostMandatoryWrap = $('#permHostMandatoryList');
        var hostOptionalWrap = $('#permHostOptionalList');

        // API permissions (filter out any host patterns that might have slipped into all.permissions on some platforms)
        var api = (all.permissions || []).filter(function(p){ return !isHostPattern(p); });
        if (!api.length) {
            apiWrap.append('<div class="text-xs text-slate-400">None.</div>');
        } else {
            for (var i = 0; i < api.length; i++) {
                var name = api[i];
                var mandatory = isApiPermMandatory(name, manifest);
                var reason = permissionDescriptions[name] || 'Required by the extension.';
                var action = mandatory ? badgeMandatory() : btnRevoke('api', name);

                apiWrap.append(row(name, reason, action, 'api-row'));
            }
        }

        // Host permissions
        var origins = all.origins || [];
        if (!origins.length) {
            hostMandatoryWrap.append('<div class="text-xs text-slate-400">None.</div>');
            hostOptionalWrap.append('<div class="text-xs text-slate-400">None.</div>');
        } else {
            let optionalHostsFound = false;

            for (var j = 0; j < origins.length; j++) {
                var origin = origins[j];

                log(`Processing origin: ${origin}`);

                var displayOrigin = origin;
                var mandatoryOrigin = isOriginMandatory(origin, manifest);
                var reasonText = getOriginPermissionInfo(displayOrigin, settings);

                if (origin === 'file:///*') {
                    var toggleBadge = badgeMandatory('Browser toggle');
                    hostOptionalWrap.append(row(displayOrigin, reasonText, toggleBadge, 'file-origin-row'));
                    continue;
                }

                if (mandatoryOrigin) {
                    hostMandatoryWrap.append(row(displayOrigin, reasonText, badgeMandatory(), 'host-mandatory-row'));
                } else {
                    hostOptionalWrap.append(row(displayOrigin, reasonText, btnRevoke('origin', origin), 'host-optional-row'));
                    optionalHostsFound = true;
                }
            }

            if (!optionalHostsFound) { hostOptionalWrap.append(noOptionalHostsRow); }
        }

        // Wire revoke buttons
        container.off('click', '.revokeBtn').on('click', '.revokeBtn', function (e) {
            e.preventDefault();
            var $btn = $(this);
            var apiName = $btn.data('api');
            var originName = $btn.data('origin');

            var $row = $btn.closest('.flex');
            var $list = $('#permHostOptionalList');

            $btn.prop('disabled', true).addClass('opacity-60');

            function afterRevoke(ok) {
                if (ok) {
                    $row.remove();

                    var remaining = $list.children('.host-optional-row').length;
                    log(['#permHostOptionalList', remaining]);

                    if (remaining === 0) {
                        $list.append(noOptionalHostsRow);
                    }

                    getSettings().then(function (settings) {
                        initialiseBasicForm(settings);
                    });
                } else {
                    $btn.prop('disabled', false).removeClass('opacity-60');
                }
            }

            if (apiName) {
                permRemovePermissions([String(apiName)]).then(afterRevoke);
            } else if (originName) {
                permRemoveOrigins([String(originName)]).then(afterRevoke);
            } else {
                $btn.prop('disabled', false).removeClass('opacity-60');
            }
        });
    }

    function initPermissionsTab() {
        var $form = $('#permissionsOptionsForm');
        if (!$form.length) { return; }

        // Load current settings (to label Servarr instance origins nicely)
        getSettings().then(function (settings) {
            return Promise.all([ Promise.resolve(settings), permGetAll() ]);
        }).then(function (pair) {
            var settings = pair[0];
            var all = pair[1];
            var manifest = getManifest();

            // Manifest normalisation (MV2 vs MV3)
            try {
                var mv = manifest && manifest.manifest_version || 2;
                var rawPerms = Array.isArray(manifest.permissions) ? manifest.permissions.slice() : [];
                var rawHostPerms = Array.isArray(manifest.host_permissions) ? manifest.host_permissions.slice() : [];
                var rawOptPerms = Array.isArray(manifest.optional_permissions) ? manifest.optional_permissions.slice() : [];
                var rawOptHostPerms = Array.isArray(manifest.optional_host_permissions) ? manifest.optional_host_permissions.slice() : [];

                if (mv >= 3) {
                    // MV3: host permissions separated
                    rawHostPerms.forEach(p => { if (isHostPattern(p)) _hostMandatorySet.add(p); });
                    rawPerms.forEach(p => { if (!isHostPattern(p)) _apiMandatorySet.add(p); });
                    rawOptHostPerms.forEach(p => { if (isHostPattern(p)) { _hostOptionalSet.add(p); _hostMandatorySet.delete(p); } });
                } else {
                    // MV2 (Firefox): host patterns live inside permissions; optional host perms inside optional_permissions
                    rawPerms.forEach(p => {
                        if (isHostPattern(p)) { _hostMandatorySet.add(p); }
                        else { _apiMandatorySet.add(p); }
                    });
                    rawOptPerms.forEach(p => {
                        if (isHostPattern(p)) { _hostOptionalSet.add(p); _hostMandatorySet.delete(p); }
                        else { /* optional API perms (rare) are ignored here */ }
                    });
                }
            } catch (e) {
                log(['Manifest normalisation failed', e], 'warn');
            }

            log(['Building permissions UI', settings, all, manifest, {
                apiMandatory: Array.from(_apiMandatorySet),
                hostMandatory: Array.from(_hostMandatorySet),
                hostOptional: Array.from(_hostOptionalSet)
            }]);

            buildPermissionsUI($form, all, manifest, settings);
        }).catch(function (e) {
            log(['Failed to build permissions UI', e], 'error');
        });
    }

    initPermissionsTab();
}
