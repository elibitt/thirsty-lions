var MOBILE_CHROME_USER_AGENT = 'Mozilla/5.0 (Linux; U; Android-4.0.3; en-us; Galaxy Nexus Build/IML74K) AppleWebKit/535.7 (KHTML, like Gecko) CrMo/16.0.912.75 Mobile Safari/535.7';
chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        for (var i = 0; i < details.requestHeaders.length; ++i) {
            if (details.requestHeaders[i].name === 'User-Agent') {
                details.requestHeaders[i].value = MOBILE_CHROME_USER_AGENT;
                break;
            }
        }
        return {requestHeaders: details.requestHeaders};
    }, {urls: ['<all_urls>']}, ['blocking', 'requestHeaders']);