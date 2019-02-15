
'use strict';


// Initial settings, set when extension is first downloaded
var init_settings = {"google.com":['Firefox','100']};
var init_domainList = ["*://*.google.com/*"];


var bgsettings = {}; 
var bgdomainList = [];

// list of User Agent Strings
var UAS = {
            iOS: "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1",
            Firefox: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) Gecko/20100101 Firefox/42.0",
            Chrome: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36",
            Safari: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9"
}
function changeUAS(details) {

    // If the website is specified in the extension, get the following information from storage:
    // 1) New user agent string
    // 2) Associated probability

    // Checks if domain of web request is specified in extension settings
    for (var i = 0; i < details.requestHeaders.length; ++i) {
        if (details.requestHeaders[i].name === 'User-Agent') {
          var rootDomain = extractRootDomain(details.url); // changes current URL into just the domain, to lookup in settings
          //console.log(parseInt(bgsettings[rootDomain][1])/100);
          if (Math.random() <= parseInt(bgsettings[rootDomain][1])/100){  // Determines if UAS will be changed based on prob.
            details.requestHeaders[i].value = UAS[bgsettings[rootDomain][0]];  // Change UAS
            console.log("Changing UAS: "+rootDomain);
            //console.log("NEW UAS: "+UAS[bgsettings[rootDomain][0]]);
          }
          else{
            console.log("Probability: not changing UAS");
          }
          break;
        }
    }
    return {requestHeaders: details.requestHeaders};
}

function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

// Extracts root domain ex. "google.com":
function extractRootDomain(url) {
    var domain = extractHostname(url),
        splitArr = domain.split('.'),
        arrLen = splitArr.length;

    //extracting the root domain here
    //if there is a subdomain 
    if (arrLen > 2) {
        domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
        if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2) {
            //this is using a ccTLD
            domain = splitArr[arrLen - 3] + '.' + domain;
        }
    }
    return domain;
}
// This listener will act on the websites specified in storage (see "urls" at the bottom)
// It will work before the headers are sent
// chrome.webRequest.onBeforeSendHeaders.addListener(
//     ,
//     {urls: bgdomainList, types: ["main_frame"]},
// 	["blocking", "requestHeaders"]
// );
//Update data when it is changed, also refresh listener

// When extension is first installed, add initial data and startup listener
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({settings: init_settings}, function() {
      console.log("Settings data initialized");
    });
    chrome.storage.sync.set({domainList: init_domainList}, function() {
      console.log("Domain list data initialized");
      bgdomainList = init_domainList;
      bgsettings = init_settings;
      chrome.webRequest.onBeforeSendHeaders.addListener(changeUAS, {urls: bgdomainList, types: ["main_frame"]},["blocking", "requestHeaders"]);
      console.log("Added new listener, url list: "+bgdomainList.length);
    });
  });

// Refreshes the listener each time the settings are changed
chrome.storage.onChanged.addListener(function(changes, settings) {
    chrome.storage.sync.get("settings", function (obj) {
      bgsettings = obj["settings"];
    });
    chrome.storage.sync.get("domainList", function (obj) {
      bgdomainList = obj["domainList"];

      if(chrome.webRequest.onBeforeSendHeaders.hasListener(changeUAS)){
        chrome.webRequest.onBeforeSendHeaders.removeListener(changeUAS);
        console.log("Removed old listener");
      }
      chrome.webRequest.onBeforeSendHeaders.addListener(changeUAS, {urls: bgdomainList, types: ["main_frame"]},["blocking", "requestHeaders"]);
    });
  console.log("changes propogated");
  //refresh listener
  

});










