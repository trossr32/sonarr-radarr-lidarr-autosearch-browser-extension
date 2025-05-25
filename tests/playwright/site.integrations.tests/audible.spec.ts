import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedReadarrAudiobookUrl } from '../helpers';

test('audible book has readarr icon', async ({ page }) => {
  await page.goto('https://www.audible.com/pd/The-Great-Gatsby-Audiobook/B0B92DQ96X', { waitUntil: 'commit' });
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedReadarrAudiobookUrl('the%20great%20gatsby'), { ignoreCase: true });
});
