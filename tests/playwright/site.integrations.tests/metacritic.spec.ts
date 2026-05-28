import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedRadarrUrl, getExpectedSonarrUrl, waitForServarrIcon } from '../helpers';

test('metacritic tv has sonarr icon', async ({ page }) => {
  await page.goto('https://www.metacritic.com/tv/fringe/', { waitUntil: 'commit' });
  
  // Wait for the extension to inject (reloads if the MV3 service worker missed it);
  // the engine's own retry then handles Metacritic's late-rendered hero title.
  await waitForServarrIcon(page);

  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedSonarrUrl('Fringe'), { ignoreCase: true });
});

test('metacritic movie has radarr icon', async ({ page }) => {
  await page.goto('https://www.metacritic.com/movie/the-dark-knight/', { waitUntil: 'commit' });
  
  // Wait for the extension to inject (reloads if the MV3 service worker missed it);
  // the engine's own retry then handles Metacritic's late-rendered hero title.
  await waitForServarrIcon(page);

  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedRadarrUrl('The%20Dark%20Knight'), { ignoreCase: true });
});
