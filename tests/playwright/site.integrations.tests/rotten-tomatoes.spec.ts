import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedRadarrUrl, getExpectedSonarrUrl } from '../helpers';

test('rotten tomatoes tv has sonarr icon', async ({ page }) => {
  await page.goto('https://www.rottentomatoes.com/tv/fringe', { waitUntil: 'networkidle' });
  
  // Wait for extension processing
  await page.waitForTimeout(1000);
  
  // Try to wait for the icon with enhanced error handling
  try {
    await page.waitForSelector(iconDataLocator, { timeout: 10000 });
  } catch (e) {
    const hasExtensionElements = await page.locator('[data-servarr-ext-sonarr-completed], [data-servarr-icon]').count();
    const containerExists = await page.locator('h1[data-qa="score-panel-title"]').count();
    throw new Error(`Icon not found after 10s. Extension elements: ${hasExtensionElements}, Containers: ${containerExists}. Original error: ${e instanceof Error ? e.message : String(e)}`);
  }
  
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedSonarrUrl('fringe'), { ignoreCase: true });
});

test('rotten tomatoes movie has radarr icon', async ({ page }) => {
  await page.goto('https://www.rottentomatoes.com/m/the_dark_knight', { waitUntil: 'networkidle' });
  
  // Wait for extension processing
  await page.waitForTimeout(1000);
  
  // Try to wait for the icon with enhanced error handling
  try {
    await page.waitForSelector(iconDataLocator, { timeout: 10000 });
  } catch (e) {
    const hasExtensionElements = await page.locator('[data-servarr-ext-radarr-completed], [data-servarr-icon]').count();
    const containerExists = await page.locator('h1[data-qa="score-panel-title"]').count();
    throw new Error(`Icon not found after 10s. Extension elements: ${hasExtensionElements}, Containers: ${containerExists}. Original error: ${e instanceof Error ? e.message : String(e)}`);
  }
  
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedRadarrUrl('the%20dark%20knight'), { ignoreCase: true });
});
