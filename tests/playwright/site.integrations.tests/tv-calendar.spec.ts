import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { waitForServarrIcon } from '../helpers';

test('tv calendar page has sonarr icons', async ({ page }) => {
  await page.goto('https://www.pogdesign.co.uk/cat', { waitUntil: 'commit' });

  // Wait for the extension to inject (reloads if the MV3 service worker missed it)
  await waitForServarrIcon(page);

  await expect(page.locator(iconDataLocator)).not.toHaveCount(0);
});
