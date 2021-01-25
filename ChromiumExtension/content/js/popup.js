var iconPort = chrome.runtime.connect({ name: 'icon' });

var setEnabledDisabledButtonState = function(settings) {
    $('#toggleActive').removeClass('btn-success btn-danger').addClass('btn-' + (settings.enabled ? 'danger' : 'success'));
    $('#toggleActive').html('<i class="fas fa-power-off"></i>&nbsp;&nbsp;&nbsp;&nbsp;' + (settings.enabled ? 'Disable' : '&nbsp;Enable'));
};

$(function () {
    // initialise page on load
    getSettings(setEnabledDisabledButtonState);
    
    $('#toggleActive').click(function(e) {
        getSettings(function(settings) {
            // update enabled setting
            settings.enabled = !settings.enabled;

            setSettings(settings, function() {
                // update popup ui
                setEnabledDisabledButtonState(settings);

                // update icon
                iconPort.postMessage({ x: "y" });
            });            
        });
    });

    $('#btnSettings').click(function() {
        chrome.runtime.openOptionsPage(); // add open flag in settings?
    });
});