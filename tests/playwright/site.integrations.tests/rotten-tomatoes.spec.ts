import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedRadarrUrl, getExpectedSonarrUrl } from '../helpers';

test('rotten tomatoes tv has sonarr icon', async ({ page }) => {
  await page.goto('https://www.rottentomatoes.com/tv/fringe', { waitUntil: 'commit' });
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedSonarrUrl('fringe'), { ignoreCase: true });
});

test('rotten tomatoes movie has radarr icon', async ({ page }) => {
  await page.goto('https://www.rottentomatoes.com/m/the_dark_knight', { waitUntil: 'commit' });
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedRadarrUrl('the%20dark%20knight'), { ignoreCase: true });
});
