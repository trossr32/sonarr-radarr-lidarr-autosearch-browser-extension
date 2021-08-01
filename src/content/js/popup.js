var iconPort = browser.runtime.connect({ name: 'icon' });

var setEnabledDisabledButtonState = function(settings) {
    $('#toggleActive').removeClass('btn-success btn-danger').addClass(`btn-${(settings.config.enabled ? 'danger' : 'success')}`);
    $('#toggleActive').html(`<i class="fas fa-power-off"></i>&nbsp;&nbsp;&nbsp;&nbsp;${(settings.config.enabled ? 'Disable' : '&nbsp;Enable')}`);
};

$(async function () {
    // initialise page on load
    const settings = await getSettings();

    setEnabledDisabledButtonState(settings);
    
    $('#toggleActive').on('click', async function(e) {
        const settings = await getSettings();
        
        // update enabled setting
        settings.config.enabled = !settings.config.enabled;

        await setSettings(settings);

        // update popup ui
        setEnabledDisabledButtonState(settings);

        // update icon
        iconPort.postMessage({ x: "y" });
    });

    $('#btnSettings').on('click', async function() {
        await browser.runtime.openOptionsPage(); // add open flag in settings?
    });
});