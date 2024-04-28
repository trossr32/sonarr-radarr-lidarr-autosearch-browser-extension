import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedRadarrUrl } from '../helpers';

test('letterboxd movie has radarr icon', async ({ page }) => {
  await page.goto('https://letterboxd.com/film/the-dark-knight/');
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedRadarrUrl('tmdb%3A155'));
});
