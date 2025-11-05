import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedSonarrUrl } from '../helpers';

test('tvmaze show has sonarr icon', async ({ page }) => {
  await page.goto('https://www.tvmaze.com/shows/158/fringe', { waitUntil: 'networkidle' });
  
  // Wait for extension processing
  await page.waitForTimeout(1000);
  
  // Try to wait for the icon with enhanced error handling
  try {
    await page.waitForSelector(iconDataLocator, { timeout: 10000 });
  } catch (e) {
    const hasExtensionElements = await page.locator('[data-servarr-ext-sonarr-completed], [data-servarr-icon]').count();
    const containerExists = await page.locator('h1').count();
    throw new Error(`Icon not found after 10s. Extension elements: ${hasExtensionElements}, Containers: ${containerExists}. Original error: ${e instanceof Error ? e.message : String(e)}`);
  }
  
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedSonarrUrl('Fringe'), { ignoreCase: true });
});

test('tvmaze countdown has sonarr icons', async ({ page }) => {
  await page.goto('https://www.tvmaze.com/countdown', { waitUntil: 'networkidle' });
  
  // Wait for content to load and extension processing
  await page.waitForTimeout(2000);
  
  // Wait for at least one icon to appear
  await page.waitForSelector(iconDataLocator, { timeout: 15000 });

  await expect(page.locator(iconDataLocator)).not.toHaveCount(0);
});
