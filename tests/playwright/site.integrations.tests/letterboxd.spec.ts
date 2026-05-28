import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedRadarrUrl, getExpectedSonarrUrl, waitForServarrIcon } from '../helpers';

test('letterboxd movie has radarr icon', async ({ page }) => {
  await page.goto('https://letterboxd.com/film/the-dark-knight/', { waitUntil: 'commit' });

  // Wait for the extension to inject (reloads if the MV3 service worker missed it)
  await waitForServarrIcon(page);

  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedRadarrUrl('imdb:tt0468569'), { ignoreCase: true });
});

test('letterboxd movie has sonarr icon', async ({ page }) => {
  await page.goto('https://letterboxd.com/film/chernobyl/', { waitUntil: 'commit' });

  // Wait for the extension to inject (reloads if the MV3 service worker missed it)
  await waitForServarrIcon(page);

  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedSonarrUrl('imdb:tt7366338'), { ignoreCase: true });
});
