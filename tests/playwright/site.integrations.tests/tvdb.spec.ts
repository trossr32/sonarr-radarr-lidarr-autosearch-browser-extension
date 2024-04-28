import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedRadarrUrl, getExpectedSonarrUrl } from '../helpers';

// tvdb id works with sonarr
test('tvdb tv has sonarr icon', async ({ page }) => {
  await page.goto('https://www.thetvdb.com/series/fringe');
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toBeVisible();
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedSonarrUrl('tvdb%3A82066'));
});

// tvdb id doesn't work with radarr
test('tvdb movie has radarr icon', async ({ page }) => {
  await page.goto('https://thetvdb.com/movies/the-dark-knight');
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toBeVisible();
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedRadarrUrl('The%20Dark%20Knight'));
});
