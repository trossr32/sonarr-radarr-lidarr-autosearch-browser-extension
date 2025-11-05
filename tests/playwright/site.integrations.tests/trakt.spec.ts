import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedRadarrUrl, getExpectedSonarrUrl, handleTraktCookieOverlay } from '../helpers';

test('trakt tv has sonarr icon', async ({ page }) => {
    await page.goto('https://app.trakt.tv/shows/fringe', { waitUntil: 'load' });
    await page.waitForTimeout(1000);
    await handleTraktCookieOverlay(page);
    await page.waitForTimeout(1000);
    await page.waitForSelector(iconDataLocator, { timeout: 15000 });
    await expect(page.locator(iconDataLocator)).toHaveCount(1, { timeout: 15000 });
    await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedSonarrUrl('imdb:tt1119644'), { ignoreCase: true, timeout: 15000 });
});

test('trakt movie has radarr icon', async ({ page }) => {
    await page.goto('https://app.trakt.tv/movies/the-dark-knight-2008', { waitUntil: 'load' });
    await page.waitForTimeout(1000);
    await handleTraktCookieOverlay(page);
    await page.waitForTimeout(1000);
    await page.waitForSelector(iconDataLocator, { timeout: 15000 });
    await expect(page.locator(iconDataLocator)).toHaveCount(1, { timeout: 15000 });
    await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedRadarrUrl('imdb:tt0468569'), { ignoreCase: true, timeout: 15000 });
});

// const tvShowViews = ['trending', 'popular', 'anticipated' /*, 'favorited/weekly', 'watched/weekly', 'collected/weekly'*/]

// tvShowViews.forEach(view => {
//     test(`trakt tv view ${view} has sonarr icons`, async ({ page }) => {
//         await page.goto(`https://app.trakt.tv/shows/${view}`, { waitUntil: 'load' });
//         await page.waitForTimeout(1000);
//         await handleTraktCookieOverlay(page);
//         await page.waitForTimeout(1000);
//         await page.waitForSelector(iconDataLocator, { timeout: 15000 });
//         await expect(page.locator(iconDataLocator)).not.toHaveCount(0);
//     });
// });

// const movieViews = ['trending', 'popular', 'anticipated' /*, 'favorited/weekly', 'watched/weekly', 'collected/weekly', 'boxoffice'*/];

// movieViews.forEach(view => {
//     test(`trakt movie view ${view} has radarr icons`, async ({ page }) => {
//         await page.goto(`https://app.trakt.tv/movies/${view}`, { waitUntil: 'load' });
//         await page.waitForTimeout(1000);
//         await handleTraktCookieOverlay(page);
//         await page.waitForTimeout(1000);
//         await page.waitForSelector(iconDataLocator, { timeout: 15000 });
//         await expect(page.locator(iconDataLocator)).not.toHaveCount(0);
//     });
// });