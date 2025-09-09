var iconPort = browser.runtime.connect({ name: 'icon' });

var initialiseEnabledDisabledButton = function(settings) {
    $('#toggleActive').removeClass('btn-success btn-danger').addClass(`btn-${(settings.config.enabled ? 'danger' : 'success')}`);
    $('#toggleActive').html(`<i class="fas fa-power-off"></i>&nbsp;&nbsp;&nbsp;&nbsp;${(settings.config.enabled ? 'Disable' : '&nbsp;Enable')}`);
    iconPort.postMessage({ x: "y" });
};

browser.storage.onChanged.addListener(async function(changes, area) {
    let changedItems = Object.keys(changes);

    for (let item of changedItems) {
        if (item !== 'sonarrRadarrLidarrAutosearchSettings') {
            continue;
        }

        initialiseEnabledDisabledButton(changes[item].newValue);
    }
});

$(async function () {
    // initialise page on load
    const settings = await getSettings();

    initialiseEnabledDisabledButton(settings);

    $('#toggleActive').on('click', async function(e) {
        const settings = await getSettings();
        settings.config.enabled = !settings.config.enabled;
        await setSettings(settings);
    });

    const isFirefox = typeof InstallTrigger !== 'undefined';
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    if (isFirefox && !isAndroid) {
        $('#aSettings').on('click', function() {
            // Allow the window to open before closing the popup
            setTimeout(() => window.close(), 100);
        });
    } else {
        $('#aSettings').hide();
    }
    
    $('#btnSettings').on('click', async function() {
        if (isFirefox && isAndroid) {
            // Workaround for bug in Firefox Android
            await browser.tabs.create({ url: browser.runtime.getURL("options.html") });
        } else {
            await browser.runtime.openOptionsPage();
        }
        window.close();
    });
});