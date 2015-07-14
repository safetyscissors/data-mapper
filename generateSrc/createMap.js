/**
 * adds a select field to the form when you click start mapping
 * @param data
 */
function mapTableInit(data){
  var tableSelect = ['<div><select id="tableSelectStmt">'];
  tableSelect.push('<option value="', -1, '">', data.mainTable.tableName, ' (main table)', '</option>');

  $.each(data.subTables, function(tableIndex, subTable){
    tableSelect.push('<option value="', tableIndex,'">', subTable.tableName, '</option>');
  });

  tableSelect.push('</select></div>');
  $('#mapTable').html(tableSelect.join(''));

  mapFieldsInit(data);
}


/**
 * adds a list of table fields. based on what table is selected.
 * fires when table is changed
 * @param data
 */
function mapFieldsInit(data){
  var tableIndex = $('#tableSelectStmt').val();
  var tableToMap = (tableIndex!=-1)? tableToMap = data.subTables[tableIndex] : data.mainTable;
  var fieldList = '';


  $.each(tableToMap.columns, function(columnIndex, column){
    var field = ['<li id="mapField_',columnIndex,'"'];
    if(columnIndex==0) field.push(' class="highlight" ');
    field.push('>',column.name,'</li>');

    fieldList+=field.join('');
  });

  $('#mapFields').html('<div><ul id="mapFieldList">' + fieldList + '</ul></div>');

  mapValueInit(data);
}


/**
 * LISTENER. sets up the input field.
 * when the list is clicked
 * @param evt
 * @param data
 */
function mapFieldClick(evt, data){
  $('.highlight').removeClass('highlight');
  $('#' + evt.target.id).addClass('highlight');

  mapValueInit(data);
}

/**
 * adds the input field to fill with values.
 * sets up boxes for suggestions
 * @param data
 */
function mapValueInit(data){
  //get table
  var tableIndex = $('#tableSelectStmt').val();
  var tableToMap = (tableIndex!=-1)? tableToMap = data.subTables[tableIndex] : data.mainTable;

  //get field
  var fieldId = ($('.highlight').attr('id')).toLowerCase().split('_');
  var field = tableToMap.columns[fieldId[1]];

  var threshold = .5;
  if($('#mapSuggestThreshold').length>0){
    threshold = $('#mapSuggestThreshold').val();
  }

  var currentValue = '';
  if(_.has(data.map, tableToMap.tableName)){
    currentValue = data.map[tableToMap.tableName][$('.highlight').html()] || '';
  }
  $('#mapValues').html('<div><input id="mapValueInput" value="'+ currentValue +'"></div>');
  $('#mapValues').append('<div id="mapSuggestByType">input matches<div id="mapSuggestByTyping"></div></div>');
  $('#mapValues').append('<div id="mapSuggestByUtil">util stuff<div id="mapSuggestByUtilResult"></div></div>');
  $('#mapValues').append('<div id="mapSuggestByMatch">suggest by match<input id="mapSuggestThreshold" value="'+threshold+'" size="3"><div id="mapSuggestByMatchResult"></div></div>');

  $('#mapValueInput').focus()
  suggestValueByMatch(data);
  suggestUtil(data);
}

/**
 * suggests $id, $fk, $linenumber if the column name sounds similar
 * @param data
 */
function suggestUtil(data){
  var searchTermRaw = ($('.highlight').html());
  var output = ['<div><ul id="suggestByUtil">'];
  if(searchTermRaw.indexOf('id')>=0){
    output.push('<li class="suggestUtilValue" id="id">$id</li>');
    output.push('<li class="suggestUtilValue" id="fk">$fk</li>');
  }
  if(searchTermRaw.indexOf('line')>=0 || searchTermRaw.indexOf('number')>=0){
    output.push('<li class="suggestUtilValue" id="lineNumber">$lineNumber</li>');
  }
  output.push('</ul>','</div>');

  if(output.length>3){
    $('#mapSuggestByUtilResult').html(output.join(''));
  }else{
    $('#mapSuggestByUtil').html('');
  }

}

/**
 * suggests value by csv column name that matches the table column name
 * @param data
 */
function suggestValueByMatch(data){
  var searchTermRaw = ($('.highlight').html());
  var matchPercent = Number($('#mapSuggestThreshold').val());
  var columns = data.csv.rows[0];
  var searchTerms = _.compact(searchTermRaw.toLowerCase().split('_'));
  var matches = {};
  $.each(columns, function(columnName, columnValue){
    var baseName = (columnName.split('_'))[0];
    var cleanColumnName = baseName.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "");

    $.each(searchTerms, function(searchTermIndex, searchTerm){
      var matchPos = cleanColumnName.indexOf(searchTerm);
      if(matchPos >= 0 && columnName[matchPos] == columnName[matchPos].toUpperCase()){
        if(!matches[baseName]) matches[baseName] = {count:0, name:columnName};
        if(columnName == matches[baseName].name){
          matches[baseName].count++;
        }
      }
    })
  });

  var matchThreshold = Math.floor(matchPercent * searchTerms.length);
  if (matchThreshold ==0) matchThreshold=1;
  var output = ['<span class="suggest">match threshold = ' + matchThreshold + '/'+searchTerms.length+'</span>', '<ul id="suggestByMatch">'];
  $.each(matches, function(columnName, matchObj){
    if(matchObj.count< matchThreshold) return;
    output.push(['<li class="suggestMatchValue" id="', matchObj.name,'">',columnName,'</li>'].join(''));
  });

  $('#mapSuggestByMatchResult').html(output.join(''));
}

/**
 * suggests value by csv column name that matches what you're typing
 * @param evt
 * @param data
 */
function suggestByTyping(evt,data){
  var searchStr = (evt.target.value).toLowerCase();
  var columns = data.csv.rows[0];
  var matches = [];

  if (searchStr.length<3) return;

  $.each(columns, function(columnName, columnValue){
    columnName = columnName.toLowerCase();
    if(columnName.indexOf(searchStr)>=0){
      matches.push(columnName);
    }
  });


  var output = ['<ul id="suggestByMatch">'];
  $.each(matches, function(matchIndex, matchName){
    output.push(['<li class="suggestMatchValue" id="', matchName,'">',matchName,'</li>'].join(''));
  });

  $('#mapSuggestByTyping').html(output.join(''));
}

/**
 * When a suggestion is clicked, fill in the value box
 * @param evt
 */
function mapAddId(evt){
  var target = $('#' + evt.target.id);
  var value = target.html();
  if(target.hasClass('suggestMatchValue')){
    value = target.attr('id');
  }

  $('#mapValueInput').val(value);
}

/**
 * save the value to the data structure
 * @param evt
 * @param data
 */
function pressEnterToMap(evt,data){
  if($('#mapValues').length) {
    var tableIndex = $('#tableSelectStmt').val();
    var table = (tableIndex==-1)?data.mainTable:data.subTables[tableIndex];
    var field = $('.highlight').html();

    //map the data
    if(!data.map) data.map = {};
    if(!data.map[table.tableName]) data.map[table.tableName] = {};
    data.map[table.tableName][field] = $('#mapValueInput').val();

    //move to next item
    var fieldId = $('.highlight').attr('id');
    var nextFieldIdIndex = 1 + Number((fieldId.split('_'))[1]);
    $('.highlight').removeClass('highlight');
    $('#mapField_' + nextFieldIdIndex).addClass('highlight');
    mapValueInit(data);

    evt.preventDefault();
  }
}

/**
 * Exports
 * @param data
 */
function exportMapping(data){
  var blob = new Blob([JSON.stringify(data.map)], {
    type: "text/plain;"
  });
  saveAs(blob, "thing.txt");
}