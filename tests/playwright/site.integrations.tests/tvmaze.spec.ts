import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedSonarrUrl } from '../helpers';

test('tvmaze show has sonarr icon', async ({ page }) => {
  await page.goto('https://www.tvmaze.com/shows/158/fringe', { waitUntil: 'commit' });
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedSonarrUrl('Fringe'));
});

test('tvmaze countdown has sonarr icons', async ({ page }) => {
  await page.goto('https://www.tvmaze.com/countdown', { waitUntil: 'commit' });

  await expect(page.locator(iconDataLocator)).not.toHaveCount(0);
});
