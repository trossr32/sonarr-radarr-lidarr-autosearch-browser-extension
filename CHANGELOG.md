# Servarr Auto Search (Sonarr, Radarr, Lidarr and Readarr)

All notable changes to this project will be documented in this file.

## 2.13.0

### Added

- UI update to use Font Awesome 7 icons and tailwindcss v4, removing Bootstrap dependency
- Add reviewer guide documentation
- Preload Servarr API status on options page load (shows version or error immediately)
- Backup & restore of settings from Options → Backup & restore tab (export to JSON; import with validation; merge or replace modes)

## 2.12.0

### Added

- Changes to allow the extension to run on Firefox Android - ([#113](https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/issues/113)). Thanks to [StormPooper](https://github.com/StormPooper).
- Add RateYouMusic integration - ([PR#269](https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/pull/269)). Thanks to [Xeldarflo](https://github.com/Xeldarflo)

## 2.11.0

### Fixed

- Fixed Radarr/Sonarr `/add/new/{searchTerm}` fails to prefill search term - ([#255](https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/issues/255)). Thanks to [0xdevalias](https://github.com/0xdevalias).

## 2.10.0

### Fixed

- Fixed Rotten Tomatoes icon location selectors - ([#229](https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/issues/229)).
- Removed browser.tabs dependency in Firefox content script as it wasn't being used - ([#224](https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/issues/224)).
- Remove "Reviews" from metacritic title - ([#218](https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/issues/218)). Thanks to [theotherp](https://github.com/theotherp).

### Added

- Allow context menu to be disabled. ([#225](https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/issues/225)).

## 2.9.0

### Changed

- Migrate to manifest v3 for chromium browsers (Firefox staying on manifest v2 for now - [more info](https://blog.mozilla.org/addons/2024/03/13/manifest-v3-manifest-v2-march-2024-update/)). - ([#143](https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/issues/143)). 
- Fixed Letterboxd missing Radarr icon - ([#193](https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/issues/193)). Thanks to [MozPri](https://github.com/MozPri).
- Fix bug where colon is replaced by "%3A". ([#196](https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/issues/196)). Thanks to [dynamiccookies](https://github.com/dynamiccookies).

## 2.8.8

### Added

- Add playwright tests for site integrations.

### Fixed

- Fix Trakt sonarr link.

## 2.8.7

### Fixed

- Icon missing for metacritic show overview and movies - ([#184](https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/issues/184)).
- Fixed broken Rotten Tomatoes integration due to site redesign - ([#185](https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/issues/185)).
- Fix imdb integration for media types of _other_. Fix to display both Sonarr and Radarr icons - ([#186](https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/issues/186)).

## 2.8.6

### Changed

- Improved allocine integration. Thanks to [cyberden](https://github.com/cyberden).

## 2.8.5

### Fixed

- IMDB TV episode 

## 2.8.4

### Fixed

- Fix Rotten Tomatoes Radarr logo prepend. Thanks to [3vanlock](https://github.com/3vanlock).
- Fix API testing for Lidarr v2.

## 2.8.3
  
### Changed

- Radarr v5 now accounted for when testing API connection.

### Fixed

- Fix Metacritic integration following their site redesign.
- Fix Trakt integration.

## 2.8.2

### Fixed

- Fix regex for username/password removal in domain matching. Thanks to [carsso](https://github.com/carsso).

## 2.8.1

### Fixed

- Fix Betaseries integration.  Thanks to <a href="https://github.com/carsso">carsso</a>.
- Revert change to manifest to allow all URLs again. This is required as the extension performs the automated searching on servarr pages and v2.8.0 broke this. (<a href="https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/issues/145">#145</a>)

## 2.8.0

### Added

- New feature: Limit extension permissions to integration sites only (<a href="https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/issues/145">#145</a>)
- New feature: Add release-group and release URLs for musicbrainz integration. Thanks to <a href="https://github.com/Pompiedom">Pompiedom</a>. (<a href="https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/issues/146">#146</a>).
- New feature: Add betaseries.com integration. Thanks to <a href="https://github.com/carsso">carsso</a>.
- New feature: Add primevideo.com integration. Thanks to <a href="https://github.com/carsso">carsso</a>.

### Fixed

- Adding user:password syntax handling in site domain & fixing grunt release on linux. Thanks to <a href="https://github.com/carsso">carsso</a>.

## 2.7.1

### Fixed

- TmdbId not parsed correctly from Trakt to Radarr search for some titles (https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/issues/131)
- Icon not showing on IMDB <a href="https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/issues/134">#134</a>

## 2.7.0

### Added

- Add Readarr integration to context menu

## 2.6.1

### Fixed

- Fix lidarr test failing

## 2.6.0

### Added

- MyAnimeList integration. (Thanks to <a href="https://github.com/dannyvink">dannyvink</a> for making this contribution.)

## 2.5.0

### Added

- New feature to allow absolute positioning of the servarr icon either anchored to the side of the page or floating at a user defined position. Only works when one instance of the icon should be injected to the page, otherwise falls back to default positioning. Unsure if this is a feature anyone will actually want to use, but if you find it useful or have any suggestions for improvement please let me know.

### Removed

- Remove 'tabs' permission for the extension as not required. Google took down the package because of this permission being included and not required, so this release should see the extension available on the Chrome Web Store soon.

### Fixed

- IMDb was not correctly identifying TV shows and was falling back to everything being identified as a movie when viewing the German version of the site.

## 2.4.2

### Fixed

- SensCritique config update following site redesign

## 2.4.1

### Fixed

- IMDB icon/search locator bug fix

## 2.4.0

### Added

- Allocin?? integration. (Thanks to <a href="https://github.com/ledge74">ledge74</a> for making this contribution.)
- SensCritique integration. (Thanks to <a href="https://github.com/ledge74">ledge74</a> for making this contribution.)

### Fixed

- Context menu wasn't updating correctly when servarr integrations were enabled or disabled. (<a href="https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/issues/86">#86</a>)

## 2.3.2

### Added

- Cater for Radarr v4 by amending the API url to include the /api/v3/ prefix. The extension will attempt with /api/v3/ first, then /api/ if it fails.

## 2.3.1

### Fixed

- Fix multiple lidarr icons showing on musicbrainz integration when activating browser tab

## 2.3.0

### Added

- IPTorrents integration.
- Last.fm integration.

### Fixed

- Servarr sites search term discovery in search URL was adding 'new' with no search parameter.
- Reduce z-index on Simkl icon to prevent it from displaying above the site header.

## 2.2.0

### Added

- Add simkl and metacritic integrations.
  
### Changed

- Change Radarr image from the version 0 logo to the version 3 logo.

### Fixed

- Fix trakt integration.

## 2.1.0

### Added

- Rotten tomatoes integration.
- Grunt added as a task runner and all external libs now added via npm.

### Changed

- Improved Trakt integration.
- Fully consolidate chromium and firefox dists.

### Fixed

- Potential bug found where waiting 1 second for the Servarr search input element to be available wasn't always long enough. Set the wait time when searching for a servarr search input element to 6 seconds and add debugging settings to allow increasing/decreasing this time.

## 2.0.0

### Added

- Add TV Calendar integration.
- Add functionality to call Sonarr, Radarr or Lidarr API to ascertain the version and automatically configure settings.
- Redesign option UI

### Changed

- Update jquery/bootstrap/font awesome to the latest versions.
- Refactor entire codebase to consolidate the Chromium and Friefox extensions using browser polyfills.
- Update code to use promises (async/await).
- Add jsdoc and improved comments throughout the code.

## 1.7.0

### Added

- Search by id from IMDb, TVDb, TMDb, Trakt and letterboxd

## 1.6.0

### Added

- Added a new debug tab to the options page which allows turning on logging to console for debugging/development.

### Fixed

- IMDB has a new design in beta which this fix caters for. The config for the old (current) layout is still included until the new IMDB design is fully released.

## 1.5.0

### Added

- Added letterboxd integration. (Thanks to <a href="https://github.com/aommm">aommm</a> for making this contribution.)

## 1.4.1

### Changes

- Optimise lidarr searching from the MusicBrainz integration to use id rather than artist name. Fixes <a href="https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/issues/28">#28</a>

## 1.4.0

### Added

- Add MusicBrainz artist pages as a site integration for Lidarr.

## 1.3.2

### Fixed

- Fixes issue <a href="https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/issues/21">#21</a> where the search input was rendering after the extension had tried to find the field. Code added to watch for the element being available prior to referencing.

## 1.3.1

### Fixed

- Fixes bug <a href="https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/issues/22">#22</a> where context menu items were incorrectly displayed when certain integrations had been disabled.

## 1.3.0

### Added

- Add version documentation for v3 of Sonarr and Radarr following update in <a href="https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/issues/1">#1</a>

### Fixed

- Couple of bug fixes

## 1.2.0

### Added

- Add TVmaze as an integration, both on a show page and the countdown results page. Fixes <a href="https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/issues/13">#13</a>.

### Changed

- Change the settings paypal page to a ko-fi integration, fixes <a href="https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/issues/12">#12</a>

### Fixed

- Fix mini-series bug on IMDB; fixes <a href="https://github.com/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/issues/10">#10</a>

## 1.1.0

### Added

- Add Sonarr and Radarr icon direct search links from TV or movie pages on IMDb, TVDb, TMDb & Trakt.

### Fixed

- Fix bug where searching for a term with multiple consecutive periods fails
- Fix bug where no search term results in a search
