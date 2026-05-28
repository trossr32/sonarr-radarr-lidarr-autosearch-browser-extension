import type { Page } from '@playwright/test';
import { iconDataLocator } from './constants';

/**
 * Wait for the Servarr icon to be injected, reloading the page if it doesn't
 * appear. The extension injects its content scripts programmatically from the
 * MV3 service worker on tab `complete`; under parallel test load that one-shot
 * injection can be missed for a tab, so the page loads with no content script
 * at all. A reload re-triggers the inject path and reliably recovers it. Real
 * users (single page at a time) are not affected by this race.
 * @param page Playwright Page
 * @param opts.timeoutMs Per-attempt wait for the icon (default 8000ms)
 * @param opts.reloads Max reloads to attempt if the icon is missing (default 2)
 */
export async function waitForServarrIcon(
	page: Page,
	opts: { timeoutMs?: number; reloads?: number } = {}
): Promise<void> {
	const timeoutMs = opts.timeoutMs ?? 8000;
	const reloads = opts.reloads ?? 2;

	for (let attempt = 0; attempt <= reloads; attempt++) {
		try {
			await page.waitForSelector(iconDataLocator, { timeout: timeoutMs });
			return;
		} catch {
			if (attempt === reloads) {
				throw new Error(`Servarr icon was not injected after ${reloads} reload(s)`);
			}
			await page.reload({ waitUntil: 'domcontentloaded' });
		}
	}
}

/**
 * Get the expected Sonarr URL for a given add new path query
 * @param query 
 * @returns expected Sonarr URL
 */
export const getExpectedSonarrUrl = (query: string): string => `http://my.sonarr-url.domain:8989/add/new/${query}`;

/**
 * Get the expected Radarr URL for a given add new path query
 * @param query
 * @returns expected Radarr URL
 */
export const getExpectedRadarrUrl = (query: string): string => `http://my.radarr-url.domain:7878/add/new/${query}`;

/**
 * Get the expected Lidarr URL for a given search query
 * @param query
 * @returns expected Lidarr URL
 */
export const getExpectedLidarrUrl = (query: string): string => `http://my.lidarr-url.domain:8686/add/search/${query}`;

/**
 * If Trakt's cookie overlay is present, accept it and reload the page.
 * Safe to call on any page; no-ops quickly when overlay not shown.
 */
export async function handleTraktCookieOverlay(page: import('@playwright/test').Page): Promise<void> {
	const overlay = page.locator('.trakt-cookie-notice');
	const consentBtn = overlay.locator('button');

	try {
		// Wait briefly for the overlay to appear
		const visible = await overlay.isVisible({ timeout: 2000 });

		if (!visible) return;

		await consentBtn.first().click({ timeout: 2000 });

		// Give the app a moment to settle any client-side state
		await page.waitForTimeout(2000);

		await hardReload(page);
	} catch {
		// Swallow errors to keep tests resilient if overlay markup changes
	}
}

/**
 * Perform a hard reload of the given page, bypassing cache.
 * Tries to use Chromium CDP for a true cache bypass, but falls back to
 * a cache-busting navigation for other browsers.
 * @param page Playwright Page to reload
 * @returns void
 */
export async function hardReload(page: Page): Promise<void> {
    // Try Chromium CDP first (true cache bypass)
    try {
        const client = await page.context().newCDPSession(page);
        
        await client.send('Network.enable');
        await client.send('Network.setCacheDisabled', { cacheDisabled: true });
        
        await page.reload({ waitUntil: 'networkidle' });
        
        await client.send('Network.setCacheDisabled', { cacheDisabled: false });

        return;
    } catch {
        // Non-Chromium or CDP not available — fall back to cache-busting nav
    }

    // Cross-browser fallback: add a bust param and navigate
    const u = new URL(page.url());
    u.searchParams.set('__bust', Date.now().toString());
    await page.goto(u.toString(), { waitUntil: 'networkidle' });
}