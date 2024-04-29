import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedRadarrUrl, getExpectedSonarrUrl } from '../helpers';

test('simkl tv has sonarr icon', async ({ page }) => {
  await page.goto('https://simkl.com/tv/12022/fringe', { waitUntil: 'commit' });
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedSonarrUrl('Fringe'));
});

test('simkl movie has radarr icon', async ({ page }) => {
  await page.goto('https://simkl.com/movies/53282/the-dark-knight', { waitUntil: 'commit' });
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedRadarrUrl('The%20Dark%20Knight'));
});

test('simkl calendar has sonarr icons', async ({ page }) => {
  await page.goto('https://simkl.com/tv/calendar', { waitUntil: 'commit' });

  await expect(page.locator(iconDataLocator)).not.toHaveCount(0);
});
