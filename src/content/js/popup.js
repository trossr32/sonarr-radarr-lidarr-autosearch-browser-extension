var iconPort = browser.runtime.connect({ name: 'icon' });

var setEnabledDisabledButtonState = function(settings) {
    $('#toggleActive').removeClass('btn-success btn-danger').addClass('btn-' + (settings.enabled ? 'danger' : 'success'));
    $('#toggleActive').html('<i class="fas fa-power-off"></i>&nbsp;&nbsp;&nbsp;&nbsp;' + (settings.enabled ? 'Disable' : '&nbsp;Enable'));
};

$(async function () {
    // initialise page on load
    const settings = await getSettings();
    setEnabledDisabledButtonState(settings);
    
    $('#toggleActive').click(async function(e) {
        const settings = await getSettings();
        // update enabled setting
        settings.enabled = !settings.enabled;

        await setSettings(settings);

        // update popup ui
        setEnabledDisabledButtonState(settings);

        // update icon
        iconPort.postMessage({ x: "y" });
    });

    $('#btnSettings').click(async function() {
        await browser.runtime.openOptionsPage(); // add open flag in settings?
    });
});