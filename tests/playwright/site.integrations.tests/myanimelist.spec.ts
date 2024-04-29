import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedRadarrUrl, getExpectedSonarrUrl } from '../helpers';

test('myanimelist tv has sonarr icon', async ({ page }) => {
  await page.goto('https://myanimelist.net/anime/813/Dragon_Ball_Z', { waitUntil: 'commit' });
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedSonarrUrl('Dragon%20Ball%20Z'));
});

test('myanimelist movie has radarr icon', async ({ page }) => {
  await page.goto('https://myanimelist.net/anime/47/Akira', { waitUntil: 'commit' });
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedRadarrUrl('Akira'));
});
