/**
 * Records the website demo video: extension options -> icon palette colours
 * for Sonarr (cyan) and Radarr (pink) -> injected icons on TVDb (Sonarr) and
 * TMDb (Radarr). Output lands in tests/playwright/demo-video/ as a .webm;
 * convert with ffmpeg for docs/assets/img/demo.mp4 (see docs/index.html
 * "In the wild" section):
 *
 *   ffmpeg -y -i tests/playwright/demo-video/<file>.webm -c:v libx264 \
 *     -preset slow -crf 27 -pix_fmt yuv420p -movflags +faststart -an \
 *     docs/assets/img/demo.mp4
 *
 * Run from the repo root (dist/chromium must be built first). Must run
 * HEADED — some sites 403 new-headless Chromium — so a browser window
 * will appear for the duration:
 *   node tests/playwright/record-site-demo.cjs
 */
const { chromium } = require('@playwright/test');
const path = require('path');

const VIEW = { width: 1280, height: 720 };
const OUT_DIR = path.join(__dirname, 'demo-video');

const SONARR_HEX = '00e5ff'; // bright cyan — pops on TVDb's green
const RADARR_HEX = 'ff2ec4'; // bright pink — pops on TMDb's dark header

const TVDB_URL = 'https://thetvdb.com/series/fringe';
const TMDB_URL = 'https://www.themoviedb.org/movie/1891-the-empire-strikes-back';

/** Inject a visible fake cursor that follows real mouse events (recordings have no OS cursor). */
async function ensureCursor(page) {
    await page.evaluate(() => {
        if (document.getElementById('__demo_cursor')) return;
        const c = document.createElement('div');
        c.id = '__demo_cursor';
        c.style.cssText = 'position:fixed;z-index:2147483647;width:22px;height:22px;pointer-events:none;' +
            'border-radius:50%;background:rgba(0,229,133,.28);border:2.5px solid #00b368;' +
            'box-shadow:0 0 8px rgba(0,0,0,.45);transform:translate(-50%,-50%);left:-50px;top:-50px;' +
            'transition:width .12s,height .12s';
        document.documentElement.appendChild(c);
        window.addEventListener('mousemove', e => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; }, true);
        window.addEventListener('mousedown', () => { c.style.width = '14px'; c.style.height = '14px'; }, true);
        window.addEventListener('mouseup', () => { c.style.width = '22px'; c.style.height = '22px'; }, true);
    });
}

/** Glide the mouse to the centre of a locator, then optionally click. */
async function glide(page, locator, opts = {}) {
    const box = await locator.boundingBox();
    if (!box) throw new Error('No bounding box for locator');
    const x = box.x + box.width / 2 + (opts.dx || 0);
    const y = box.y + box.height / 2 + (opts.dy || 0);
    await page.mouse.move(x, y, { steps: 30 });
    await page.waitForTimeout(opts.settle ?? 350);
    if (opts.click) {
        await page.mouse.down();
        await page.waitForTimeout(120);
        await page.mouse.up();
    }
    return { x, y };
}

/**
 * Open the Spectrum picker for a colour input and land on an exact hex.
 * This Spectrum build keeps the input visible; the picker opens on click.
 * @param play also drag around the saturation square / hue bar first
 */
async function pickColour(page, inputSelector, hex, { play } = {}) {
    await glide(page, page.locator(inputSelector), { click: true, settle: 500 });
    await page.waitForSelector('.sp-container:not(.sp-hidden)', { timeout: 5000 });
    await page.waitForTimeout(600);

    const picker = page.locator('.sp-container:not(.sp-hidden)');

    if (play) {
        // Play with the saturation/value square so the live preview visibly changes
        const sq = await picker.locator('.sp-color').boundingBox();
        await page.mouse.move(sq.x + sq.width * 0.85, sq.y + sq.height * 0.25, { steps: 25 });
        await page.mouse.down();
        await page.mouse.move(sq.x + sq.width * 0.6, sq.y + sq.height * 0.55, { steps: 20 });
        await page.mouse.move(sq.x + sq.width * 0.9, sq.y + sq.height * 0.2, { steps: 20 });
        await page.mouse.up();
        await page.waitForTimeout(500);

        // Slide the hue bar for more movement
        const hb = await picker.locator('.sp-hue').boundingBox();
        await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height * 0.75, { steps: 20 });
        await page.mouse.down();
        await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height * 0.38, { steps: 25 });
        await page.mouse.up();
        await page.waitForTimeout(600);
    }

    // Land on the exact colour via the hex input, then confirm
    const hexInput = picker.locator('.sp-input');
    await glide(page, hexInput, { click: true, settle: 300 });
    await hexInput.fill('');
    await hexInput.type(hex, { delay: 90 });
    await hexInput.press('Enter');
    await page.waitForTimeout(900);

    const choose = picker.locator('.sp-choose');
    if (await choose.isVisible().catch(() => false)) {
        await glide(page, choose, { click: true, settle: 400 });
    } else {
        await page.mouse.click(300, 120); // click away to close
    }
    await page.waitForTimeout(800);
}

/** Poll for and dismiss common cookie-consent overlays (they often render late). */
async function dismissConsent(page, totalMs) {
    const selectors = [
        '#onetrust-accept-btn-handler',
        'button[data-testid="accept-button"]',
        'button:has-text("Accept")',
        'button:has-text("Consent")',
        'a:has-text("Accept")',
    ];
    const deadline = Date.now() + totalMs;
    while (Date.now() < deadline) {
        for (const sel of selectors) {
            const btn = page.locator(sel).first();
            if (await btn.isVisible().catch(() => false)) {
                await btn.click().catch(() => {});
                await page.waitForTimeout(800);
                return true;
            }
        }
        await page.waitForTimeout(400);
    }
    return false;
}

/** Navigate to an integration site, wait for the injected icon, spotlight it. */
async function showIconOnSite(page, url) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await dismissConsent(page, 4000);

    // MV3 one-shot injection can be missed on a fresh tab load; reload recovers it.
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            await page.waitForSelector('[data-servarr-icon]', { state: 'attached', timeout: 15000 });
            break;
        } catch {
            if (attempt === 2) throw new Error(`Servarr icon was not injected on ${url}`);
            await page.reload({ waitUntil: 'domcontentloaded' });
        }
    }

    await dismissConsent(page, 2500);
    await ensureCursor(page);

    const icon = page.locator('[data-servarr-icon]').first();
    await icon.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    await page.waitForTimeout(1300);
    await glide(page, icon, { settle: 600 });

    // Pulse the icon so the eye lands on it
    await icon.evaluate(el => {
        el.style.transition = 'transform .35s';
        let n = 0;
        const t = setInterval(() => {
            el.style.transform = (n % 2 === 0) ? 'scale(1.35)' : 'scale(1)';
            if (++n >= 4) clearInterval(t);
        }, 380);
    });
    await page.waitForTimeout(2400);
}

(async () => {
    const pathToExtension = path.resolve(__dirname, '../../dist/chromium');
    const context = await chromium.launchPersistentContext('', {
        headless: false,
        args: [
            `--disable-extensions-except=${pathToExtension}`,
            `--load-extension=${pathToExtension}`,
            `--window-size=${VIEW.width},${VIEW.height}`,
        ],
        viewport: VIEW,
        deviceScaleFactor: 1,
        recordVideo: { dir: OUT_DIR, size: VIEW },
    });

    try {
        let [background] = context.serviceWorkers();
        if (!background) background = await context.waitForEvent('serviceworker');
        const extensionId = background.url().split('/')[2];

        const page = context.pages()[0] || await context.newPage();

        // ---- Scene 1: options page, reveal the icon palette -------------------
        await page.goto(`chrome-extension://${extensionId}/options.html`);
        await page.waitForSelector('#btnToggleAdvanced', { timeout: 15000 });
        await ensureCursor(page);
        await page.waitForTimeout(1600);

        await glide(page, page.locator('#btnToggleAdvanced'), { click: true, settle: 500 });
        await page.waitForTimeout(700);

        // Bring the Sonarr/Radarr icon palettes into view (side-by-side cards)
        await page.locator('#sonarrIconBg').evaluate(el =>
            el.closest('.js-adv-block').scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await page.waitForTimeout(1100);
        await ensureCursor(page);

        // ---- Scene 2: cyan for Sonarr, pink for Radarr -------------------------
        await pickColour(page, '#sonarrIconBg', SONARR_HEX, { play: true });
        await pickColour(page, '#radarrIconBg', RADARR_HEX);
        await page.waitForTimeout(1200);

        // ---- Scene 3: the cyan Sonarr icon on TVDb ------------------------------
        await showIconOnSite(page, TVDB_URL);

        // ---- Scene 4: the pink Radarr icon on TMDb ------------------------------
        await showIconOnSite(page, TMDB_URL);

        const video = page.video();
        await page.close();
        const videoPath = await video.path();
        console.log('Recorded:', videoPath);
    } finally {
        await context.close();
    }
})();
