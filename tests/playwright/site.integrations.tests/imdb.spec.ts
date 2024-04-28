import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedRadarrUrl, getExpectedSonarrUrl } from '../helpers';

const imdbUrl = (imdbId: string): string => `https://www.imdb.com/title/${imdbId}/`;
const servarrQueryId = (imdbId: string): string => `imdb%3A${imdbId}`;

test('imdb tv has sonarr icon', async ({ page }) => {
  const imdbId = 'tt1119644';
  await page.goto(imdbUrl(imdbId));
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toBeVisible();
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedSonarrUrl(servarrQueryId(imdbId)));
});

test('imdb movie has radarr icon', async ({ page }) => {
  const imdbId = 'tt0468569';
  await page.goto(imdbUrl(imdbId));
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toBeVisible();
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedRadarrUrl(servarrQueryId(imdbId)));
});

test('imdb other video has radarr and sonarr icons', async ({ page }) => {
  const imdbId = 'tt1080585';
  await page.goto(imdbUrl(imdbId));
  await expect(page.locator(iconDataLocator)).toHaveCount(2);
  
  // for each icon put the href value in an array and check if it contains the expected values
  const icons = await page.locator(iconDataLocator).all();

  let hrefs = Array<string | null>();
  for (const icon of icons) {
    let href = await icon.getAttribute('href');
    hrefs.push(href);
  }

  expect(hrefs).toEqual(expect.arrayContaining([getExpectedSonarrUrl(servarrQueryId(imdbId)), getExpectedRadarrUrl(servarrQueryId(imdbId))]));
});

