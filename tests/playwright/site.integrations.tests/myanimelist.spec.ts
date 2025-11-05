import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedRadarrUrl, getExpectedSonarrUrl } from '../helpers';

test('myanimelist tv has sonarr icon', async ({ page }) => {
  test.slow();
  await page.goto('https://myanimelist.net/anime/813/Dragon_Ball_Z', { waitUntil: 'networkidle', timeout: 60000 });
  
  // Wait for extension processing
  await page.waitForTimeout(2000);
  
  // Try to wait for the icon with enhanced error handling
  try {
    await page.waitForSelector(iconDataLocator, { timeout: 15000 });
  } catch (e) {
    const hasExtensionElements = await page.locator('[data-servarr-ext-sonarr-completed], [data-servarr-icon]').count();
    const containerExists = await page.locator('h1.title-name').count();
    throw new Error(`Icon not found after 15s. Extension elements: ${hasExtensionElements}, Containers: ${containerExists}. Original error: ${e instanceof Error ? e.message : String(e)}`);
  }
  
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedSonarrUrl('Dragon%20Ball%20Z'), { ignoreCase: true });
});

test('myanimelist movie has radarr icon', async ({ page }) => {
  test.slow();
  await page.goto('https://myanimelist.net/anime/47/Akira', { waitUntil: 'networkidle', timeout: 60000 });
  
  // Wait for extension processing
  await page.waitForTimeout(2000);
  
  // Try to wait for the icon with enhanced error handling
  try {
    await page.waitForSelector(iconDataLocator, { timeout: 15000 });
  } catch (e) {
    const hasExtensionElements = await page.locator('[data-servarr-ext-radarr-completed], [data-servarr-icon]').count();
    const containerExists = await page.locator('h1.title-name').count();
    throw new Error(`Icon not found after 15s. Extension elements: ${hasExtensionElements}, Containers: ${containerExists}. Original error: ${e instanceof Error ? e.message : String(e)}`);
  }
  
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedRadarrUrl('Akira'), { ignoreCase: true });
});
