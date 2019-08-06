'use strict';

var settings = {};
var domainList = [];
var setUAS = {};
var rootDomain = "example.com";
var API_IP_ADDRESS = "54.211.13.12";
const UASlist = {
    
      win: {
        Firefox: "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0",
        Chrome: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36",
        },
      mac: {
        Firefox: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) Gecko/20100101 Firefox/42.0",
        Chrome: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36",
        },
      linux: {
        Firefox: "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:49.0) Gecko/20100101 Firefox/49.0",
        Chrome: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36",
        }
    };


chrome.storage.sync.get('settings', function(result) {
    // check if data exists.
    if (result) {
        settings = result['settings'];
        chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
			rootDomain = extractRootDomain(tabs[0].url);
			if (rootDomain in settings){
                // if extension active on this domain...
				if (settings[rootDomain][0]){
					document.getElementById('extension-popup-message').textContent = "UAS has been changed!";
					document.getElementById("extension-popup-popupbg").classList.add('extension-popup-container-green');
					document.getElementById("extension-popup-popupbg").classList.remove('extension-popup-container');
                    document.getElementById("extension-popup-power-button").style.color = "green";
                    document.getElementsByClassName('extension-popup-degradation-options')[0].style.display = 'block';
                    document.getElementById('extension-popup-refresh-button').style.display = 'none';

				}
                else{
                    document.getElementById('extension-popup-uas-extension-newUAS').textContent = "";
                    document.getElementsByClassName('extension-popup-degradation-options')[0].style.display = 'none';
                    document.getElementsByClassName('extension-popup-container')[0].style.width = "300px";
                    document.getElementById('extension-popup-refresh-button').style.display = 'none';

                }
			}
            else{
                document.getElementById('extension-popup-uas-extension-newUAS').textContent = "";
                document.getElementsByClassName('extension-popup-degradation-options')[0].style.display = 'none';
                document.getElementsByClassName('extension-popup-container')[0].style.width = "300px";
                document.getElementById('extension-popup-refresh-button').style.display = 'none';

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

var reqURL = "";
var foundCost = {};

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

    //send to server
    var reqDict = {"websites":[]};
    var innerDict = {};
    innerDict["name"] = rootDomain;
    innerDict["originalUSA"] = navigator.userAgent;
    innerDict["alteredUSA"] = UASlist[setUAS['os']][setUAS['browser']]; ;
    innerDict["costToAlter"] = 0;
    reqDict["websites"].push(innerDict);
    console.log(JSON.stringify(reqDict));
    reqURL = "http://"+API_IP_ADDRESS+"/data?track="+encodeURIComponent(JSON.stringify(reqDict));
    console.log(reqDict);
    console.log(reqURL);
    $.get(
        reqURL,
        function(response) {
          if (response) {
            //if you received a successful return, remove the modal. Either way remove the modal!!
            console.log(response);
            chrome.storage.sync.get('cost', function(result) {
                foundCost = result['cost'];
                foundCost[rootDomain] = 1;
                //Set chrome storage - cost
                chrome.storage.sync.set({cost: foundCost}, function() {
                  console.log("Cost data updated");
                });
            });
          }
          else {
            console.log("Couldn't connect to data track API");
          }
        },
        "text"
      );
} // end nobutton func.
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

    //send to server
    var reqDict = {"websites":[]};
    var innerDict = {};
    innerDict["name"] = rootDomain;
    innerDict["originalUSA"] = navigator.userAgent;
    innerDict["alteredUSA"] = UASlist[setUAS['os']][setUAS['browser']]; ;
    innerDict["costToAlter"] = 2;
    reqDict["websites"].push(innerDict);
    console.log(JSON.stringify(reqDict));
    reqURL = "http://"+API_IP_ADDRESS+"/data?track="+encodeURIComponent(JSON.stringify(reqDict));
    console.log(reqDict);
    console.log(reqURL);
    $.get(
        reqURL,
        function(response) {
          if (response) {
            //if you received a successful return, remove the modal. Either way remove the modal!!
            console.log(response);
            chrome.storage.sync.get('cost', function(result) {
                foundCost = result['cost'];
                foundCost[rootDomain] = 2;
                //Set chrome storage - cost
                chrome.storage.sync.set({cost: foundCost}, function() {
                  console.log("Cost data updated");
                });
            });
          }
          else {
            console.log("Couldn't connect to data track API");
          }
        },
        "text"
      );
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

    //send to server
    var reqDict = {"websites":[]};
    var innerDict = {};
    innerDict["name"] = rootDomain;
    innerDict["originalUSA"] = navigator.userAgent;
    innerDict["alteredUSA"] = UASlist[setUAS['os']][setUAS['browser']]; ;
    innerDict["costToAlter"] = 5;
    reqDict["websites"].push(innerDict);
    console.log(JSON.stringify(reqDict));
    reqURL = "http://"+API_IP_ADDRESS+"/data?track="+encodeURIComponent(JSON.stringify(reqDict));
    console.log(reqDict);
    console.log(reqURL);
    $.get(
        reqURL,
        function(response) {
          if (response) {
            //if you received a successful return, remove the modal. Either way remove the modal!!
            console.log(response);
            chrome.storage.sync.get('cost', function(result) {
                foundCost = result['cost'];
                foundCost[rootDomain] = 5;
                //Set chrome storage - cost
                chrome.storage.sync.set({cost: foundCost}, function() {
                  console.log("Cost data updated");
                });
            });
          }
          else {
            console.log("Couldn't connect to data track API");
          }
        },
        "text"
      );
}

$("#extension-popup-refresh-button").on("click", function(){
    chrome.tabs.reload();
    window.close();
})

$("#extension-popup-power-button").on("click", function(e) {
    if (rootDomain in settings){
        if (settings[rootDomain][0]){
            //This domain is active, let's deactivate it
            settings[rootDomain][0] = false;
            chrome.storage.sync.set({settings: settings}, function() {
                console.log("Settings data updated");

                document.getElementById('extension-popup-message').textContent = "Extension Disabled";
                document.getElementById('extension-popup-uas-extension-newUAS').textContent = "Please refresh the page";
                document.getElementById("extension-popup-popupbg").classList.remove('extension-popup-container-green');
                document.getElementById("extension-popup-popupbg").classList.add('extension-popup-container');
                document.getElementById("extension-popup-power-button").style.color = "#aaa";
                document.getElementsByClassName('extension-popup-degradation-options')[0].style.display = 'none';
                document.getElementsByClassName('extension-popup-container')[0].style.width = "300px";
                document.getElementById('extension-popup-refresh-button').style.display = 'block';

                });

        }
        else{
            //This domain is not active
            settings[rootDomain][0] = true;
            chrome.storage.sync.set({settings: settings}, function() {
                console.log("Settings data updated");
                document.getElementById('extension-popup-message').textContent = "Extension Enabled";
                document.getElementById('extension-popup-uas-extension-newUAS').textContent = "Please refresh the page";
                document.getElementById("extension-popup-popupbg").classList.add('extension-popup-container-green');
                document.getElementById("extension-popup-popupbg").classList.remove('extension-popup-container');
                document.getElementById("extension-popup-power-button").style.color = "green";
                document.getElementById('extension-popup-refresh-button').style.display = 'block';
                });
        }
    }
    else{
        chrome.tabs.create({'url': "../options.html" });
    }

});

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
