'use strict';

var settings = {};
var domainList = [];
var UASoptions = ["iOS","Chrome","Safari","Firefox"];
var unsaved = false;


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
    //Add domain column
    newRow["Domain"] = "<input name='domainInput' type='text' value='"+domain+"'></input>";
    //Add UAS column
    var optionsAsString = "";
    for(var i = 0; i < UASoptions.length; i++) {
        optionsAsString += "<option value='" + UASoptions[i] + "'";
        if(UASoptions[i]==settings[domain][0]){optionsAsString+="selected='selected'";}
        optionsAsString += ">" + UASoptions[i] + "</option>";
    }
    newRow["User-Agent String"] = "<select name='UASdropdown'>"+optionsAsString+"</select>";
    // Add probability column
    newRow["Probability"] = "<input name='probInput' type='number' value='"+settings[domain][1]+"' min='0' max='100'></input>%";

    tableData.push(newRow);
  }

  var columns = ["","Domain","User-Agent String","Probability"];  //addAllColumnHeaders(tableData, selector);
  var headerTr$ = $('<tr/>');
  headerTr$.append($('<th/>').html(""));
  headerTr$.append($('<th/>').html("Domain"));
  headerTr$.append($('<th/>').html("User-Agent String"));
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


function saveSettings(){
  unsaved = false;

  $( "#save" ).addClass( "onclic");

  var domainList_new = []
  var settigns_new = {}
  var oTable = document.getElementById('optionsTable');

  //gets rows of table
  var rowLength = oTable.rows.length;

  //loops through rows
  for (var i = 1; i < rowLength; i++){

    //gets cells of current row  
    var newDomain = oTable.rows[i].cells[1].children[0].value;
     //domainList_new.push("https://*"+newDomain+"/*");
     domainList_new.push("*://*."+newDomain+"/*");

     settigns_new[oTable.rows[i].cells[1].children[0].value] = [oTable.rows[i].cells[2].children[0].value,oTable.rows[i].cells[3].children[0].value];
     //console.log(oTable.rows[i].cells[1].children[0].value);
     //console.log(oTable.rows[i].cells[2].children[0].value);
     //console.log(oTable.rows[i].cells[3].children[0].value);
     
  }
  chrome.storage.sync.set({settings: settigns_new}, function() {
      console.log("Settings data updated");
    });
  chrome.storage.sync.set({domainList: domainList_new}, function() {
      console.log("Domain list data updated");
    });

  setTimeout(function() {
      $( "#save" ).removeClass( "onclic" );
      $( "#save" ).addClass( "validate");
      document.getElementById("save").innerHTML = '<i class="fa fa-check" aria-hidden="true"></i>';

    }, 1250 );
        
    setTimeout(function() {
      $( "#save" ).removeClass( "validate" );
      document.getElementById("save").innerHTML = '<i class="fas fa-save"></i> Save';

    }, 2250 );

}


//Insert row in table
 $("#insert-more").click(function () {
     $("#optionsTable").each(function () {
         var tds = '<tr class="new-row">';
          tds += '<td><div class="delRow"><i class="fas fa-minus-circle"></i> <span class="delTag">&nbspDelete</span></div></td><td><input name="domainInput" type="text"></td><td><select name="UASdropdown"><option value="iOS">iOS</option><option value="Chrome">Chrome</option><option value="Safari">Safari</option><option value="Firefox">Firefox</option></select></td><td><input name="probInput" type="number" value="100" min="0" max="100"></input>%</td>'
        tds += '</tr>';
        if ($('tbody', this).length > 0) {
            $('tbody', this).append(tds).children(':last').hide()
        .fadeIn(1000);
        } else {
            console.log("no table entries");
            $(this).append("<tr><th></th><th>Domain</th><th>User-Agent String</th><th>Probability</th></tr>");
            $(this).append(tds);
        }
    });
     unsaved = true;
});



$("#optionsTable").on('click', '.delRow', function () {
    //$(this).closest('tr').remove();

    var badRow = $(this).closest('tr');
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
            
        
});

//Save new options
document.getElementById("save").onclick = saveSettings;

//alert user if unsaved changes exist
function unloadPage(){ 
    if(unsaved){
        return "You have unsaved changes. Are you sure you want to leave this page?";
    }
}

window.onbeforeunload = unloadPage;

