// post the current url

var port = chrome.runtime.connect({name: 'init'});

var init = function() {
    port.postMessage({ url: window.location.href });
};

$(function () {
    init();
});