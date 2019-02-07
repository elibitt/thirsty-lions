var domainList = [
  { "":"<div class='delRow'><i class='fas fa-minus-circle'></i> <span class='delTag'>&nbspDelete</span></div>","Domain": "<input name='domainInput' type='text' value='google.com'></input>", "User-Agent String": "<select name='UASdropdown'></select>", "Probability": "<input name='probInput' type='number' value='100' min='0' max='100'></input>%" },
  { "":"<div class='delRow'><i class='fas fa-minus-circle'></i> <span class='delTag'>&nbspDelete</span></div>","Domain": "<input name='domainInput' type='text' value='yahoo.com'></input>", "User-Agent String": "<select name='UASdropdown'></select>", "Probability": "<input name='probInput' type='number' value='100' min='0' max='100'></input>%" },
  { "":"<div class='delRow'><i class='fas fa-minus-circle'></i> <span class='delTag'>&nbspDelete</span></div>","Domain": "<input name='domainInput' type='text' value='facebook.com'></input>", "User-Agent String": "<select name='UASdropdown'></select>", "Probability": "<input name='probInput' type='number' value='100' min='0' max='100'></input>%" }
];

var UASoptions = ["iOS","Chrome","Safari","Mozila"];

// Builds the HTML Table out of domain list.
function buildHtmlTable(selector) {
  var columns = addAllColumnHeaders(domainList, selector);

  for (var i = 0; i < domainList.length; i++) {
    var row$ = $('<tr/>');
    for (var colIndex = 0; colIndex < columns.length; colIndex++) {
      var cellValue = domainList[i][columns[colIndex]];
      if (cellValue == null) cellValue = "";
      row$.append($('<td/>').html(cellValue));
    }
    $(selector).append(row$);
  }
  // Adds the drop down box to each table entry
  var optionsAsString = "";
  for(var i = 0; i < UASoptions.length; i++) {
      optionsAsString += "<option value='" + UASoptions[i] + "'>" + UASoptions[i] + "</option>";
  }
  $( 'select[name="UASdropdown"]' ).append( optionsAsString );
}


// Adds a header row to the table and returns the set of columns.
// Need to do union of keys from all records as some records may not contain
// all records.
function addAllColumnHeaders(domainList, selector) {
  var columnSet = [];
  var headerTr$ = $('<tr/>');

  for (var i = 0; i < domainList.length; i++) {
    var rowHash = domainList[i];
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


//Insert row in table
 $("#insert-more").click(function () {
     $("#optionsTable").each(function () {
         var tds = '<tr>';
          tds += '<td><div class="delRow"><i class="fas fa-minus-circle"></i> <span class="delTag">&nbspDelete</span></div></td><td><input name="domainInput" type="text"></td><td><select name="UASdropdown"><option value="iOS">iOS</option><option value="Chrome">Chrome</option><option value="Safari">Safari</option><option value="Mozila">Mozila</option></select></td><td><input name="probInput" type="number" value="100" min="0" max="100"></input>%</td>'
        tds += '</tr>';
        if ($('tbody', this).length > 0) {
            $('tbody', this).append(tds);
        } else {
            $(this).append(tds);
        }
    });
});



$("#optionsTable").on('click', '.delRow', function () {
    //$(this).closest('tr').remove();

    var badRow = $(this).closest('tr');
        if (confirm('Are you sure you want to delete this entry?')) {
          badRow.css("background-color","#FF3700");
          badRow.fadeOut(400, function(){
            badRow.remove();
          }); 
        } 
        else {
          // do nothing
        }
            
        
});










