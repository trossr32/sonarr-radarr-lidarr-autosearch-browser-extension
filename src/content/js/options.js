var entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };

/**
 * Escape HTML chars in the supplied string using the declared entityMap
 * @param {string} string 
 * @returns {string}
 */
var escapeHtml = (string) =>
    String(string).replace(/[&<>"'`=\/]/g,
        function(s) {
            return entityMap[s];
        });

var title = (str) =>
    str.replace(/(^|\s)\S/g, function(t) { return t.toUpperCase(); });

/**
 * Shows the icon in the test button for the given site id where the suffix matches the end of the icon id; hides all other icons
 * @param {string} siteId - site identifier (sonarr /radarr / lidarr)
 * @param {string} suffix - suffix of the icon to show in the test button
 */
var setTestButtonIcon = function(siteId, suffix) {
    $.each(['', 'Worked', 'Failed', 'Progress'], function(i, x) {
        $(`#${siteId}ApiKeyIcon${x}`).css('display', (x === suffix ? 'block' : 'none'));
    });
};

/**
 * Build the settings tab
 */
var initialiseBasicForm = function (settings) {
    var wrapper = $('<div class="row"></div>');

    $.each(settings.sites, function (i, site) {
        wrapper
            .append($('<div class="col-md-6 col-12"></div>')
                .append($('<div class="card text-white bg-dark mb-3"></div>')
                    .append($('<div class="card-header"></div>')
                        .append($('<div style="float: left; margin: 0 10px 0 0;"></div>')
                            .append($(`<img src="content/assets/images/${site.id}/${title(site.id)}48.png" style="width: 30px; margin-right: 10px;" />`))
                        )
                        .append($(`<h4 style="float: left; margin-bottom: 0;">${title(site.id)}</h4>`))
                        .append($('<div style="float: right; width: 80px;"></div>')
                            .append($(`<input type="checkbox" id="toggle-${site.id}" data-site-id="${site.id}">`)
                                .prop('checked', site.enabled)
                            )
                        )
                    )
                    .append($('<div class="card-body" style="position: relative;"></div>')
                        .append($(`<div id="${site.id}Disabled" class="site-disabled" style="display: ${(site.enabled ? 'none': 'block')};"></div>`))
                        .append($('<div class="mb-3"></div>')
                            .append($(`<div for="${site.id}Domain" class="col-12"></div>`)
                                .append($('<label class="col-form-label">Protocol, domain and port</label>'))
                            )
                            .append($('<div class="row"></div>')
                                .append($('<div class="col-lg-7 col-12"></div>')
                                    .append($(`<input type="text" class="form-control" id="${site.id}Domain" placeholder="http://192.168.0.1:7357" data-site-id="${site.id}">`).val(site.domain))
                                )
                            )
                        )
                        .append($('<div class="mb-3"></div>')
                            .append($(`<div for="${site.id}ApiKey" class="col-12"></div>`)
                                .append($('<label class="col-form-label">API key</label>'))
                            )
                            .append($('<div class="row"></div>')
                                .append($('<div class="col-lg-7 col-8"></div>')
                                    .append($(`<input type="text" class="form-control" id="${site.id}ApiKey" data-site-id="${site.id}">`).val(site.apiKey))
                                )
                                .append($('<div class="col-lg-5 col-4"></div>')
                                    .append($(`<button id="${site.id}ApiKeyTest" type="button" class="btn btn-primary" data-site-id="${site.id}">` + 
                                        '<div style="float: left; margin-right: 10px;">Test</div>' + 
                                        `<div id="${site.id}ApiKeyIcon" style="float: left;"><i class="fab fa-cloudscale"></i></div>` + 
                                        `<div id="${site.id}ApiKeyIconWorked" style="float: left; display: none;"><i class="fas fa-check" style="color: lawngreen;"></i></div>` + 
                                        `<div id="${site.id}ApiKeyIconFailed" style="float: left; display: none;"><i class="fas fa-times" style="color: #dc3545;"></i></div>` + 
                                        `<div id="${site.id}ApiKeyIconProgress" class="spinner-grow text-light" role="status" style="height:1em; width: 1em; margin-top: 4px; float: left; display: none;"></div>` + 
                                        '</button>'))
                                )
                            )
                        )
                        .append($(`<div id="${site.id}ApiTestMessage" class="badge bg-success badge-notify" style="display: none;"></div>`))
                    )
                )
            );
    });

    wrapper
        .append($('<div class="col-md-6 col-12"></div>')
            .append($('<div class="card text-white bg-dark mb-3"></div>')
                .append($('<div class="card-header"></div>')
                    .append($('<div style="float: left; margin: 0 20px 0 0;"></div>')
                        .append($('<i class="fas fa-question-circle fa-2x" style=" width: 30px;"></i>'))
                    )
                    .append($('<h4 style="float: left; margin: 1px 0 0 0;">Info</h4>'))
                )
                .append($('<div class="card-body">' + 
                    '<p class="card-text">These settings configure how this extension will connect to your Sonarr, Radarr or Lidarr instances.</p>' +
                    '<p class="card-text">If an API key is entered and the \'Auto populate from API\' version is enabled on the advanced settings page then the advanced settings will be configured automatically. Auto population will only work if the API call works, otherwise default values will be used.</p>' + 
                    '</div>'))
            )
        );

    $('#generalOptionsForm').prepend(wrapper);

    $.each(settings.sites, function (is, site) {
        // initialise toggles
        $(`#toggle-${site.id}`).bootstrapToggle({
            on: 'Enabled',
            off: 'Disabled',
            onstyle: 'success',
            offstyle: 'danger',
            width: '100%',
            size: 'small'
        });

        // site enabled/disabled toggle change event
        $(`#toggle-${site.id}`).on('change', function() {
            $(`#${$(this).attr('data-site-id')}Disabled`).css('display', ($(this).prop('checked') ? 'none' : 'block'));

            setSettingsPropertiesFromForm();
        });

        // site form input events
        $.each(['Domain', 'ApiKey'], function (iv, v) {
            $(`#${site.id}${v}`).on('input', setSettingsPropertiesFromForm);
        });
    
        // api key test buttons
        $(`#${site.id}ApiKeyTest`).on('click', async function () {
            var siteId = $(this).attr('data-site-id');
    
            setTestButtonIcon(siteId, 'Progress');

            $(`#${site.id}ApiTestMessage`).hide();

            const response = await callApi({ siteId: siteId, endpoint: 'Version' });
            
            if (response.success) {
                setTestButtonIcon(siteId, "Worked");

                $(`#${site.id}ApiTestMessage`)
                    .removeClass('bg-danger')
                    .addClass('bg-success')
                    .html(`Success! Detected version ${response.data.version}`)
                    .show();

                const settings = await getSettings();
                
                updateAdvancedForm(settings);
            } else {
                setTestButtonIcon(siteId, "Failed");
                
                $(`#${site.id}ApiTestMessage`)
                    .removeClass('bg-success')
                    .addClass('bg-danger')
                    .html('Failed, please double check the domain and API key')
                    .show();
            }

            // alert?
        });
    }); 
};

/**
 * Build the advanced settings tab
 */
var initialiseAdvancedForm = function (settings) {
    var wrapper = $('<div class="row"></div>');

    $.each(settings.sites, function (i, site) {
        wrapper
            .append($('<div class="col-md-6 col-12"></div>')
                .append($('<div class="card text-white bg-dark mb-3"></div>')
                    .append($('<div class="card-header"></div>')
                        .append($('<div style="float: left; margin: 0 10px 0 0;"></div>')
                            .append($(`<img src="content/assets/images/${site.id}/${title(site.id)}48.png" style="width: 30px; margin-right: 10px;" />`))
                        )
                        .append($(`<h4 style="float: left; margin-bottom: 0;">${title(site.id)}</h4>`))
                        .append($('<div style="float: right; width: 180px;"></div>')
                            .append($(`<input type="checkbox" id="toggle-${site.id}-advanced" data-site-id="${site.id}">`)
                                .prop('checked', site.autoPopAdvancedFromApi)
                            )
                        )
                    )
                    .append($('<div class="card-body" style="position: relative;"></div>')
                    .append($(`<div id="${site.id}DisabledAdvanced" class="site-disabled" style="display: ${(site.autoPopAdvancedFromApi ? 'block': 'none')};"></div>`))
                        .append($('<div class="mb-3"></div>')
                            .append($(`<div for="${site.id}SearchPath" class="col-12"></div>`)
                                .append($('<label class="col-form-label">Search path URL</label>'))
                            )
                            .append($('<div class="row"></div>')
                                .append($('<div class="col-lg-7 col-12"></div>')
                                    .append($(`<input type="text" class="form-control" id="${site.id}SearchPath" aria-describedby="${site.id}SearchPathHelp" data-site-id="${site.id}">`).val(site.searchPath))
                                )
                                .append($(`<div class="col-12 form-text" id="${site.id}SearchPathHelp">This is the search path used to search for add new content in this instance, following your instance url/ip.</div>`))
                            )
                        )
                        .append($('<div class="mb-3"></div>')
                            .append($(`<div for="${site.id}SearchInputSelector" class="col-12"></div>`)
                                .append($('<label class="col-form-label">Search field selector</label>'))
                            )
                            .append($('<div class="row"></div>')
                                .append($('<div class="col-lg-7 col-12"></div>')
                                    .append($(`<input type="text" class="form-control" id="${site.id}SearchInputSelector" aria-describedby="${site.id}SearchInputSelectorHelp" data-site-id="${site.id}">`).val(site.searchInputSelector))
                                )
                                .append($(`<div class="col-12 form-text" id="${site.id}SearchInputSelectorHelp">This is the jquery selector used to find the search input form field for this instance.</div>`))
                            )
                        )
                    )
                )
            );
    });

    wrapper
        .append($('<div class="col-md-6 col-12"></div>')
            .append($('<div class="card text-white bg-dark mb-3"></div>')
                .append($('<div class="card-header"></div>')
                    .append($('<div style="float: left; margin: 0 20px 0 0;"></div>')
                        .append($('<i class="fas fa-project-diagram fa-2x" style=" width: 30px;"></i>'))
                    )
                    .append($('<h4 style="float: left; margin: 1px 0 0 0;">Version config</h4>'))
                )
                .append($('<ul class="list-group list-group-flush"></ul>')
                    .append($('<li class="list-group-item pt-3 pb-5">' + 
                        '<h5 class="card-title pb-4">Sonarr version config</h5>' + 
                        '<p class="card-text">These settings are defaulted to v3.<i>n</i>. For v2.<i>n</i> use:</p>' +
                        '<p class="card-text">Search path url: <b>/addseries/</b></p>' +
                        '<p class="card-text">Search field selector: <b>.add-series-search .x-series-search</b></p>' +
                        '</li>'))
                    .append($('<li class="list-group-item pt-3 pb-5">' + 
                        '<h5 class="card-title pb-4">Radarr version config</h5>' + 
                        '<p class="card-text">These settings are defaulted to v3.<i>n</i>. For v0.<i>n</i> use:</p>' +
                        '<p class="card-text">Search path url: <b>/addmmovies/</b></p>' +
                        '<p class="card-text">Search field selector: <b>.add-movies-search .x-movies-search</b></p>' +
                        '</li>'))
                    .append($('<li class="list-group-item pt-3 pb-5">' + 
                        '<h5 class="card-title pb-4">Lidarr version config</h5>' + 
                        '<p class="card-text">As of v0.8.0.1881 the default settings should be used. If this is not a new install you may need to amend to:</p>' +
                        '<p class="card-text">Search path url: <b>/add/search/</b></p>' +
                        '<p class="card-text">Search field selector: <b>input[name="searchBox"]</b></p>' +
                        '</li>'))
                )
            )
        );

    $('#advancedOptionsForm').append(wrapper);

    $.each(settings.sites, function (is, site) {
        // initialise toggles
        $(`#toggle-${site.id}-advanced`).bootstrapToggle({
            on: 'Auto populate from API',
            off: 'Prevent auto populate',
            onstyle: 'success',
            offstyle: 'danger',
            width: '100%',
            size: 'small'
        });

        // site enabled/disabled toggle change event
        $(`#toggle-${site.id}-advanced`).on('change', function() {
            $(`#${$(this).attr('data-site-id')}DisabledAdvanced`).css('display', ($(this).prop('checked') ? 'block' : 'none'));

            setSettingsPropertiesFromAdvancedForm();
        });

        // site form input events
        $.each(['SearchPath', 'SearchInputSelector'], function (iv, v) {
            $(`#${site.id}${v}`).on('input', setSettingsPropertiesFromAdvancedForm);
        });
    }); 
};

/**
 * Update the advanced settings tab form fields from settings
 */
var updateAdvancedForm = function (settings) {
    $.each(settings.sites, function (is, site) {
        if ($(`#toggle-${site.id}-advanced`).prop('checked')) {
            $(`#${site.id}SearchPath`).val(site.searchPath);
            $(`#${site.id}SearchInputSelector`).val(site.searchInputSelector);
        }
    }); 
};

/**
 * Build the integrations tab
 */
var initialiseIntegrationsForm = function (settings) {
    let wrapper = $('<div class="row row-cols-2 row-cols-md-4 row-cols-xl-6"></div>');

    $.each(settings.integrations, function (i, integration) {
        wrapper
            .append(
                $('<div class="col p-3"></div>')
                    .append($('<div class="card text-white bg-dark mb-3"></div>')
                        .append($(`<div class="card-img-top card-integration" style="background: url('content/assets/images/integrations/${integration.image}') center/100% no-repeat;"></div>`))
                        .append($('<div class="card-body" style="text-align: center;"></div>')
                            .append($(`<h5 class="card-title mb-4">${integration.name}</h5>`))
                            .append($(`<input type="checkbox" id="toggle-${integration.id}">`).prop('checked', integration.enabled))
                        )
                    )
            );
    });

    $('#integrationsOptionsForm').prepend(wrapper);

    // enable toggles
    $.each(settings.integrations, function (i, integration) {
        $(`#toggle-${integration.id}`).bootstrapToggle({
            on: 'Enabled',
            off: 'Disabled',
            onstyle: 'success',
            offstyle: 'danger',
            width: '100%',
            size: 'small'
        });

        // site enabled/disabled toggle change event
        $(`#toggle-${integration.id}`).on('change', setSettingsPropertiesFromIntegrationsForm);
    });
};

/**
 * Build the debug tab
 */
var initialiseDebugForm = function (settings) {
    const waitForElTicks = [100,200,300,400,500];
    const maxAttemptsTicks = [10,20,30,40,50];

    let wrapper = $('<div></div>')
        .append($('<h5 class="mb-4">Logging</h5>'))
        .append($('<div class="row"></div>')
            .append($('<label for="toggle-debug" class="col-4" style=margin-top: 2px;">Turn on console logging</label>'))
            .append($('<div class="col"></div>')
                .append($('<input type="checkbox" id="toggle-debug">').prop('checked', settings.config.debug))
            )
        )
        .append($('<hr class="my-5" />'))
        .append($('<h5 class="mb-4">Search input element wait configuration</h5>'))
        .append($('<div class="row"></div>')
            .append($('<label for="toggle-debug" class="col-4" style=margin-top: 2px;">Input search element wait time between attempts</label>'))
            .append($('<div class="col"></div>')
                .append($(`<input id="waitForEl" type="text" name="waitTime" 
                    data-provide="slider" 
                    data-slider-ticks="[${waitForElTicks.join()}]" 
                    data-slider-min="${waitForElTicks[0]}" 
                    data-slider-max="${waitForElTicks[waitForElTicks.length - 1]}" 
                    data-slider-step="${waitForElTicks[0] - waitForElTicks[1]}"
                    data-slider-value="${settings.config.searchInputWaitForMs}"
                    data-slider-tooltip="show">`)
                )
                .append($(`<span>&nbsp;&nbsp;&nbsp;</span>`))
                .append($(`<span id="waitForElSpan">${settings.config.searchInputWaitForMs}</span>`))
            )
        )        
        .append($('<div class="row mt-4"></div>')
            .append($('<label for="toggle-debug" class="col-4" style=margin-top: 2px;">Input search element max attempts</label>'))
            .append($('<div class="col"></div>')
                .append($(`<input id="maxAttempts" type="text" name="searchMaxAttempts" 
                    data-provide="slider" 
                    data-slider-ticks="[${maxAttemptsTicks.join()}]" 
                    data-slider-min="${maxAttemptsTicks[0]}" 
                    data-slider-max="${maxAttemptsTicks[maxAttemptsTicks.length - 1]}" 
                    data-slider-step="${maxAttemptsTicks[0] - maxAttemptsTicks[1]}"
                    data-slider-value="${settings.config.searchInputMaxAttempts}"
                    data-slider-tooltip="show">`)
                )
                .append($(`<span>&nbsp;&nbsp;&nbsp;</span>`))
                .append($(`<span id="maxAttemptsSpan">${settings.config.searchInputMaxAttempts}</span>`))
            )
        )
        .append($('<div class="row mt-4"></div>')
            .append($('<label for="toggle-debug" class="col-4" style=margin-top: 2px;">Total search input element lookup time</label>'))
            .append($('<div class="col"></div>')
                .append($(`<span id="totalTimeSpan">${settings.config.searchInputMaxAttempts * settings.config.searchInputWaitForMs} ms</span>`))
            )
        );

    $('#debugOptionsForm').prepend(wrapper);

    // enable toggle
    $('#toggle-debug').bootstrapToggle({
        on: 'Enabled',
        off: 'Disabled',
        onstyle: 'success',
        offstyle: 'danger',
        width: '90px',
        size: 'small'
    });

    // site enabled/disabled toggle change event
    $('#toggle-debug').on('change', setSettingsPropertiesFromDebugForm);

    $('#waitForEl').slider()
        .on('change', function() {
            $('#waitForElSpan').html($('#waitForEl').val());

            $('#totalTimeSpan').html(`${parseInt($('#waitForEl').val()) * parseInt($('#maxAttempts').val())} ms`);

            setSettingsPropertiesFromDebugForm();
        });

    $('#maxAttempts').slider()
        .on('change', function() {
            $('#maxAttemptsSpan').html($('#maxAttempts').val());

            $('#totalTimeSpan').html(`${parseInt($('#waitForEl').val()) * parseInt($('#maxAttempts').val())} ms`);

            setSettingsPropertiesFromDebugForm();
        });
};

/**
 * Update settings from the settings tab form fields
 */
async function setSettingsPropertiesFromForm() {
    const settings = await getSettings();

    for (let i = 0; i < settings.sites.length; i++) {
        settings.sites[i].domain = $(`#${settings.sites[i].id}Domain`).val();
        settings.sites[i].apiKey = $(`#${settings.sites[i].id}ApiKey`).val();
        settings.sites[i].enabled = $(`#toggle-${settings.sites[i].id}`).prop('checked');
    }

    await setSettings(settings);
}

/**
 * Update settings from the advanced settings tab form fields
 */
async function setSettingsPropertiesFromAdvancedForm() {
    const settings = await getSettings();

    for (let i = 0; i < settings.sites.length; i++) {
        settings.sites[i].searchPath = $(`#${settings.sites[i].id}SearchPath`).val();
        settings.sites[i].searchInputSelector = $(`#${settings.sites[i].id}SearchInputSelector`).val();
        settings.sites[i].autoPopAdvancedFromApi = $(`#toggle-${settings.sites[i].id}-advanced`).prop('checked');
    }

    await setSettings(settings);
}

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

/**
 * Listen for storage changes
 */
browser.storage.onChanged.addListener(async function(changes, area) {
    let changedItems = Object.keys(changes);

    for (let item of changedItems) {
        if (item !== 'sonarrRadarrLidarrAutosearchSettings') {
            continue;
        }

        /**
         * call API version type endpoint if the auto populate from API setting is true and:
         * . on the Settings tab the domain or api key for any site has been changed, or the site has been set to enabled
         * . on the Advanced Settings tab the auto populate from API switch has been enabled
         */ 
        for (let i = 0; i < changes[item].oldValue.sites.length; i++) {
            let oldSite = changes[item].oldValue.sites[i],
                newSite = changes[item].newValue.sites[i];
            
            if (newSite.autoPopAdvancedFromApi &&
                newSite.enabled &&
                (oldSite.apiKey != newSite.apiKey ||
                oldSite.domain != newSite.domain ||
                oldSite.enabled != newSite.enabled ||
                oldSite.autoPopAdvancedFromApi != newSite.autoPopAdvancedFromApi)) {
                    log('Advanced settings update check required, calling version API');

                    const response = await callApi({ siteId: newSite.id, endpoint: 'Version' });

                    if (response.success) {
                        log([`API call succeeded, updating advanced settings for ${newSite.id}`, response]);

                        const settings = await getSettings();
                        updateAdvancedForm(settings);
                    } else {
                        log(['API call failed', response]);
                    }

                    // notify?
                }
        }
    }
});

$(async function () {
    // initialise page on load
    const settings = await getSettings();

    initialiseBasicForm(settings);
    initialiseAdvancedForm(settings);
    initialiseIntegrationsForm(settings);
    initialiseDebugForm(settings);

    // deactivate all other tabs on click. this shouldn't be required, but bootstrap 5 beta seems a bit buggy with tab deactivation.
    $('.tab-pane').on('click', function() {
        let id = $(this).attr('id');

        $('.tab-pane').each(function(t) {
            if (id == $(this).attr('id')) {
                return;
            }

            $(this).removeClass('show active');
        });
    });
});