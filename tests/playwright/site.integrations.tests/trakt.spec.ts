import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedRadarrUrl, getExpectedSonarrUrl, handleTraktCookieOverlay } from '../helpers';

// SKIPPED: Trakt now serves a Cloudflare "Just a moment..." bot-challenge
// interstitial to the automated browser, so the real show/movie page never
// loads. These live tests cannot pass under automation until the Cloudflare
// challenge is bypassed or removed. Verify the Trakt integration manually in a
// normal browser session. Re-enable (test.skip -> test) if the challenge stops
// being served to Playwright.
//
// The app.trakt.tv redesign only renders IMDb links inside the details drawer
// (?view=details), so detail pages search by title unless that drawer is open.
test.skip('trakt tv has sonarr icon', async ({ page }) => {
    test.slow();
    await page.goto('https://app.trakt.tv/shows/fringe', { waitUntil: 'commit' });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await handleTraktCookieOverlay(page);
    await page.waitForSelector('.trakt-summary-title h1', { timeout: 20000 });
    await page.waitForSelector(iconDataLocator, { timeout: 20000 });
    await expect(page.locator(iconDataLocator)).toHaveCount(1, { timeout: 20000 });
    await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedSonarrUrl('Fringe'), { ignoreCase: true, timeout: 20000 });
});

// SKIPPED: see note above — Cloudflare bot challenge blocks automated loads.
test.skip('trakt movie has radarr icon', async ({ page }) => {
    test.slow();
    await page.goto('https://app.trakt.tv/movies/the-dark-knight-2008', { waitUntil: 'commit' });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await handleTraktCookieOverlay(page);
    await page.waitForSelector('.trakt-summary-title h1', { timeout: 20000 });
    await page.waitForSelector(iconDataLocator, { timeout: 20000 });
    await expect(page.locator(iconDataLocator)).toHaveCount(1, { timeout: 20000 });
    await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedRadarrUrl('The%20Dark%20Knight'), { ignoreCase: true, timeout: 20000 });
});

// SKIPPED: see note above.
test.skip('trakt movie details drawer upgrades radarr icon to imdb id', async ({ page }) => {
    test.slow();
    await page.goto('https://app.trakt.tv/movies/the-dark-knight-2008?view=details', { waitUntil: 'commit' });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await handleTraktCookieOverlay(page);
    await page.waitForSelector('a[href^="https://www.imdb.com/title/tt"]', { timeout: 20000 });
    await page.waitForSelector(iconDataLocator, { timeout: 20000 });
    await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedRadarrUrl('imdb:tt0468569'), { ignoreCase: true, timeout: 20000 });
});

// Listings live under /discover/* (the old /shows/trending etc. redirect there).
['show', 'movie'].forEach(mode => {
    // SKIPPED: see note above.
    test.skip(`trakt discover trending ${mode} has icons`, async ({ page }) => {
        test.slow();
        await page.goto(`https://app.trakt.tv/discover/trending?mode=${mode}`, { waitUntil: 'load' });
        await handleTraktCookieOverlay(page);
        await page.waitForSelector(iconDataLocator, { timeout: 20000 });
        await expect(page.locator(iconDataLocator)).not.toHaveCount(0);
    });
});
