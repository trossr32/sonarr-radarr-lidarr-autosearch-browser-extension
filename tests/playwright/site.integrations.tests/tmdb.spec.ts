import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedRadarrUrl, getExpectedSonarrUrl } from '../helpers';

// tmdb id doesn't work with sonarr
test('tmdb tv has sonarr icon', async ({ page }) => {
  await page.goto('https://www.themoviedb.org/tv/1705-fringe', { waitUntil: 'networkidle' });
  
  // Wait for extension processing
  await page.waitForTimeout(1000);
  
  // Try to wait for the icon with enhanced error handling
  try {
    await page.waitForSelector(iconDataLocator, { timeout: 10000 });
  } catch (e) {
    const hasExtensionElements = await page.locator('[data-servarr-ext-sonarr-completed], [data-servarr-icon]').count();
    const containerExists = await page.locator('h2[data-testid="title"]').count();
    throw new Error(`Icon not found after 10s. Extension elements: ${hasExtensionElements}, Containers: ${containerExists}. Original error: ${e instanceof Error ? e.message : String(e)}`);
  }
  
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedSonarrUrl('Fringe'), { ignoreCase: true });
});

// tmdb id works with radarr
test('imdb movie has radarr icon', async ({ page }) => {
  await page.goto('https://www.themoviedb.org/movie/155-the-dark-knight', { waitUntil: 'networkidle' });
  
  // Wait for extension processing
  await page.waitForTimeout(1000);
  
  // Try to wait for the icon with enhanced error handling
  try {
    await page.waitForSelector(iconDataLocator, { timeout: 10000 });
  } catch (e) {
    const hasExtensionElements = await page.locator('[data-servarr-ext-radarr-completed], [data-servarr-icon]').count();
    const containerExists = await page.locator('h2[data-testid="title"]').count();
    throw new Error(`Icon not found after 10s. Extension elements: ${hasExtensionElements}, Containers: ${containerExists}. Original error: ${e instanceof Error ? e.message : String(e)}`);
  }
  
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedRadarrUrl('tmdb:155'), { ignoreCase: true });
});
