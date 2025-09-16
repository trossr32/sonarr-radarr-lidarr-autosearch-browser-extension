/**
 * Build the integrations tab
 * @param {Setting} settings The current settings object
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