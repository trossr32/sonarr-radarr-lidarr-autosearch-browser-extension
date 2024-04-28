import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedRadarrUrl, getExpectedSonarrUrl } from '../helpers';

test('allocine tv has sonarr icon', async ({ page }) => {
  await page.goto('https://www.allocine.fr/series/ficheserie_gen_cserie=3584.html');
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toBeVisible();
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedSonarrUrl('fringe'));
});

test('allocine movie has radarr icon', async ({ page }) => {
  await page.goto('https://www.allocine.fr/film/fichefilm_gen_cfilm=115362.html');
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toBeVisible();
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedRadarrUrl('the%20dark%20knight%2C%20le%20chevalier%20noir'));
});
