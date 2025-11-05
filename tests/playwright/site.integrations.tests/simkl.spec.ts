import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedRadarrUrl, getExpectedSonarrUrl } from '../helpers';

test('simkl tv has sonarr icon', async ({ page }) => {
  await page.goto('https://simkl.com/tv/12022/fringe', { waitUntil: 'networkidle' });
  
  // Wait for Simkl's deferred processing (has deferMs: 1000)
  await page.waitForTimeout(2000);
  
  // Try to wait for the icon with enhanced error handling
  try {
    await page.waitForSelector(iconDataLocator, { timeout: 15000 });
  } catch (e) {
    const hasExtensionElements = await page.locator('[data-servarr-ext-sonarr-completed], [data-servarr-icon]').count();
    const containerExists = await page.locator('.show-title').count();
    throw new Error(`Icon not found after 15s. Extension elements: ${hasExtensionElements}, Containers: ${containerExists}. Original error: ${e instanceof Error ? e.message : String(e)}`);
  }
  
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedSonarrUrl('Fringe'), { ignoreCase: true });
});

test('simkl movie has radarr icon', async ({ page }) => {
  test.slow();
  await page.goto('https://simkl.com/movies/53282/the-dark-knight', { waitUntil: 'networkidle', timeout: 60000});
  
  // Wait for Simkl's deferred processing (has deferMs: 1000)
  await page.waitForTimeout(2000);
  
  // Try to wait for the icon with enhanced error handling
  try {
    await page.waitForSelector(iconDataLocator, { timeout: 15000 });
  } catch (e) {
    const hasExtensionElements = await page.locator('[data-servarr-ext-radarr-completed], [data-servarr-icon]').count();
    const containerExists = await page.locator('.movie-title').count();
    throw new Error(`Icon not found after 15s. Extension elements: ${hasExtensionElements}, Containers: ${containerExists}. Original error: ${e instanceof Error ? e.message : String(e)}`);
  }
  
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedRadarrUrl('The%20Dark%20Knight'), { ignoreCase: true });
});

test('simkl calendar has sonarr icons', async ({ page }) => {
  await page.goto('https://simkl.com/tv/calendar', { waitUntil: 'networkidle' });
  
  // Wait for Simkl's deferred processing and page content to load
  await page.waitForTimeout(3000);
  
  // Wait for at least one icon to appear
  await page.waitForSelector(iconDataLocator, { timeout: 15000 });
  
  await expect(page.locator(iconDataLocator)).not.toHaveCount(0);
});
