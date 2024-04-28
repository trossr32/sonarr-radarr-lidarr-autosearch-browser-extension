import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';

test('tv calendar page has sonarr icons', async ({ page }) => {
  await page.goto('https://www.pogdesign.co.uk/cat', { waitUntil: 'commit' });

  await expect(page.locator(iconDataLocator)).not.toHaveCount(0);
});
