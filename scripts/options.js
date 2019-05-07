'use strict';

var settings = {};
var domainList = [];
var setUAS = {};
var UASoptions = ["iOS","Chrome","Safari","Firefox"];
var unsaved = false;

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

//Check if settings data exists, initialize it
function initPage(){

  chrome.storage.sync.get('settings', function(result) {
    // check if data exists.
    if (result) {
        settings = result['settings'];
        console.log("Found settings data");
        buildHtmlTable('#optionsTable');
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
        var ddBrowser = document.getElementById("browserDropdown");
        var ddOS = document.getElementById("osDropdown");
        //set browser dropdown
        var browserOpts = ddBrowser.options.length;
        for (var i=0; i<browserOpts; i++){
            if (ddBrowser.options[i].value == setUAS['browser']){
                ddBrowser.options[i].selected = true;
                break;
            }
        }
        //set OS dropdown
        var osOpts = ddOS.options.length;
        for (var i=0; i<osOpts; i++){
            if (ddOS.options[i].value == setUAS['os']){
                ddOS.options[i].selected = true;
                break;
            }
        }
        document.getElementById('newUAS').textContent = UASlist[setUAS['os']][setUAS['browser']]; 
    } else {
        console.log("No settings data found");
    }
  });
  var d = new Date();
  document.getElementById('curyear').innerHTML = d.getFullYear();
  document.getElementById('curUAS').textContent = navigator.userAgent; 

  document.getElementById('browserDropdown').addEventListener("change", updateNewUAS);
  document.getElementById('osDropdown').addEventListener("change", updateNewUAS);


}

function updateNewUAS(){
  var ddBrowser = document.getElementById("browserDropdown");
  var ddOS = document.getElementById("osDropdown");
  document.getElementById('newUAS').textContent = UASlist[ddOS.value][ddBrowser.value];
  unsaved = true;
}



// Builds the HTML Table out of domain list.
function buildHtmlTable(selector) {
  console.log("In buildHtmlTable");
  var tableData = [];
  
  //make html string dictionary

  for (var domain in settings){
    var newRow = {};
    // Add delete column
    newRow[""] = "<div class='delRow'><i class='fas fa-minus-circle'></i> <span class='delTag'>&nbspDelete</span></div>";
    // Add active column
    newRow["Active"] = '<label class="switch"> <input type="checkbox"'+(settings[domain][0] ? "checked" : "")+'> <span class="slider round"></span> </label>';
    //Add domain column
    newRow["Domain"] = "<input name='domainInput' class='domainInput' type='text' placeholder='example.com' value='"+domain+"'></input>";
    //Add UAS column
    // var optionsAsString = "";
    // for(var i = 0; i < UASoptions.length; i++) {
    //     optionsAsString += "<option value='" + UASoptions[i] + "'";
    //     if(UASoptions[i]==settings[domain][0]){optionsAsString+="selected='selected'";}
    //     optionsAsString += ">" + UASoptions[i] + "</option>";
    // }
    // newRow["User-Agent String"] = "<select name='UASdropdown'>"+optionsAsString+"</select>";
    // Add probability column
    newRow["Probability"] = "<input name='probInput' class='probInput' type='number' value='"+settings[domain][1]+"' min='0' max='100'></input>%";

    tableData.push(newRow);
  }

  var columns = ["","Active","Domain","Probability"];  //addAllColumnHeaders(tableData, selector);
  var headerTr$ = $('<tr/>');
  headerTr$.append($('<th/>').html(""));
  headerTr$.append($('<th/>').html("Active"));
  headerTr$.append($('<th/>').html("Domain"));
  headerTr$.append($('<th/>').html("Probability"));
  $(selector).append(headerTr$);


  for (var i = 0; i < tableData.length; i++) {
    var row$ = $('<tr/>');
    for (var colIndex = 0; colIndex < columns.length; colIndex++) {
      var cellValue = tableData[i][columns[colIndex]];
      if (cellValue == null) cellValue = "";
      row$.append($('<td/>').html(cellValue));
    }
    $(selector).append(row$);
  }
  // Adds the drop down box to each table entry
  setupListeners();
}


// Adds a header row to the table and returns the set of columns.
// Need to do union of keys from all records as some records may not contain
// all records.
function addAllColumnHeaders(tableData, selector) {
  var columnSet = [];
  var headerTr$ = $('<tr/>');

  for (var i = 0; i < tableData.length; i++) {
    var rowHash = tableData[i];
    for (var key in rowHash) {
      if ($.inArray(key, columnSet) == -1) {
        columnSet.push(key);
        headerTr$.append($('<th/>').html(key));
      }
    }
  }
  $(selector).append(headerTr$);

  return columnSet;
}

//Build that table!
window.onload = initPage();


//TODO: check if any entries in table before going through it..

var testGlobal = null;

function saveSettings(){
  unsaved = false;

  $( "#save" ).addClass( "onclic");
  $( "#saveG" ).addClass( "onclic");

  var domainList_new = []
  var settings_new = {}
  var oTable = document.getElementById('optionsTable');

  //gets rows of table
  var rowLength = oTable.rows.length;

  //loops through rows

  //first validate all entries in table, then save all entries to chrome storage
  for (var i = 1; i < rowLength; i++){

    //gets cells of current row  
    var newActive = oTable.rows[i].cells[1].children[0].children[0].checked;
    var newDomain = oTable.rows[i].cells[2].children[0].value;
    var newProb = oTable.rows[i].cells[3].children[0].value;

    //Validation of domain ( should be of form "google.com" - not contain any www. or https://, etc...)
    if (newDomain == "" || newProb == ""){
      //highlight offending row
      oTable.rows[i].classList.add("error-row");
      $( "#save" ).removeClass( "onclic" );
      $( "#saveG" ).removeClass( "onclic" );

      alert("Did not save! Blank values are not allowed for domains or probabilities.");
      return;
    }
    else{
      oTable.rows[i].classList.remove("error-row");
    }
    // Update domain list
     domainList_new.push("*://*."+newDomain+"/*");
    // Update settings list
     settings_new[newDomain] = [newActive, newProb];
  }
  //Get UAS Selections
  var ddBrowser = document.getElementById("browserDropdown");
  var ddOS = document.getElementById("osDropdown");
  var saveNewUAS = {'os':ddOS.value, 'browser':ddBrowser.value};
  document.getElementById('newUAS').textContent = UASlist[ddOS.value][ddBrowser.value]; 

  chrome.storage.sync.set({setUAS: saveNewUAS}, function() {
      console.log("new UAS updated");
    });
  chrome.storage.sync.set({settings: settings_new}, function() {
      console.log("Settings data updated");
    });
  chrome.storage.sync.set({domainList: domainList_new}, function() {
      console.log("Domain list data updated");
    });

  setTimeout(function() {
      $( "#save" ).removeClass( "onclic" );
      $( "#saveG" ).removeClass( "onclic" );
      $( "#save" ).addClass( "validate");
      $( "#saveG" ).addClass( "validate");
      document.getElementById("save").innerHTML = '<i class="fa fa-check" aria-hidden="true"></i>';
      document.getElementById("saveG").innerHTML = '<i class="fa fa-check" aria-hidden="true"></i>';

    }, 1000 );
        
    setTimeout(function() {
      $( "#save" ).removeClass( "validate" );
      $( "#saveG" ).removeClass( "validate" );
      document.getElementById("save").innerHTML = '<i class="fas fa-save"></i> Save';
      document.getElementById("saveG").innerHTML = '<i class="fas fa-save"></i> Save';

    }, 2000 );

}


//Insert row in table
 $("#insert-more").click(function () {
     $("#optionsTable").each(function () {
         var tds = '<tr class="new-row">';
          tds += '<td><div class="delRow"><i class="fas fa-minus-circle"></i> <span class="delTag">&nbspDelete</span></div></td><td><label class="switch"><input type="checkbox"><span class="slider round"></span></label></td><td><input name="domainInput" class="domainInput" placeholder="example.com" type="text"></td><td><input name="probInput" class="probInput" type="number" value="100" min="0" max="100"></input>%</td>'
        tds += '</tr>';
        if ($('tbody', this).length > 0) {
            $('tbody', this).append(tds).children(':last').hide()
        .fadeIn(500);
        } else {
            console.log("no table entries");
            $(this).append("<tr><th></th><th>Active</th><th>Domain</th><th>Probability</th></tr>");
            $(this).append(tds);
        }
    });
     unsaved = true;
});

//Entry constraints...
function setupListeners() {
    //Don't allow user to type http:// or www.
    $(".domainInput").keydown(function(e) {
      console.log("check1");
        var oldvalue=$(this).val();
        var field=this;
        setTimeout(function () {
            if(field.value.indexOf('http://') == 0) {
                $(field).val(field.value.substring(7));
                $(field).fadeTo(100, 0.3, function() { $(this).fadeTo(500, 1.0); });
            }
            if(field.value.indexOf('https://') == 0) {
                $(field).val(field.value.substring(8));
                $(field).fadeTo(100, 0.3, function() { $(this).fadeTo(500, 1.0); });
            }
            if(field.value.indexOf('www.') == 0){
                $(field).val(field.value.substring(4));
                $(field).fadeTo(100, 0.3, function() { $(this).fadeTo(500, 1.0); });
            }
        }, 1);
    });
    //Doesn't allow user to enter values outside of 0-100 or non number chars
    $(".probInput").keydown(function(e) {
        console.log("check2");

        var oldvalue=$(this).val();
        var field=this;
        setTimeout(function () {
            if(field.value > 100 || field.value < 0) {
                $(field).val(oldvalue);
                $(field).fadeTo(100, 0.3, function() { $(this).fadeTo(500, 1.0); });
            }
            if(isNaN(field.value)) {
                $(field).val(oldvalue);
                $(field).fadeTo(100, 0.3, function() { $(this).fadeTo(500, 1.0); });
            }
           
        }, 1);
    });
}


$("#optionsTable").on('click', '.delRow', function () {
    //$(this).closest('tr').remove();

    var badRow = $(this).closest('tr');
    // confirms deletion unless domain is blank
      if (badRow.find(".domainInput")[0].value != ""){
        if (confirm('Are you sure you want to delete this entry?')) {
          badRow.css("background-color","#FF3700");
          badRow.fadeOut(400, function(){
            badRow.remove();
            saveSettings();
          }); 
        } 
        else {
          // do nothing
        }
      }
      //if domain blank, just delete the row
      else{
        badRow.css("background-color","#FF3700");
        badRow.fadeOut(400, function(){
        badRow.remove();
        
            }); 
      }

            
        
});

//Save new options
document.getElementById("save").onclick = saveSettings;
document.getElementById("saveG").onclick = saveSettings;

//alert user if unsaved changes exist
function unloadPage(){ 
    if(unsaved){
        return "You have unsaved changes. Are you sure you want to leave this page?";
    }
}

window.onbeforeunload = unloadPage;

