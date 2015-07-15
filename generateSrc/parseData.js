function readCsvRaw(data){

  //ignore commas in quotes
  //ignore /n in quotes

  var lines = data.split('"\r\n"');
  var header = lines.shift().split(',');
  var tableRows = [];
  var failedRows = [];

  //setup header rows
  lines.forEach(function(line,lineNumber){

    var tableObj = {};
    var fields = line.split('","');

    for(var i=0;i<header.length;i++){
      var headerName = header[i].replace(/"/g,'');
      var fieldValue = "";
      if(fields[i]){
        fieldValue = fields[i].replace(/"/g,'');
      }
      tableObj[headerName] = fieldValue;
    }

    //check data looks ok.
    if(tableObj.Count && parseInt(tableObj.Count)){
      tableRows.push(tableObj)
    }else{
      failedRows.push({
        row:lineNumber,
        line:line
      })
    }
  });
  return {
    rows:tableRows,
    failed:failedRows
  }
}

function readJsonMap(fdata){
  console.log(fdata);
  var map = {};
  try{
    map = JSON.parse(fdata);
  }catch(e){
    alert('probably invalid json. failed parse');
  }
  return map;
}

function readSqlRaw(data){
  var lines = data.split('\n');
  var columns = [];
  var tableName = '';

  lines.forEach(function(line,lineNumber){
    //if its a comment or format thing, skip
    if(line == '' || line[0] == '-' || line[0] == '/') return;

    //read each word
    var word = line.split(' ');

    //if its a create, get table name
    if(word[0] == 'CREATE'){
      tableName = word[2].replace(/`/g,'')
    }

    //if its empty here, AND the first char is '`', then its a column name
    if(word[0] == '' && word[2][0] == '`'){
      var name = word[2].replace(/`/g,'');
      var type = word[3];
      var count= '';
      if(type.indexOf('(') > 0){
        var piecesOfType= type.split('(');
        count = piecesOfType[1].replace(/\);/g,'');
        count = piecesOfType[1].replace(/\)/g,'');
      }

      columns.push({
        name:name,
        type:type,
        count:count
      })
    }
  });

  return {
    tableName:tableName,
    columns:columns
  }
}

function readSqlInserts(data, fileData){
  var lines = {};
  $.each(fileData.split('\n'), function(index, line){
    if(line.indexOf('INSERT INTO') == 0 ){
      //a line looks like "INSERT INTO table_name VALUES (a,b,c),(d,e,f)"
      var lineParts = line.split('VALUES');
      var headerParts = lineParts[0].split(' ');

      lines[(headerParts[2]).replace(/`/g, '')] = (lineParts[1]).split('),(');
    }
  });

  var dbRows = {};
  $.each(lines, function(tableName, table){

    //clean sql formatting off
    table[0] = table[0].substring(2);
    table[table.length-1] = table[table.length-1].substring(0,(table[table.length-1]).length-2);


    $.each(table, function(lineIndex, line){
      //format table into searchable data structures
      if(tableName==data.mainTable.tableName){ //then its main table
          var primaryKey = line.substr(0,line.indexOf(','));
          dbRows[primaryKey] = line;
      }

      //if its a subtable, find the foreign key and match it
      else{
        //for now assume fk is second.
        var firstComma = line.indexOf(',')+1;
        var foreignKey = line.substr(firstComma, line.indexOf(',',firstComma)-firstComma);
        dbRows[foreignKey] += ','+line;
      }
    });
  });




  return dbRows;
}

function createAttachmentTable(data){
  var sql = 'CREATE TABLE `domino_document_mapping` (\n  `domino_document_mapping_id` int(11) NOT NULL AUTO_INCREMENT,\n  `domino_document_mapping_domino_id` varchar(255) NOT NULL, \n  `domino_document_mapping_model_name` varchar(255) NOT NULL,\n  `domino_document_mapping_cloud_id` int(11) NOT NULL,\n  PRIMARY KEY (`domino_document_mapping_id`)';

  if(!_.has(data, 'map')) data.map = {};
  data.map['domino_document_mapping'] = {
    domino_document_mapping_cloud_id:'$fk',
    domino_document_mapping_model_name:'$modelName',
    domino_document_mapping_domino_id:'DocumentUNID'
  };

  if(!_.has(data, 'subTables')) data.subTables = [];
  data.subTables.push(readSqlRaw(sql));
}
