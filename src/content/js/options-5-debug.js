/**
 * Build the debug tab
 * @param {Setting} settings The current settings object
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
 * Update settings from the debug tab form fields
 */
async function setSettingsPropertiesFromDebugForm() {
    const settings = await getSettings();

    settings.config.debug = $('#toggle-debug').prop('checked');
    settings.config.searchInputWaitForMs = parseInt($('#waitForEl').val());
    settings.config.searchInputMaxAttempts = parseInt($('#maxAttempts').val());

    await setSettings(settings);
}