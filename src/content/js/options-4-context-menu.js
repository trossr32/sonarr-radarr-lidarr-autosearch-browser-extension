/**
 * Build the context menu tab
 * @param {Setting} settings The current settings object
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
        body.append($('<p class="text-xs text-rose-400">Context menus are not supported in this browser.</p>'));
    }

    card.append(header, body);
    $('#contextMenuOptionsForm').empty().append(card);

    if (browser.contextMenus) {
        initToggle('#toggle-context-menu', {}, setSettingsPropertiesFromContextMenuForm);
    }
};

/**
 * Update settings from the context menu form fields
 */
async function setSettingsPropertiesFromContextMenuForm() {
    const settings = await getSettings();

    const $menu = $('#toggle-context-menu');

    // Only update if the element exists (Firefox MV2 vs MV3 differences)
    if ($menu.length) {
        const newVal = $menu.prop('checked');

        settings.config.contextMenu = newVal;
    } else {
        // Fallback to false if toggle not present
        settings.config.contextMenu = false;
    }

    await setSettings(settings);
}