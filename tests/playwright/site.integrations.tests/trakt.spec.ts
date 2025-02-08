import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedRadarrUrl, getExpectedSonarrUrl } from '../helpers';

test('trakt tv has sonarr icon', async ({ page }) => {
  await page.goto('https://trakt.tv/shows/fringe', { waitUntil: 'commit' });
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedSonarrUrl('imdb:tt1119644'), { ignoreCase: true });
});

test('trakt movie has radarr icon', async ({ page }) => {
  await page.goto('https://trakt.tv/movies/the-dark-knight-2008', { waitUntil: 'commit' });
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedRadarrUrl('tmdb:155'), { ignoreCase: true });
});

const tvShowViews = ['trending', 'popular', 'favorited/weekly', 'watched/weekly', 'collected/weekly', 'anticipated']

tvShowViews.forEach(view => {
  test(`trakt tv view ${view} has sonarr icons`, async ({ page }) => {
    await page.goto(`https://trakt.tv/shows/${view}`, { waitUntil: 'commit' });
    await expect(page.locator(iconDataLocator)).not.toHaveCount(0);
  });
});

const movieViews = ['trending', 'popular', 'favorited/weekly', 'watched/weekly', 'collected/weekly', 'anticipated', 'boxoffice'];

movieViews.forEach(view => {
  test(`trakt movie view ${view} has radarr icons`, async ({ page }) => {
    await page.goto(`https://trakt.tv/movies/${view}`, { waitUntil: 'commit' });
    await expect(page.locator(iconDataLocator)).not.toHaveCount(0);
  });
});