const { getVersionConfig } = require('../../src/content/js/core.js');

describe('getVersionConfig', () => {
    test.each`
      siteType               | version            | expectedPath
      ${'sonarr'}            | ${'2.0.0.5344'}    | ${'/addseries/'}
      ${'sonarr'}            | ${'3.0.10.1567'}   | ${'/add/new/'}
      ${'sonarr'}            | ${'4.0.20.3014'}   | ${'/add/new/'}
      ${'sonarr'}            | ${'5.0.0.2907'}    | ${'/add/new/'}
      ${'sonarr'}            | ${'7.0.0.1'}       | ${'/add/new/'}
      ${'sonarr'}            | ${'10.0.0.1'}      | ${'/add/new/'}
      ${'radarr'}            | ${'0.2.0.1480'}    | ${'/addmovies/'}
      ${'radarr'}            | ${'2.0.0.5'}       | ${'/addmovies/'}
      ${'radarr'}            | ${'3.2.2.5080'}    | ${'/add/new/'}
      ${'radarr'}            | ${'5.14.0.9383'}   | ${'/add/new/'}
      ${'radarr'}            | ${'6.0.0.1'}       | ${'/add/new/'}
      ${'radarr'}            | ${'12.0.0.1'}      | ${'/add/new/'}
      ${'lidarr'}            | ${'1.2.6.3490'}    | ${'/add/search/'}
      ${'lidarr'}            | ${'3.0.0.1'}       | ${'/add/search/'}
      ${'lidarr'}            | ${'4.0.0.1'}       | ${'/add/search/'}
      ${'readarr_ebook'}     | ${'0.4.18.2805'}   | ${'/add/search/'}
      ${'readarr_audiobook'} | ${'2.0.0.1'}       | ${'/add/search/'}
    `('$siteType $version -> $expectedPath', ({ siteType, version, expectedPath }) => {
        expect(getVersionConfig(siteType, version).searchPath).toBe(expectedPath);
    });

    test('does not treat "|" as a version digit (old [3|4|5|6] character class bug)', () => {
        expect(getVersionConfig('sonarr', '|.0.0.1').searchPath).toBe('/add/new/');
    });

    test('a major version starting with 2 only matches legacy when it is exactly 2.x', () => {
        expect(getVersionConfig('sonarr', '20.0.0.1').searchPath).toBe('/add/new/');
        expect(getVersionConfig('radarr', '20.0.0.1').searchPath).toBe('/add/new/');
    });

    test('missing or empty version falls back to the newest known config instead of throwing', () => {
        expect(getVersionConfig('sonarr', undefined).searchPath).toBe('/add/new/');
        expect(getVersionConfig('sonarr', '').searchPath).toBe('/add/new/');
    });

    test('returns the matching input selector', () => {
        expect(getVersionConfig('sonarr', '5.0.0.1').searchInputSelector).toBe('input[name="seriesLookup"]');
        expect(getVersionConfig('radarr', '6.0.0.1').searchInputSelector).toBe('input[name="movieLookup"]');
    });

    test('unknown site type returns undefined', () => {
        expect(getVersionConfig('nope', '1.0.0')).toBeUndefined();
    });
});
