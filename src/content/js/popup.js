var iconPort = browser.runtime.connect({ name: 'icon' });

// Tailwind variant classes for enable/disable toggle (only state-specific classes)
const toggleVariant = {
    // Enabled (currently active) = show disable action => red
    enabled: ['bg-red-600', 'hover:bg-red-500', 'focus:ring-red-400'],
    // Disabled (currently inactive) = show enable action => emerald
    disabled: ['bg-emerald-600', 'hover:bg-emerald-500', 'focus:ring-emerald-400']
};

const allVariantClasses = toggleVariant.enabled.concat(toggleVariant.disabled).join(' ');

/**
 * Apply the correct classes and text to the enable/disable toggle button based on current state.
 * @param {Settings} settings 
 */
function applyToggleButtonState(settings) {
    const enabled = settings.config.enabled;
    const $btn = $('#toggleActive');
    const classesToAdd = enabled ? toggleVariant.enabled : toggleVariant.disabled;

    // Swap only the variant classes
    $btn.removeClass(allVariantClasses).addClass(classesToAdd.join(' '));

    $('#toggleActiveLabel').text(enabled ? 'Disable' : 'Enable');
    $btn.attr('data-state', enabled ? 'enabled' : 'disabled');
    iconPort.postMessage({ x: 'y' });
}

browser.storage.onChanged.addListener(async function(changes, area) {
    let changedItems = Object.keys(changes);

    for (let item of changedItems) {
        if (item !== 'sonarrRadarrLidarrAutosearchSettings') {
            continue;
        }

        applyToggleButtonState(changes[item].newValue);
    }
});

$(async function () {
    // initialise page on load
    const settings = await getSettings();
    applyToggleButtonState(settings);

    $('#toggleActive').on('click', async function() {
        const settings = await getSettings();
        settings.config.enabled = !settings.config.enabled;
        await setSettings(settings); // storage onChanged will update button
    });

    const isFirefox = typeof InstallTrigger !== 'undefined';
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isFirefox) {
        $('#buttonWrapper').removeClass('w-3/4 md:w-full').addClass('w-full');
    } else {
        $('#buttonWrapper').removeClass('w-full').addClass('w-3/4 md:w-full');
    }
    
    if (isFirefox && !isAndroid) {
        $('#firefoxDesktopSettings').on('click', function() {
            // Allow the window to open before closing the popup
            setTimeout(() => window.close(), 100);
        });

        $('#firefoxExtensionSettingsLabel').text('Settings (In add-ons manager)');
    } else {
        $('#firefoxDesktopSettings').hide();

        $('#firefoxExtensionSettingsLabel').text('Settings');
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