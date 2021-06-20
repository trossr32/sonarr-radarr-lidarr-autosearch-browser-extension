// post the current url

var port = browser.runtime.connect({name: 'init'});

var init = function() {
    port.postMessage({ url: window.location.href });
};

$(function () {
    init();
});