import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedRadarrUrl, getExpectedSonarrUrl, waitForServarrIcon } from '../helpers';

const imdbUrl = (imdbId: string): string => `https://www.imdb.com/title/${imdbId}/`;
// Exercise the real content scripts without depending on IMDb bot protection,
// consent screens or changes to the selected live titles' metadata.
test.beforeEach(async ({ page }) => {
  const types: Record<string, string> = {
    tt1119644: 'video.tv_show',
    tt0468569: 'video.movie',
    tt1080585: 'other',
  };
  await page.route('https://www.imdb.com/title/**', async route => {
    const url = new URL(route.request().url());
    const id = url.pathname.split('/')[2];
    const type = types[id];
    if (!type) return route.abort();
    await route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html><html><head>
        <link rel="canonical" href="${imdbUrl(id)}">
        <meta property="og:type" content="${type}">
        </head><body><h1>IMDb integration fixture</h1></body></html>`,
    });
  });
});

const servarrQueryId = (imdbId: string): string => `imdb:${imdbId}`;

test('imdb tv has sonarr icon', async ({ page }) => {
  const imdbId = 'tt1119644';
  await page.goto(imdbUrl(imdbId), { waitUntil: 'commit' });
  
  // Wait for the extension to inject (reloads if the MV3 service worker missed it)
  await waitForServarrIcon(page);
  
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedSonarrUrl(servarrQueryId(imdbId)));
});

test('imdb movie has radarr icon', async ({ page }) => {
  const imdbId = 'tt0468569';
  await page.goto(imdbUrl(imdbId), { waitUntil: 'commit' });
  
  // Wait for the extension to inject (reloads if the MV3 service worker missed it)
  await waitForServarrIcon(page);
  
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedRadarrUrl(servarrQueryId(imdbId)));
});

test('imdb other video has radarr and sonarr icons', async ({ page }) => {
  const imdbId = 'tt1080585';
  await page.goto(imdbUrl(imdbId), { waitUntil: 'commit' });
  
  // Wait for the extension to inject (reloads if the MV3 service worker missed it)
  await waitForServarrIcon(page);

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

