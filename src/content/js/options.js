var entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    },
    base64Icons_40px = [
        {
            id: 'sonarr',
            base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAMAAAC7IEhfAAACc1BMVEUAAAA1osQsiKUaGxysrK0VOkcXNkDx8fHx8fFKTEyHiIjx8fHIyckEAwQbT2ALGyBLTE1MTk7k5OSdnp8bO0U1vuppamsOERLx8fEmZnu/v8D09PQbXnT49/cv//86PD0MDg+EhIUPKzTx8fHs7Ozx8fEys9wNGh8rLS6R//8aRlQGCAnU1NTx8fEnKSqcnZ0kcosUFhf19fXt7e0dXXJ2d3hbXF3x8fFkZWY3y/sfISEvTlgTEA9kZWWvsLDx8fHx8fETExSzs7MRDQ0YFxccHyENDxDx8fEQMj3///8hNz4bW28TFxmTlJQlJifx8fEePkgZGxxCREQMDAylpaUFBwgeT17x8fFBQkPKysoyboJzdHRWV1gmeJN/gID39/cfQUwolLcebIYiQUvx8fE2xvQlYXXY2Ni3uLhmZ2dXWFhiY2Px8fHx8fEUISW9vb4VFxgAAAAWGx0cVmnx8fEJBgbx8fEhO0Pa2tozNDXx8fHx8fFC//8HBwgcKi/x8fEztuAbPEf8+/vExMXx8fEZJCgtLzA3yPdRU1MPPEseU2QkWWsidpH5+fkbPUgdICJSVFQrLC04zf0YNT6Xl5geQ1D9/f0jXnIifZojRVAiIyQhVGWOjo8maX8VJSv8/PwdZXwfPkhFR0gxMzQVHSDx8fEodIwtmr0pYnW8vLwhV2haW1xnaGmDhIQjUF/x8fEWGBmio6Px8fE3w+95enofISEWGhzx8fEoZ3xPUFAjJCUqepQVPUojRlIgTl3x8fEbN0GnqKgUOEQbLDIgbocyuOQpan4gY3kNDxAhQUwRLTZQUlJHSEk4yPZXWFl3eHiXmJg/zZ3SAAAA0XRSTlMAD/+G/68Aiz2N/9MA/////wD/AP////8T//9pAP8C/wAA//UArP//AAj////k////m1L//////wD/AAD/hQAkDP///////53/AP//qv+XdwD/////AP/JAP8A/wD//1z///+37P//AP+e///bLP8A/wi5/7X/AP///4OTCP//HP+fY/9E/43//wD//////62T/////wBQ//////////9ZAKr/AP+5//////8AAP//o/8AMf///55J/wAA/wAA/3z//wD/////AAD//wD//wD//z8EYasAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAOiSURBVHicdZX7UxtVFMdvbZRKHKvpyoVRxHZoahsoKMMsq1E4JDd9pKMup8XGsVPEDB1DxKiQweDCWBiTkm7bUJQWpq0vbJk6UlmitVXqODLig8Kf5N3d7JKQeO4kP9z97Nnzut9LLIvr1jaW6HeGuUVny36qNLbIJtP33i2LinkWHVooJvnGyFBY3GzzrYXkmys3ycl6sYSFnyT3yXGLe/aNX8nDLrGkNb3z/u9/ruTAOy/uPaKkSpOLygdbHnrG5E61kC97ZCxJLiKbepsc/8HI4z3yKQhBSh9zqZswtRkCUwI8R3bGjXyvjWbwYA/FmtECUh1MAa3aBdhwupbnzutSr4Y+wss9DKebR0WVw6r+X1eeQVYl+NikGm41wCH+JJRRLn7Yhwp0lDtCdYOh9vKIjMrBoKDAJH/zgA626nXmJN5eFiBGEdh0lgHgLd+SNuVjDXo44QUOJsyA1jF7ffk3BM4CjQUYwj7tBFMWzbCH4qTNmYv9K883bz0h+AC86EVAOJc8C0qNq9rseyXZZuV4FCD7wF8AV2caG8eHwT98RZax3KrDGHnVblYGKSLOuCe4udMKKOCZrrPABJm369ZL5VuQXl3VkpomJdPgj8G/9sNZ8rpd30kPQJ97NalJ+nJvjyFU2B2IEntW1aMUvOkJ7k/3qEk3kCl2iGKYbEzrnAzwrWQ6TErSXZ+MDaVAdQ4odusedVKb6PZ6aD648el2YN4ZKamZS0oDK/DotEGejLfPbXxYk6TlYYwpa3nJ7LbBZgTZ22nmLGkzPplCKq889+yCd4BunW6J2/I48GbK++2pT9gtFEMyReEq4p5HG/8Y3wMDS/vAA46NFlpDoa5RWNKCfgZ+fTFo1JYAIlaIbdaYiYNsgM8VnxoKaK672veKv910WWYNrihG8LB2iYcFBkUBWOCEdhg7jDkzBlc/CvxcAly5LQNitibV2xupyfBBYp1VFCJNYu4oxCu5mDQjrRIQ5YhjkB8sfrRccxX7Fd/fNwKBVJMYHjHA+PNNayAHzwH0hqrtCqtqXQXzCUGGEddJQ6r47yWk/Lz518VCBVAdGaVrXFYuEFPS4v8c+rGnC7OOzUIhqlwZuoLnSUtO+o6defoTLzjEYlPnGDz48S85kSJff/EZ2VrszyRfIa89tdMSyGN3fn7889JCeo3cfCFfmnd8V1tZLM3h+ZHalx8pFvvWhDMfi5Yt/N+1EG/bdq/fWc+vD2d/Yqzw+vgP21jRElbnue0AAAAASUVORK5CYII='
        }, {
            id: 'radarr',
            base64: 'data:image/png;base64,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',
        }, {
            id: 'lidarr',
            base64: 'data:image/png;base64,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'
        }, {
            id: 'readarr_ebook',
            base64: 'data:image/png;base64,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'
        }, {
            id: 'readarr_audiobook',
            base64: 'data:image/png;base64,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'
        }
    ];

/**
 * Convert string to title case
 * @param {string} s - string to convert
 * @param {boolean} removeUnderscore - whether to replace underscore
 * @returns {string} - converted string
 */
var title = (s, removeUnderscore) => {
    if (s.indexOf('_') > 0 && removeUnderscore) {
        let split = s.split('_');

        s = `${split[0]} (${split[1]})`;
    }

    return s.replace(/(^|\s)\S/g, (t) => t.toUpperCase());
};

/**
 * Get HTML markup for a custom icon to inject into the body.
 * @param {InjectedIconConfig} injectedIconConfig - injected icon config
 * @param {string} iconDataUri - icon data uri
 * @param {string} siteId - id of the servarr site; sonarr, radarr, lidarr, etc.
 * @returns {string} - HTML to inject
 */
function getCustomIconMarkup(injectedIconConfig, siteId, linkHref) {
return `<style id="servarr-ext_custom-icon-style">
.servarr-ext_icon a {
    position: absolute;
    background-color: ${injectedIconConfig.backgroundColor};
    text-decoration: none;
    height: 52px;
    z-index: 9999999;
    ${injectedIconConfig.position}: ${injectedIconConfig.positionOffset};
}

.servarr-ext_anchored-icon a {
    padding: 0 15px;
    width: 60px;
}

.servarr-ext_floating-icon a {
    width: 52px;
    ${injectedIconConfig.side}: ${injectedIconConfig.sideOffset};
    border-radius: 50px;
}

.servarr-ext_anchored-left-icon a {
    left: 0;
    border-radius: 0 50px 50px 0;
}

.servarr-ext_anchored-right-icon a {
    right: 0;
    border-radius: 50px 0 0 50px;
}

.servarr-ext_anchored-left-icon .servarr-ext_anchor-label {
    margin-top: 8px;
}

.servarr-ext_anchored-right-icon .servarr-ext_anchor-label {
    margin: 8px 0 0 50px;
}

.servarr-ext_icon-image {
    width: 40px;
    height: 40px;
    background: url('${base64Icons_40px.find(i => i.id == siteId).base64}') no-repeat;
}

.servarr-ext_anchored-icon .servarr-ext_icon-image {
    top: 6px;
}

.servarr-ext_floating-icon .servarr-ext_icon-image {
    margin: ${(siteId == 'radarr' ? '6px 0px 0px 8px' : '6px 0px 0px 6px')};
}

.servarr-ext_anchored-left-icon .servarr-ext_icon-image {
    float: right;
    margin: ${(siteId == 'radarr' ? '6px -10px 0 0' : '6px -10px 0 0')};
}

.servarr-ext_anchored-right-icon .servarr-ext_icon-image {
    float: left;
    margin: ${(siteId == 'radarr' ? '6px 0px 0px -5px' : '6px 0px 0px -9px')};
}
</style>
<div id="servarr-ext_custom-icon-wrapper" class="servarr-ext_icon servarr-ext_${injectedIconConfig.type}-icon ${(injectedIconConfig.type == 'anchored' ? ('servarr-ext_anchored-' + injectedIconConfig.side + '-icon') : '')}">
    <a href="${linkHref}" target="_blank" data-servarr-icon="true">
        <div class="servarr-ext_icon-image"></div>
        <!-- ${(injectedIconConfig.type == 'anchored' ? ('<div class="servarr-ext_anchor-label">Search<br />' + title(siteId) + '</div>') : '')} -->
    </a>
</div>`;
}

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

/**
 * Shows the icon in the test button for the given site id where the suffix matches the end of the icon id; hides all other icons
 * @param {string} siteId - site identifier (sonarr /radarr / lidarr)
 * @param {string} suffix - suffix of the icon to show in the test button
 */
var setTestButtonIcon = (siteId, suffix) => {
    $.each(['', 'Worked', 'Failed', 'Progress'], function (i, x) {
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
                            .append($(`<img src="content/assets/images/${site.id}/${title(site.id, false)}48.png" style="width: 30px; margin-right: 10px;" />`))
                        )
                        .append($(`<h4 style="float: left; margin-bottom: 0;">${title(site.id, true)}</h4>`))
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
                    '<p class="card-text">These settings configure how this extension will connect to your Servarr instances.</p>' +
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
                            .append($(`<img src="content/assets/images/${site.id}/${title(site.id, false)}48.png" style="width: 30px; margin-right: 10px;" />`))
                        )
                        .append($(`<h4 style="float: left; margin-bottom: 0;">${title(site.id, true)}</h4>`))
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
                        '<p class="card-text">These settings are defaulted to v4.<i>n</i>. For v2.<i>n</i> use:</p>' +
                        '<p class="card-text">Search path url: <b>/addseries/</b></p>' +
                        '<p class="card-text">Search field selector: <b>.add-series-search .x-series-search</b></p>' +
                        '</li>'))
                    .append($('<li class="list-group-item pt-3 pb-5">' + 
                        '<h5 class="card-title pb-4">Radarr version config</h5>' + 
                        '<p class="card-text">These settings are defaulted to v4.<i>n</i>. For v0.<i>n</i> use:</p>' +
                        '<p class="card-text">Search path url: <b>/addmmovies/</b></p>' +
                        '<p class="card-text">Search field selector: <b>.add-movies-search .x-movies-search</b></p>' +
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

var getUnitFromOffset = (offset) => offset.match(/(?<amount>[\d|\.]+)(?<unit>.+)/i).groups.unit;

var getAmountFromOffset = (offset) => offset.match(/(?<amount>[\d|\.]+)(?<unit>.+)/i).groups.amount;

/**
 * Build the custom icon settings tab
 */
var initialiseCustomIconForm = function (settings) {
    log([settings.injectedIconConfig]);
    let wrapper = $('<div></div>')
        // .append($('<h5 class="mb-4">Logging</h5>'))
        .append($('<div class="row my-5"></div>')
            .append($('<label for="toggle-use-custom-icon" class="col-4" style=margin-top: 2px;">Use custom icon</label>'))
            .append($('<div class="col"></div>')
                .append($('<input type="checkbox" id="toggle-use-custom-icon">').prop('checked', settings.config.customIconPosition))
            )
        )
        //.append($('<hr class="my-5" />'))
        // .append($('<h5 class="mb-4">Search input element wait configuration</h5>'))
        .append($('<div class="row mb-3"></div>')
            .append($('<label for="toggle-icon-type" class="col-4" style=margin-top: 2px;">Icon type</label>'))
            .append($('<div class="col"></div>')
                .append($('<input type="checkbox" id="toggle-icon-type">').prop('checked', settings.injectedIconConfig.type == 'anchored'))
            )
        )
        .append($('<div class="row mb-3"></div>')
            .append($('<label for="toggle-side" class="col-4" style=margin-top: 2px;">Window side</label>'))
            .append($('<div class="col"></div>')
                .append($('<input type="checkbox" id="toggle-side">').prop('checked', settings.injectedIconConfig.side == 'left'))
            )
        )
        .append($('<div class="row mb-3"></div>')
            .append($('<label for="toggle-side-offset" class="col-4" style=margin-top: 2px;">Horizontal offset</label>'))
            .append($('<div class="col"></div>')
                .append($(`<input type="text" class="form-control form-control-sm" id="side-offset" aria-describedby="side-offset-help" style="width: 50px; float: left; margin-right:10px;">`).val(getAmountFromOffset(settings.injectedIconConfig.sideOffset)))
                .append($('<input type="checkbox" id="toggle-side-offset" style="float: left;">').prop('checked', getUnitFromOffset(settings.injectedIconConfig.sideOffset) == 'px'))
            )
        )
        .append($('<div class="row mb-3"></div>')
            .append($('<label for="toggle-position" class="col-4" style=margin-top: 2px;">Window position</label>'))
            .append($('<div class="col"></div>')
                .append($('<input type="checkbox" id="toggle-position">').prop('checked', settings.injectedIconConfig.position == 'top'))
            )
        )
        .append($('<div class="row mb-3"></div>')
            .append($('<label for="toggle-position-offset" class="col-4" style=margin-top: 2px;">Vertical offset</label>'))
            .append($('<div class="col"></div>')
                .append($(`<input type="text" class="form-control form-control-sm" id="position-offset" aria-describedby="position-offset-help" style="width: 50px; float: left; margin-right:10px;">`).val(getAmountFromOffset(settings.injectedIconConfig.positionOffset)))
                .append($('<input type="checkbox" id="toggle-position-offset" style="float: left;">').prop('checked', getUnitFromOffset(settings.injectedIconConfig.positionOffset) == 'px'))
            )
        )
        .append($('<div class="row mb-3"></div>')
            .append($('<label for="icon-background-color" class="col-4" style=margin-top: 2px;">Icon background colour</label>'))
            .append($('<div class="col"></div>')
                .append($(`<input type="text" class="form-control form-control-sm" id="icon-background-color" aria-describedby="icon-background-color-help" style="width: 150px;" data-coloris>`).val(settings.injectedIconConfig.backgroundColor))
            )
        );
        // .append($('<div class="row mb-5"></div>')
        //     .append($('<label for="icon-font-color" class="col-4" style=margin-top: 2px;">Icon font colour</label>'))
        //     .append($('<div class="col"></div>')
        //         .append($(`<input type="text" class="form-control" id="icon-font-color" aria-describedby="icon-font-color-help" style="width: 150px;" data-coloris>`).val(settings.injectedIconConfig.fontColor))
        //     )
        // );

    $('#customIconOptionsForm').prepend(wrapper);

    // use custom icon toggle
    $('#toggle-use-custom-icon').bootstrapToggle({
        on: 'Enabled',
        off: 'Disabled',
        onstyle: 'success',
        offstyle: 'danger',
        width: '90px',
        size: 'small'
    });
    
    $('#toggle-use-custom-icon').on('change', function() {
        $('#toggle-icon-type, #toggle-side, #toggle-position, #toggle-side-offset, #toggle-position-offset')
            .bootstrapToggle($(this).prop('checked') ? 'enable' : 'disable');

        $('#side-offset, #position-offset, #icon-background-color, #icon-font-color')
            .prop("disabled", !$(this).prop('checked'));

        setSettingsPropertiesFromCustomIconForm();
    });

    // icon type toggle
    $('#toggle-icon-type').bootstrapToggle({
        on: 'Anchored',
        off: 'Floating',
        onstyle: 'success',
        offstyle: 'success',
        width: '90px',
        size: 'small'
    });
    
    $('#toggle-icon-type').on('change', function() {
        if ($(this).prop('checked')) {            
            $('#toggle-side, #toggle-position, #toggle-position-offset').bootstrapToggle('enable');
            
            //$('#position-offset, #icon-background-color, #icon-font-color').prop("disabled", false);
            $('#position-offset, #icon-background-color').prop("disabled", false);
                
            $('#toggle-side-offset').bootstrapToggle('disable');
                
            $('#side-offset').prop("disabled", true);
        } else {
            $('#toggle-side, #toggle-side-offset, #toggle-position, #toggle-position-offset').bootstrapToggle('enable');
            
            $('#side-offset, #position-offset, #icon-background-color').prop( "disabled", false );
        
            //$('#icon-font-color').prop("disabled", true);
        }
        
        setSettingsPropertiesFromCustomIconForm();
    });

    $.each(['side', 'position'], function(i, v) {
        $(`#toggle-${v}`).bootstrapToggle({
            on: v == 'side' ? 'Left' : 'Top',
            off: v == 'side' ? 'Right' : 'Bottom',
            onstyle: 'success',
            offstyle: 'success',
            width: '90px',
            size: 'small'
        });

        $(`#toggle-${v}-offset`).bootstrapToggle({
            on: 'px',
            off: '%',
            onstyle: 'success',
            offstyle: 'success',
            width: '30px',
            size: 'small'
        });
    });

    $('#toggle-side, #toggle-position, #toggle-side-offset, #toggle-position-offset').on('change', setSettingsPropertiesFromCustomIconForm);
    
    $('#side-offset, #position-offset').on('keypress', setSettingsPropertiesFromCustomIconForm);

    // initialise fields as disabled if required
    if (settings.injectedIconConfig.type == 'anchored') {
        $('#toggle-side, #toggle-position, #toggle-position-offset').bootstrapToggle('enable');
            
        //$('#position-offset, #icon-background-color, #icon-font-color').prop("disabled", false);
        $('#position-offset, #icon-background-color').prop("disabled", false);
            
        $('#toggle-side-offset').bootstrapToggle('disable');
            
        $('#side-offset').prop("disabled", true);
    } else {
        $('#toggle-side, #toggle-side-offset, #toggle-position, #toggle-position-offset').bootstrapToggle('enable');
        
        $('#side-offset, #position-offset, #icon-background-color').prop( "disabled", false );
    
        //$('#icon-font-color').prop("disabled", true);
    }

    $('#toggle-icon-type, #toggle-side, #toggle-position, #toggle-side-offset, #toggle-position-offset')
        .bootstrapToggle(settings.config.customIconPosition ? 'enable' : 'disable');

    //$('#side-offset, #position-offset, #icon-background-color, #icon-font-color')
    $('#side-offset, #position-offset, #icon-background-color')
        .prop("disabled", !settings.config.customIconPosition);

    document.addEventListener('coloris:pick', event => {
        setSettingsPropertiesFromCustomIconForm();
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
 * Update settings from the custom icon tab form fields
 */
async function setSettingsPropertiesFromCustomIconForm() {
    const settings = await getSettings();

    settings.config.customIconPosition = $('#toggle-use-custom-icon').prop('checked');
    settings.injectedIconConfig.type = $('#toggle-icon-type').prop('checked') ? 'anchored' : 'floating';
    settings.injectedIconConfig.side = $('#toggle-side').prop('checked') ? 'left' : 'right';
    settings.injectedIconConfig.sideOffset = $('#toggle-side-offset').prop('checked') ? `${$('#side-offset').val()}px` : `${$('#side-offset').val()}%`;
    settings.injectedIconConfig.position = $('#toggle-position').prop('checked') ? 'top' : 'bottom';
    settings.injectedIconConfig.positionOffset = $('#toggle-position-offset').prop('checked') ? `${$('#position-offset').val()}px` : `${$('#position-offset').val()}%`;
    settings.injectedIconConfig.backgroundColor = $('#icon-background-color').val();
    //settings.injectedIconConfig.fontColor = $('#icon-font-color').val();

    $("#servarr-ext_custom-icon-wrapper, #servarr-ext_custom-icon-style").remove();

    if (settings.config.customIconPosition && $('#custom-icon-tab').hasClass('active')) {
        $('body').prepend(getCustomIconMarkup(settings.injectedIconConfig, 'sonarr', '#'));
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
    initialiseCustomIconForm(settings);
    initialiseDebugForm(settings);

    // deactivate all other tabs on click. this shouldn't be required, but bootstrap 5 beta seems a bit buggy with tab deactivation.
    $('.nav-link').on('click', function() {
        let id = $(this).attr('id');

        if (id == 'custom-icon-tab' && settings.config.customIconPosition) {
            $('body').prepend(getCustomIconMarkup(settings.injectedIconConfig, 'sonarr', '#'));
        } else {
            $("#servarr-ext_custom-icon-wrapper, #servarr-ext_custom-icon-style").remove();
        }
    });
});