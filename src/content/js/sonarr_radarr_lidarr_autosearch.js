async function init() {
  try {
    await browser.runtime.sendMessage({ type: 'init' });
  } catch (e) {
    // In very old Firefox builds this can fail on restricted pages; just swallow.
    console.debug('init message failed', e);
  }
}

$(function () {
    console.log('sonarr_radarr_lidarr_autosearch.js loaded');
    init();
});