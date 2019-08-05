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
                // if extension active on this domain...
				if (settings[rootDomain][0]){
					document.getElementById('extension-popup-message').textContent = "UAS has been changed!";
					document.getElementById("extension-popup-popupbg").classList.add('extension-popup-container-green');
					document.getElementById("extension-popup-popupbg").classList.remove('extension-popup-container');
                    document.getElementById("extension-popup-power-button").style.color = "green";
                    document.getElementsByClassName('extension-popup-degradation-options')[0].style.display = 'block';

				}
                else{
                    document.getElementById('extension-popup-uas-extension-newUAS').textContent = "";
                    document.getElementsByClassName('extension-popup-degradation-options')[0].style.display = 'none';
                    document.getElementsByClassName('extension-popup-container')[0].style.width = "300px";

                }
			}
            else{
                document.getElementById('extension-popup-uas-extension-newUAS').textContent = "";
                document.getElementsByClassName('extension-popup-degradation-options')[0].style.display = 'none';
                document.getElementsByClassName('extension-popup-container')[0].style.width = "300px";

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
        var ddBrowser = document.getElementById("extension-popup-browserDropdown");
        var ddOS = document.getElementById("extension-popup-osDropdown");
        var newOS = setUAS['os'] == 'win' ? 'Windows' : setUAS['os'] == 'mac' ? 'Mac OS X' : 'Linux';
        document.getElementById('extension-popup-uas-extension-newUAS').textContent = newOS + " on " + setUAS['browser']; 
    } else {
        console.log("No settings data found");
    }
  });

$("#extension-popup-settings-button").click(function () {
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

//Handle degradation buttons
var noButton = document.getElementById("extension-popup-no-button");
var bitButton = document.getElementById("extension-popup-bit-button");
var lotButton = document.getElementById("extension-popup-lot-button");

noButton.onclick = function(){
    noButton.style.background = "green";
    noButton.style.color = "white";
    bitButton.style.background = "#eee";
    bitButton.style.color = "#000";
    lotButton.style.background = "#eee";
    lotButton.style.color = "#000";
    selectText('extension-popup-target-text');
    noButton.blur();
    document.getElementById("extension-popup-target-text").textContent = "Great! Thanks for your feedback.";
}
bitButton.onclick = function(){
    bitButton.style.background = "orange";
    bitButton.style.color = "white";
    noButton.style.background = "#eee";
    noButton.style.color = "#000";
    lotButton.style.background = "#eee";
    lotButton.style.color = "#000";
    selectText('extension-popup-target-text');
    bitButton.blur();
    document.getElementById("extension-popup-target-text").textContent = "Got it, click above to disable extension on this site.";

}
lotButton.onclick = function(){
    lotButton.style.background = "lightcoral";
    lotButton.style.color = "white";
    noButton.style.background = "#eee";
    noButton.style.color = "#000";
    bitButton.style.background = "#eee";
    bitButton.style.color = "#000";
    selectText('extension-popup-target-text');
    lotButton.blur();
    document.getElementById("extension-popup-target-text").textContent = "Okay, we've disabled the extension on this website.";

}

function selectText(node) {
    node = document.getElementById(node);

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
}
function deselectText() {
    const selection = window.getSelection();
    selection.removeAllRanges();
}
