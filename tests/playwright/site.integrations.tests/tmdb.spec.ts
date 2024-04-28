import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedRadarrUrl, getExpectedSonarrUrl } from '../helpers';

// tmdb id doesn't work with sonarr
test('tmdb tv has sonarr icon', async ({ page }) => {
  await page.goto('https://www.themoviedb.org/tv/1705-fringe');
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toBeVisible();
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedSonarrUrl('Fringe'));
});

// tmdb id works with radarr
test('imdb movie has radarr icon', async ({ page }) => {
  await page.goto('https://www.themoviedb.org/movie/155-the-dark-knight');
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toBeVisible();
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedRadarrUrl('tmdb%3A155'));
});
