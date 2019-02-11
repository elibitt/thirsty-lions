
'use strict';


// Retrieve URL list from storage
// These are the websites that the extension will act on
var init_settings = {"google.com":['Mozilla','100']};
var init_domainList = ["https://*google.com/*"];

var settings = {};
var domainList = [];

// This listener will act on the websites specified in storage (see "urls" at the bottom)
// It will work before the headers are sent
chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
		// If the website is specified in the extension, get the following information from storage:
		// 1) New user agent string
		// 2) Associated probability
		var new_uas = "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0"; // New user agent string 
        for (var i = 0; i < details.requestHeaders.length; ++i) {
            if (details.requestHeaders[i].name === 'User-Agent') {
				details.requestHeaders[i].value = new_uas;
				break;
            }
        }
		return {requestHeaders: details.requestHeaders};
    },
    {urls: domainList },
	["blocking", "requestHeaders"]
);


 chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({settings: init_settings}, function() {
      console.log("Settings data initialized");
    });
    chrome.storage.sync.set({domainList: init_domainList}, function() {
      console.log("Domain list data initialized");
    });
  });