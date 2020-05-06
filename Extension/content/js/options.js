var settingsPort = chrome.runtime.connect({ name: 'settings' }),
    entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };

var escapeHtml = function(string) {
    return String(string).replace(/[&<>"'`=\/]/g,
        function(s) {
            return entityMap[s];
        });
};

var title = function(str) {
    return str.replace(/(^|\s)\S/g, function(t) { return t.toUpperCase(); });
};

var initialiseBasicForm = function (settings) {
    var wrapper = $('<div></div>');

    $.each(settings.sites, function (i, site) {
        var formLabelImg = $('<img src="content/assets/images/' + site.id + '/' + title(site.id) + '48.png" style="width: 24px; margin-right: 10px;" />'),
            formLabelText = $('<label style="padding-top: 6px;">' + title(site.id) + ' protocol, domain and port</label>'),
            formLabel = $('<label for="' + site.id + 'Domain" class="col-sm-3 col-form-label"></label>'),
            input = $('<input type="text" class="form-control" id="' + site.id + 'Domain" placeholder="http://192.168.0.1:7357">')
                .val(site.domain),
            inputDiv = $('<div class="col-sm-7"></div>'),
            toggle = $('<input type="checkbox" id="toggle-' + site.id + '">')
                .prop('checked', site.enabled),
            toggleDiv = $('<div class="col-sm-2"></div>'),
            container = $('<div class="form-group row"></div>');

        wrapper
            .append(container
                .append(formLabel.append(formLabelImg).append(formLabelText))
                .append(inputDiv.append(input))
                .append(toggleDiv.append(toggle))
            );
    });

    $('#generalOptionsForm').prepend(wrapper);

    // enable toggles
    $('[id^="toggle-"]').each(function (i, e) {
        var el = $(e);

        el.bootstrapToggle({
            on: 'Enabled',
            off: 'Disabled',
            onstyle: 'success',
            offstyle: 'danger',
            width: '100%',
            size: 'small'
        });
    });
};

var initialiseAdvancedForm = function (settings) {
    var wrapper = $('<div></div>');

    $.each(settings.sites, function (i, site) {
        var section = $('<div style="margin-bottom: 80px;">'),
            header = $('<h3 style="margin-bottom: 40px;"></h3>'),
            headerImg = $('<img src="content/assets/images/' + site.id + '/' + title(site.id) + '48.png" style="margin-right: 10px; width: 30px;" />'),
            headerText = title(site.id) + ' advanced settings',
            searchPathGroup = $('<div class="form-group row"></div>'),
            searchPathLabel = $('<label for="' + site.id + 'SearchPath" class="col-sm-3 col-form-label"></label>'),
            searchPathLabelContent = $('<label style="padding-top: 6px;">Search path url</label>'),
            searchPathInputDiv = $('<div class="col-sm-9"></div>'),
            searchPathInput = $('<input type="text" class="form-control" id="' + site.id + 'SearchPath" placeholder="http://192.168.0.1:7357" aria-describedby="' + site.id + 'SearchPathHelp">')
                .val(site.searchPath),
            searchPathHelp = $('<div class="col-sm-offset-3"><small id="' + site.id + 'SearchPathHelp" class="form-text" style="margin-left: 20px;">This is the search path used to search for add new content in this instance, following your instance url/ip.</small></div>'),
            selectorGroup = $('<div class="form-group row"></div>'),
            selectorLabel = $('<label for="' + site.id + 'SearchInputSelector" class="col-sm-3 col-form-label"></label>'),
            selectorLabelContent = $('<label style="padding-top: 6px;">Search field selector</label>'),
            selectorInputDiv = $('<div class="col-sm-9"></div>'),
            selectorInput = $('<input type="text" class="form-control" id="' + site.id + 'SearchInputSelector" placeholder=".class, #id" aria-describedby="' + site.id + 'SearchInputSelectorHelp">')
                .val(site.searchInputSelector),
            selectorHelp = $('<div class="col-sm-offset-3"><small id="' + site.id + 'SearchInputSelectorHelp" class="form-text" style="margin-left: 20px;">This is the jquery selector used to find the search input form field for this instance.</small></div>');

        wrapper
            .append(section
                .append(header.append(headerImg).append(headerText))
                .append(searchPathGroup
                    .append(searchPathLabel.append(searchPathLabelContent))
                    .append(searchPathInputDiv.append(searchPathInput))
                    .append(searchPathHelp)
                )
                .append(selectorGroup
                    .append(selectorLabel.append(selectorLabelContent))
                    .append(selectorInputDiv.append(selectorInput))
                    .append(selectorHelp)
                )
        );
    });

    $('#advancedOptionsForm').prepend(wrapper);
};

var setSettingsPropertiesFromForm = function (settings) {
    for (var i = 0; i < settings.sites.length; i++) {
        settings.sites[i].domain = $('#' + settings.sites[i].id + 'Domain').val();
        settings.sites[i].enabled = $('#toggle-' + settings.sites[i].id).prop('checked');
    }
};

var setSettingsPropertiesFromAdvancedForm = function (settings) {
    for (var i = 0; i < settings.sites.length; i++) {
        settings.sites[i].searchPath = $('#' + settings.sites[i].id + 'SearchPath').val();
        settings.sites[i].searchInputSelector = $('#' + settings.sites[i].id + 'SearchInputSelector').val();
    }
};

settingsPort.onMessage.addListener(function (response) {
    var settings = response.settings;

    switch (response.request.caller) {
        case 'initPage':
            initialiseBasicForm(settings);
            initialiseAdvancedForm(settings);
            break;

        case 'setFields':
            setSettingsPropertiesFromForm(settings);

            settingsPort.postMessage({ method: 'set', caller: '', settings: settings });
            break;

        case 'setAdvancedFields':
            setSettingsPropertiesFromAdvancedForm(settings);

            settingsPort.postMessage({ method: 'set', caller: '', settings: settings });
            break;
    }
});

$(function () {
    // show first tab on load
    $('#settingsTabs a:first').tab('show');
    
    // initialise page on load
    settingsPort.postMessage({ method: 'get', caller: 'initPage' });

    // save settings/advanced button click events
    $.each(['', 'Advanced'], function(i, v) {
        $('#save' + v + 'Options').click(function (e) {
            settingsPort.postMessage({ method: 'get', caller: 'set' + v + 'Fields' });
        });
    });
});