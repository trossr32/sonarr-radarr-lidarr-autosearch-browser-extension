import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedRadarrUrl, getExpectedSonarrUrl } from '../helpers';

const imdbUrl = (imdbId: string): string => `https://www.imdb.com/title/${imdbId}/`;
const servarrQueryId = (imdbId: string): string => `imdb:${imdbId}`;

test('imdb tv has sonarr icon', async ({ page }) => {
  const imdbId = 'tt1119644';
  await page.goto(imdbUrl(imdbId), { waitUntil: 'networkidle' });
  
  // Wait for extension processing
  await page.waitForTimeout(1000);
  
  // Try to wait for the icon with enhanced error handling
  try {
    await page.waitForSelector(iconDataLocator, { timeout: 10000 });
  } catch (e) {
    const hasExtensionElements = await page.locator('[data-servarr-ext-sonarr-completed], [data-servarr-icon]').count();
    const containerExists = await page.locator('[data-testid="hero-title-block__title"]').count();
    throw new Error(`Icon not found after 10s. Extension elements: ${hasExtensionElements}, Containers: ${containerExists}. Original error: ${e instanceof Error ? e.message : String(e)}`);
  }
  
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedSonarrUrl(servarrQueryId(imdbId)));
});

test('imdb movie has radarr icon', async ({ page }) => {
  const imdbId = 'tt0468569';
  await page.goto(imdbUrl(imdbId), { waitUntil: 'networkidle' });
  
  // Wait for extension processing
  await page.waitForTimeout(1000);
  
  // Try to wait for the icon with enhanced error handling
  try {
    await page.waitForSelector(iconDataLocator, { timeout: 10000 });
  } catch (e) {
    const hasExtensionElements = await page.locator('[data-servarr-ext-radarr-completed], [data-servarr-icon]').count();
    const containerExists = await page.locator('[data-testid="hero-title-block__title"]').count();
    throw new Error(`Icon not found after 10s. Extension elements: ${hasExtensionElements}, Containers: ${containerExists}. Original error: ${e instanceof Error ? e.message : String(e)}`);
  }
  
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedRadarrUrl(servarrQueryId(imdbId)));
});

test('imdb other video has radarr and sonarr icons', async ({ page }) => {
  const imdbId = 'tt1080585';
  await page.goto(imdbUrl(imdbId), { waitUntil: 'networkidle' });
  
  // Wait for extension processing
  await page.waitForTimeout(1000);
  
  // Try to wait for the icons with enhanced error handling
  try {
    await page.waitForSelector(iconDataLocator, { timeout: 10000 });
  } catch (e) {
    const hasExtensionElements = await page.locator('[data-servarr-ext-sonarr-completed], [data-servarr-icon]').count();
    const containerExists = await page.locator('[data-testid="hero-title-block__title"]').count();
    throw new Error(`Icons not found after 10s. Extension elements: ${hasExtensionElements}, Containers: ${containerExists}. Original error: ${e instanceof Error ? e.message : String(e)}`);
  }
  
  await expect(page.locator(iconDataLocator)).toHaveCount(2);
  
  // for each icon put the href value in an array and check if it contains the expected values
  const icons = await page.locator(iconDataLocator).all();

  let hrefs = Array<string | null>();
  for (const icon of icons) {
    let href = await icon.getAttribute('href');
    hrefs.push(href);
  }

  expect(hrefs).toEqual(expect.arrayContaining([getExpectedSonarrUrl(servarrQueryId(imdbId)), getExpectedRadarrUrl(servarrQueryId(imdbId))]));
});

