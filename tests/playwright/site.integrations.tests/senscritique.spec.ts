import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedRadarrUrl, getExpectedSonarrUrl } from '../helpers';

test('senscritique tv has sonarr icon', async ({ page }) => {
  await page.goto('https://www.senscritique.com/serie/fringe/164968', { waitUntil: 'commit' });
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedSonarrUrl('Fringe'));
});

test('senscritique movie has radarr icon', async ({ page }) => {
  await page.goto('https://www.senscritique.com/film/the_dark_knight_le_chevalier_noir/419456', { waitUntil: 'commit' });
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedRadarrUrl('The%20Dark%20Knight%20-%20Le%20Chevalier%20noir'));
});
