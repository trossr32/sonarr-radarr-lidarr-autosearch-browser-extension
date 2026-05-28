import { test, expect } from '../fixtures';
import {
  getExpectedSonarrUrl,
  getExpectedRadarrUrl,
  getExpectedLidarrUrl,
  waitForServarrIcon,
} from '../helpers';

// The Wikipedia integration classifies an article as TV / film / music from its
// categories and injects the matching Servarr icon next to the page title. For
// TV and film the search term is the article's IMDb id (stable); for music it is
// the article title. Assert on a type-specific locator (icon href bound to the
// expected instance) so a page that happens to match more than one engine still
// validates that the correct integration fired with the correct search term.
const iconFor = (href: string): string =>
  `a[data-servarr-icon="true"][href="${href}"]`;

test('wikipedia TV series article has sonarr icon (imdb id)', async ({ page }) => {
  await page.goto('https://en.wikipedia.org/wiki/Breaking_Bad', { waitUntil: 'commit' });

  await waitForServarrIcon(page);

  const expected = getExpectedSonarrUrl('imdb:tt0903747');
  await expect(page.locator(iconFor(expected))).toHaveCount(1);
});

test('wikipedia film article has radarr icon (imdb id)', async ({ page }) => {
  await page.goto('https://en.wikipedia.org/wiki/Inception', { waitUntil: 'commit' });

  await waitForServarrIcon(page);

  const expected = getExpectedRadarrUrl('imdb:tt1375666');
  await expect(page.locator(iconFor(expected))).toHaveCount(1);
});

test('wikipedia musician article has lidarr icon', async ({ page }) => {
  await page.goto('https://en.wikipedia.org/wiki/Metallica', { waitUntil: 'commit' });

  await waitForServarrIcon(page);

  const expected = getExpectedLidarrUrl('Metallica');
  await expect(page.locator(iconFor(expected))).toHaveCount(1);
});
