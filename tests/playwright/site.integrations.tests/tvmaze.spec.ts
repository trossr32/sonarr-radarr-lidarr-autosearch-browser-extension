import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedSonarrUrl, waitForServarrIcon } from '../helpers';

test('tvmaze show has sonarr icon', async ({ page }) => {
  await page.goto('https://www.tvmaze.com/shows/158/fringe', { waitUntil: 'commit' });
  
  // Wait for the extension to inject (reloads if the MV3 service worker missed it)
  await waitForServarrIcon(page);

  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedSonarrUrl('Fringe'), { ignoreCase: true });
});

test('tvmaze countdown has sonarr icons', async ({ page }) => {
  await page.goto('https://www.tvmaze.com/countdown', { waitUntil: 'commit' });
  
  // Wait for the extension to inject (reloads if the MV3 service worker missed it)
  await waitForServarrIcon(page);

  await expect(page.locator(iconDataLocator)).not.toHaveCount(0);
});

test('tvmaze shows directory has sonarr icons', async ({ page }) => {
  await page.goto('https://www.tvmaze.com/shows', { waitUntil: 'commit' });

  // Wait for the extension to inject (reloads if the MV3 service worker missed it)
  await waitForServarrIcon(page);

  await expect(page.locator(iconDataLocator)).not.toHaveCount(0);
});