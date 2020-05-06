var settingsPort = chrome.runtime.connect({ name: 'settings' }),
    iconPort = chrome.runtime.connect({ name: 'icon' });

var setEnabledDisabledButtonState = function(settings) {
    if (settings.enabled) {
        $('#toggleActive').removeClass('btn-success btn-danger').addClass('btn-danger');
        $('#toggleActive').html('<span class="glyphicon glyphicon-off"></span> Disable');
    } else {
        $('#toggleActive').removeClass('btn-success btn-danger').addClass('btn-success');
        $('#toggleActive').html('<span class="glyphicon glyphicon-off"></span> Enable');
    }
};

settingsPort.onMessage.addListener(function (response) {
    var settings = response.settings;

    switch (response.request.caller) {
        case 'initPopup':
            setEnabledDisabledButtonState(settings);
            break;
        case 'enableDisable':
            // update enabled setting
            settings.enabled = !settings.enabled;

            settingsPort.postMessage({ method: 'set', caller: 'setFields', settings: settings });

            // update popup ui
            setEnabledDisabledButtonState(settings);

            // update icon
            iconPort.postMessage({ x: "y" });

            // remove context menus
            break;
    }
});

$(function () {
    // initialise page on load
    settingsPort.postMessage({ method: 'get', caller: 'initPopup' });
    
    $('#toggleActive').click(function(e) {
        settingsPort.postMessage({ method: 'get', caller: 'enableDisable' });
    });

    $('#btnSettings').click(function() {
        chrome.runtime.openOptionsPage(); // add open flag in settings?
    });
});