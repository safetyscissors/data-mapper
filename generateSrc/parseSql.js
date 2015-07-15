function createMap(table){
  var output = '<div class="tableMap"><h2>' + table.tableName + '</h2><ul>';

  //list columns
  table.columns.forEach(function(column){
    output += '<li>' + column + ':</li>';
  });

  output += '</ul></div>';
  $('#map').append(output);
}

function mapToTables(data){
  var pk = Number($('#primaryKey').val());
  data.toExport = initializeExport(data);
  //for each row
  $.each(data.csv.rows, function(rowIndex, row){
    mapMainTable(data, row, pk);
    mapEachSubTable(data, row, pk);
    pk++;
  });
}

function convertToSqlInsert(data){

  //make sql for main table
  var insertStmts = convertGenericTableToSql(data, data.mainTable.tableName);

  $.each(data.subTables, function(subTableIndex, subTable) {
    insertStmts = insertStmts.concat(convertGenericTableToSql(data, subTable.tableName));
  });

  $('#map').html(insertStmts.join('\n'));

  //prep to test data after.
  var allTables = [data.mainTable.tableName];
  allTables = allTables.concat(_.pluck(data.subTables, 'tableName'));
  $('#mysqlDumpInfo').val('mysqldump --no-create-info -h localhost -u rcuhuser -prcuhpassword rcuh ' + allTables.join(' ') + '> testDump.sql' );

}

/* ======================================================================== *\
          Helper Functions
\* ======================================================================== */

/**
 * creates an insert statement from the exportData object
 * @param data
 * @param tableName
 * @returns {Array}
 */
function convertGenericTableToSql(data, tableName){
  var insertStmts = [];
  var exportData = data.toExport[tableName];

  //make an insert stmt for each row in the table.
  $.each(exportData, function(index, row){
    var columns = [];
    var values = [];

    //for each field, add column and value to separate lists.
    $.each(row, function(dbName, value){
      columns.push(dbName);
      values.push('"' + value + '"');
    });

    //build the stmt and add to list of all stmts
    var stmt = 'INSERT INTO ' + tableName + ' (' + columns.join(', ') + ') VALUES (' + values.join(', ') + '); ';
    insertStmts.push(stmt);
  });

  return insertStmts;
}

/**
 * create an object where each table name is an attribute set to an array
 * @param data
 * @returns {{}}
 */
function initializeExport(data){
  var exportObject = {};
  exportObject[data.mainTable.tableName] = [];
  $.each(data.subTables, function(subTableIndex, subTable){
    exportObject[subTable.tableName] = [];
  });

  return exportObject;
}

/**
 * MODIFIER of data. maps the main table.
 * @param data
 * @param row
 * @param pk
 */
function mapMainTable(data, row, pk){
  if(!_.has(data.map,data.mainTable.tableName) || !data.map[data.mainTable.tableName]) return;

  var mainTableRow = createTableRow(data.mainTable.tableName, pk, null);
  $.each(data.map[data.mainTable.tableName], function(dbColumn, csvColumn){

    //for each maintable mapping name, search for a column that starts with the main table name
    searchForColumnsStartingWith(row, csvColumn, function(fieldIndex, fieldValue){
      mainTableRow[dbColumn] = fieldValue;
    });
  });
  data.toExport[data.mainTable.tableName].push(mainTableRow);
}

/**
 * MODIFIER of data object
 * @param data
 * @param row
 * @param pk
 */
function mapEachSubTable(data, row, pk){
  $.each(data.subTables, function(subTableIndex, subTable){

    //group objects by the same indexNumber
    var subTableRows = {};

    if(!_.has(data.map, subTable.tableName)) return;

    //look through each map field
    $.each(data.map[subTable.tableName], function(subTableColumnName, csvColumnName){
      //skip if looking at a calculated value
      if(csvColumnName.indexOf('$') == 0 ) return;

      //go through each csv data field to see if the column name matches what we're looking for.
      searchForColumnsStartingWith(row, csvColumnName, function (rowIndex, matchedFieldValue) {

        //create a new subtable row if it doesnt exist. then add the field value on
        if (!subTableRows[rowIndex]) subTableRows[rowIndex] = createTableRow(subTable.tableName, pk, rowIndex);
        subTableRows[rowIndex][subTableColumnName] = matchedFieldValue;

      });
    });

    //add all subtable row objects to an object to export
    $.each(subTableRows, function(subTableDataIndex, subTableRow) {
      data.toExport[subTable.tableName].push(subTableRow);
    });

  });
}

/**
 * searches a row of csv for columns starting with your value.
 * @param columnNamePattern
 * @param callback(index, fieldValue)
 */
function searchForColumnsStartingWith(row, columnNamePattern, callback){
  $.each(row, function(dataColumnName, dataField){

    //if it either directly matches or starts with it followed by '_'
    if(dataColumnName == columnNamePattern || dataColumnName.indexOf(columnNamePattern+'_') == 0){

      //if theres no data in the field, continue.
      if(!dataField) return;

      //get the number off the column name or set it to zero.
      var dataNameParts = dataColumnName.split('_');
      var rowIndex = Number(dataNameParts[1]) || 0;

      callback(rowIndex, dataField);
    }
  });
}

/**
 * inits a new object with fk and lineNumber
 * @param subTableName
 * @param primaryKey
 * @param rowNumber
 * @returns {{}}
 */
function createTableRow(subTableName, primaryKey, rowNumber){
  var newRow = {};
  var invertedMapping = _.invert(data.map[subTableName]);

  //set pk
  if(invertedMapping['$pk']) {
    newRow[invertedMapping['$pk']] = primaryKey;
  }

  //set fk
  if(invertedMapping['$fk']) {
    newRow[invertedMapping['$fk']] = primaryKey;
  }

  if(invertedMapping['$modelName']){
    newRow[invertedMapping['$modelName']] = $('#modelNameInput').val();
  }

  //set lineNumber
  if(invertedMapping['$lineNumber']) {
    newRow[invertedMapping['$lineNumber']] = rowNumber;
  }

  return newRow;
}