# Sonarr, Radarr and Lidarr Auto Search

This is an extension for Chrome, the new chromium Microsoft Edge and Firefox that:

1. Populates the search field on Sonarr, Radarr or Lidarr with any text added to the end of the search URL and then triggers the input event on the search field to fire off a search request. For instance, the standard search page url for Sonarr would be http://my.sonarr.domain:7357/addseries. This extension takes a URL like http://my.sonarr.domain:7357/addseries/fringe and automatically triggers the page to show results for fringe.

2. When right-clicking selected text on any page this extension exposes a context menu with entries for Sonarr, Radarr and Lidarr that allow a direct search for the selected text in a new tab.

3. **New feature** - Adds Sonarr or Radarr icons as direct search links on IMDb, TVDb, TMDb and Trakt websites.

The extension an be disabled from the extension's popup and each context menu item can be disabled from the settings page.

# Getting started

[Extension on the Chrome web store](https://chrome.google.com/webstore/detail/sonarrradarrlidarr-autose/jmmjjcddjldjdjgckdiokhfokccdnekc)

[Extension on the Microsoft Edge add-ons store](https://microsoftedge.microsoft.com/addons/detail/aclgfcjonnhgdkinhmmafdbkpegfcnal)

[Add-on on the Firefox add-ons store](https://addons.mozilla.org/en-GB/firefox/addon/sonarr-radarr-lidarr-search/)

Once installed in your browser go to the options page and configure the extension.

Note: by default this extension defaults to settings applicable to v2.0 of Sonarr. If you're using v3.0 then go to the advanced settings tab on the options page for guidance.

## Settings

Fill out the URL fields for each of your Sonarr, Radarr or Lidarr instances in the format http://my.sonarr.domain:7357. 

## Advanced settings

**Search path** - this needs to match the URL path that is the search page. This would only ever need to be changed if the URLs are changed by the Sonarr/Radarr/Lidarr developers.

**Search input selector** - This text is used as a jQuery selector when the extension is trying to find the input search element. Again, this should only require changing to react to changes made by the Sonarr/Radarr/Lidarr developers.

## Integrations

If any of the sites on this tab are set as enabled then this extension will attempt to ascertain whether it should include a direct link to search within a Sonarr, Radarr or Lidarr instance, for example:

![IMDb Sonarr example](https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/blob/master/ChromiumExtension/content/assets/images/integrations/imdb_example_screenshot.png)

![TVDb Sonarr example](https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/blob/master/ChromiumExtension/content/assets/images/integrations/tvdb_example_screenshot.png)

# Create package
A Powershell script and batch files that execute that PS script are included but these simply zip the ChromiumExtension directory or run web-ext build against the FirefoxAddOn directory, as that's all that's required to publish this to the Chrome Web Store, Microsoft Edge Addons and Firefox Addons sites.

# Contribute
If you can make this extension better I'm happy for the help! Create a pull request and get in touch. Alternatively feel free to raise an issue if you've found a bug.
