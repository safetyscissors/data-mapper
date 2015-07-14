function compareDumpToRaw(data){
  //make sure that data.csv fields all have a value in data.dataCheck
  var missingData = {};

  $.each(data.dataCheck, function(dbKey, textDbRow){
    var csvKey = dbKey - $('#primaryKey').val();
    var csvRow = data.csv.rows[csvKey];

    $.each(csvRow, function(csvFieldName, csvField){
      if(csvField.length>0){
        //if not there, log it
        if(textDbRow.indexOf(csvField)<0){
          if(!missingData[csvFieldName]) missingData[csvFieldName] = [];
          missingData[csvFieldName].push(dbKey);
        }
      }
    });
  });

  console.log(missingData);
}