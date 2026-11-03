const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const context = vm.createContext({});
vm.runInContext(read('src/content/js/core.js'), context);
const build = vm.runInContext('buildServarrSearchUrl', context);

for (const searchPath of ['/add/new', '/add/new/']) {
    test(`native search with ${searchPath}, reverse proxy and special characters`, () => {
        const term = 'Dark / S01 & S02 + 日本語 #1?';
        const url = new URL(build('https://host/sonarr/', searchPath, encodeURIComponent(term)));
        assert.equal(url.pathname, '/sonarr/add/new');
        assert.equal(url.searchParams.get('term'), term);
        assert.equal(url.hash, '');
    });
}
for (const searchPath of ['/addseries/', '/addmovies/', '/add/search/', '/custom?q=']) {
    test(`preserve configured path ${searchPath}`, () => {
        assert.equal(build('https://host/', searchPath, 'tvdb:123'), `https://host${searchPath}tvdb:123`);
    });
}
for (const file of ['src/eventPage.js', 'src/eventPage.chrome.js']) {
    test(`context menu produces native search URL: ${file}`, async () => {
        const source = read(file);
        const handler = source.slice(source.indexOf('async function onClickHandler('), source.indexOf('browser.contextMenus?.onClicked'));
        const urls = [];
        const sandbox = vm.createContext({
            buildServarrSearchUrl: build,
            getSettings: async () => ({ sites: [{ id: 'sonarr', domain: 'https://host/sonarr/', searchPath: '/add/new/' }] }),
            browser: { tabs: { create: async ({ url }) => urls.push(url) } }
        });
        vm.runInContext(handler, sandbox);
        await sandbox.onClickHandler({ menuItemId: 'sonarrMenu', selectionText: 'Dark & tvdb:123' });
        assert.equal(urls.length, 1);
        assert.equal(new URL(urls[0]).pathname, '/sonarr/add/new');
        assert.equal(new URL(urls[0]).searchParams.get('term'), 'Dark & tvdb:123');
    });
}
test('page integration links use shared URL builder', () => {
    assert.match(read('src/content/js/content_script.js'), /const link = buildServarrSearchUrl\(site.domain, site.searchPath,/);
});
test('native query search is not overwritten by legacy input injection', async () => {
    const source = read('src/content/js/content_script.js');
    const start = source.indexOf('async function runServarrSearchInjection()');
    const end = source.indexOf('// URL change detection', start);
    let waited = false;
    const sandbox = vm.createContext({
        URL,
        window: { location: { href: 'https://host/add/new/?term=Dark%20%26%20Light' } },
        getSettings: async () => ({ config: { enabled: true }, sites: [{ enabled: true, domain: 'https://host', searchPath: '/add/new/', searchInputSelector: 'input' }] }),
        log: () => {},
        $: { each: (sites, callback) => sites.forEach((site, i) => callback(i, site)) },
        waitForEl: () => { waited = true; }
    });
    vm.runInContext(source.slice(start, end), sandbox);
    await sandbox.runServarrSearchInjection();
    assert.equal(waited, false);
});
