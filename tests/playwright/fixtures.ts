import { test as base, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({ }, use) => {
    const pathToExtension = path.resolve(__dirname, '../../dist/chromium');
    console.log('Loading extension from', pathToExtension);
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--headless=new`,
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    // Suppress site service worker registration on trakt domains to avoid 403 noise and timing variance.
    await context.addInitScript(() => {
      try {
        if (location.hostname.endsWith('trakt.tv')) {
          const sw = (navigator as any).serviceWorker;
          if (sw && typeof sw.register === 'function') {
            const orig = sw.register.bind(sw);
            sw.register = function(url: any, options: any) {
              try {
                const href = new URL(url, location.href).href;
                if (href.includes('/service-worker.js')) {
                  return Promise.resolve({
                    unregister: () => Promise.resolve(true),
                    update: () => Promise.resolve(),
                    installing: null,
                    waiting: null,
                    active: null,
                    scope: location.origin + '/',
                  });
                }
              } catch {}
              return orig(url, options);
            };
          }
        }
      } catch {}
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    // for manifest v2:
    /*
    let [background] = context.backgroundPages()
    if (!background)
      background = await context.waitForEvent('backgroundpage')
    */

    // for manifest v3:
    let [background] = context.serviceWorkers();
    if (!background)
      background = await context.waitForEvent('serviceworker');

    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },
});
export const expect = test.expect;