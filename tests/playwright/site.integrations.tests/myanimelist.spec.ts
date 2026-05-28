import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedRadarrUrl, getExpectedSonarrUrl, waitForServarrIcon } from '../helpers';

test('myanimelist tv has sonarr icon', async ({ page }) => {
  test.slow();
  await page.goto('https://myanimelist.net/anime/813/Dragon_Ball_Z', { waitUntil: 'commit', timeout: 60000 });
  
  // Wait for the extension to inject (reloads if the MV3 service worker missed it)
  await waitForServarrIcon(page);
  
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedSonarrUrl('Dragon%20Ball%20Z'), { ignoreCase: true });
});

test('myanimelist movie has radarr icon', async ({ page }) => {
  test.slow();
  await page.goto('https://myanimelist.net/anime/47/Akira', { waitUntil: 'commit', timeout: 60000 });
  
  // Wait for the extension to inject (reloads if the MV3 service worker missed it)
  await waitForServarrIcon(page);
    
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedRadarrUrl('Akira'), { ignoreCase: true });
});
