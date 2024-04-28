import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedRadarrUrl, getExpectedSonarrUrl } from '../helpers';

test('metacritic tv has sonarr icon', async ({ page }) => {
  await page.goto('https://www.metacritic.com/tv/fringe/');
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toBeVisible();
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedSonarrUrl('Fringe'));
});

test('metacritic movie has radarr icon', async ({ page }) => {
  await page.goto('https://www.metacritic.com/movie/the-dark-knight/');
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toBeVisible();
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedRadarrUrl('The%20Dark%20Knight'));
});
