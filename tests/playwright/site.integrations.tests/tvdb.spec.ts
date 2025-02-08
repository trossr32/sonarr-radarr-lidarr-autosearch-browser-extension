import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedRadarrUrl, getExpectedSonarrUrl } from '../helpers';

// tvdb id works with sonarr
test('tvdb tv has sonarr icon', async ({ page }) => {
  await page.goto('https://www.thetvdb.com/series/fringe', { waitUntil: 'commit' });
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedSonarrUrl('tvdb:82066'), { ignoreCase: true });
});

// tvdb id doesn't work with radarr
test('tvdb movie has radarr icon', async ({ page }) => {
  await page.goto('https://thetvdb.com/movies/the-dark-knight', { waitUntil: 'commit' });
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedRadarrUrl('The%20Dark%20Knight'), { ignoreCase: true });
});
