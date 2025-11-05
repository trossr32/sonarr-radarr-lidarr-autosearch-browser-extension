import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedRadarrUrl, getExpectedSonarrUrl } from '../helpers';

test('metacritic tv has sonarr icon', async ({ page }) => {
  await page.goto('https://www.metacritic.com/tv/fringe/', { waitUntil: 'networkidle' });
  
  // Wait a bit longer for Metacritic's deferred processing (has deferMs: 500 + SPA)
  await page.waitForTimeout(2000);
  
  // Try to wait for the icon with a longer timeout
  try {
    await page.waitForSelector(iconDataLocator, { timeout: 15000 });
  } catch (e) {
    // If wait fails, check if extension loaded by looking for any servarr-related elements
    const hasExtensionElements = await page.locator('[data-servarr-ext-completed], [data-servarr-icon]').count();
    console.log(`Extension elements found: ${hasExtensionElements}`);
    
    // Check if the target container exists
    const containerExists = await page.locator('div[class*="productHero_title"]').count();
    console.log(`Target containers found: ${containerExists}`);
    
    // Re-throw the original error with context
    throw new Error(`Icon not found after 15s. Extension elements: ${hasExtensionElements}, Containers: ${containerExists}. Original error: ${e instanceof Error ? e.message : String(e)}`);
  }
  
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedSonarrUrl('Fringe'), { ignoreCase: true });
});

test('metacritic movie has radarr icon', async ({ page }) => {
  await page.goto('https://www.metacritic.com/movie/the-dark-knight/', { waitUntil: 'networkidle' });
  
  // Wait a bit longer for Metacritic's deferred processing (has deferMs: 500 + SPA)
  await page.waitForTimeout(2000);
  
  // Try to wait for the icon with a longer timeout
  try {
    await page.waitForSelector(iconDataLocator, { timeout: 15000 });
  } catch (e) {
    // If wait fails, check if extension loaded by looking for any servarr-related elements
    const hasExtensionElements = await page.locator('[data-servarr-ext-completed], [data-servarr-icon]').count();
    console.log(`Extension elements found: ${hasExtensionElements}`);
    
    // Check if the target container exists
    const containerExists = await page.locator('div[class*="productHero_title"]').count();
    console.log(`Target containers found: ${containerExists}`);
    
    // Re-throw the original error with context
    throw new Error(`Icon not found after 15s. Extension elements: ${hasExtensionElements}, Containers: ${containerExists}. Original error: ${e instanceof Error ? e.message : String(e)}`);
  }
  
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedRadarrUrl('The%20Dark%20Knight'), { ignoreCase: true });
});
