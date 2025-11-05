import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedLidarrUrl } from '../helpers';

const servarrQueryId = (lidarrId: string): string => `lidarr:${lidarrId}`;

test('musicbrainz artist has lidarr icon', async ({ page }) => {
  const lidarrId = 'a1ed5e33-22ff-4e7d-a457-42f4309e135f';
  await page.goto(`https://musicbrainz.org/artist/${lidarrId}`, { waitUntil: 'networkidle' });
  
  // MusicBrainz pages can be slow to load completely
  await page.waitForTimeout(3000);
  
  // Try to wait for the icon with enhanced error handling
  try {
    await page.waitForSelector(iconDataLocator, { timeout: 25000 });
  } catch (e) {
    const hasExtensionElements = await page.locator('[data-servarr-ext-sonarr-completed], [data-servarr-icon]').count();
    const containerExists = await page.locator('h1').count();
    throw new Error(`Icon not found after 25s. Extension elements: ${hasExtensionElements}, Containers: ${containerExists}. Original error: ${e instanceof Error ? e.message : String(e)}`);
  }
  
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedLidarrUrl(servarrQueryId(lidarrId)));
});

test('musicbrainz release group has lidarr icon', async ({ page }) => {
  const lidarrId = '33d83c7d-280e-3ca6-98ff-4e473b4252e8';
  await page.goto(`https://musicbrainz.org/release-group/${lidarrId}`, { waitUntil: 'networkidle' });
  
  // MusicBrainz pages can be slow to load completely
  await page.waitForTimeout(3000);
  
  // Try to wait for the icon with enhanced error handling
  try {
    await page.waitForSelector(iconDataLocator, { timeout: 15000 });
  } catch (e) {
    const hasExtensionElements = await page.locator('[data-servarr-ext-sonarr-completed], [data-servarr-icon]').count();
    const containerExists = await page.locator('h1').count();
    throw new Error(`Icon not found after 15s. Extension elements: ${hasExtensionElements}, Containers: ${containerExists}. Original error: ${e instanceof Error ? e.message : String(e)}`);
  }
  
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedLidarrUrl(servarrQueryId(lidarrId)));
});

test('musicbrainz release has lidarr icon', async ({ page }) => {
  const lidarrId = 'c38f3b27-841b-4b88-8e76-448242443bd9'
  await page.goto(`https://musicbrainz.org/release/${lidarrId}`, { waitUntil: 'networkidle' });
  
  // MusicBrainz pages can be slow to load completely
  await page.waitForTimeout(3000);
  
  // Try to wait for the icon with enhanced error handling
  try {
    await page.waitForSelector(iconDataLocator, { timeout: 15000 });
  } catch (e) {
    const hasExtensionElements = await page.locator('[data-servarr-ext-sonarr-completed], [data-servarr-icon]').count();
    const containerExists = await page.locator('h1').count();
    throw new Error(`Icon not found after 15s. Extension elements: ${hasExtensionElements}, Containers: ${containerExists}. Original error: ${e instanceof Error ? e.message : String(e)}`);
  }
  
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedLidarrUrl(servarrQueryId(lidarrId)));
});