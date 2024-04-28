import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedRadarrUrl, getExpectedSonarrUrl } from '../helpers';

const tvShowUrls = ['https://www.betaseries.com/en/show/', 'https://www.betaseries.com/serie/']

tvShowUrls.forEach(async (url) => {
  test(`betaseries tv has sonarr icon at link: ${url}`, async ({ page }) => {
    await page.goto(`${url}fringe`);
    await expect(page.locator(iconDataLocator)).toHaveCount(1);
    await expect(page.locator(iconDataLocator)).toBeVisible();
    await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedSonarrUrl('Fringe'));
  });
});

const movieUrls = ['https://www.betaseries.com/en/movie/', 'https://www.betaseries.com/film/']

movieUrls.forEach(async (url) => {
  test(`betaseries movie has radarr icon at link: ${url}`, async ({ page }) => {
    await page.goto(`${url}139-the-dark-knight`);
    await expect(page.locator(iconDataLocator)).toHaveCount(1);
    await expect(page.locator(iconDataLocator)).toBeVisible();
    await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedRadarrUrl('The%20Dark%20Knight'));
  });
});
