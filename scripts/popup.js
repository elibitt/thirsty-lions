'use strict';

var settings = {};
var domainList = [];
var setUAS = {};





chrome.storage.sync.get('settings', function(result) {
    // check if data exists.
    if (result) {
        settings = result['settings'];
        console.log("Found settings data");
        chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
			var rootDomain = extractRootDomain(tabs[0].url);
			if (rootDomain in settings){
				if (settings[rootDomain][0]){
					document.getElementById('message').textContent = "UAS has been changed!";
					document.getElementById("popupbg").classList.add('container-green');
					document.getElementById("popupbg").classList.remove('container');
				}
			}
		});
    } else {
        console.log("No settings data found");
    }
  });
chrome.storage.sync.get('domainList', function(result) {
    // check if data exists.
    if (result) {
        domainList = result;
        console.log("Found domainList data");
    } else {
        console.log("No domainList data found");
    }
  });
chrome.storage.sync.get('setUAS', function(result) {
    // check if data exists.
    if (result) {
        setUAS = result['setUAS'];
        console.log("Found setUAS data");
    } 
    else {
        console.log("No UAS data found");
    }
  });

$("#settings-button").click(function () {
	chrome.tabs.create({'url': "../options.html" } )
});





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