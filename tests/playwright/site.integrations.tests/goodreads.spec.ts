import { iconDataLocator } from '../constants';
import { test, expect } from '../fixtures';
import { getExpectedReadarrAudiobookUrl } from '../helpers';

test('goodreads book has readarr icon', async ({ page }) => {
  await page.goto('https://www.goodreads.com/book/show/4671.The_Great_Gatsby', { waitUntil: 'commit' });
  await expect(page.locator(iconDataLocator)).toHaveCount(1);
  await expect(page.locator(iconDataLocator)).toHaveAttribute('href', getExpectedReadarrAudiobookUrl('the%20great%20gatsby'), { ignoreCase: true });
});
