import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedLidarrUrl } from '../helpers';

test('last.fm artist has lidarr icon', async ({ page }) => {
  await page.goto('https://www.last.fm/music/Aqua', { waitUntil: 'commit' });
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedLidarrUrl('Aqua'));
});