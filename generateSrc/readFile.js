function readBlob(domId) {

  var files = $('#'+domId)[0].files;
  if (!files.length) {
    alert('Please select a file!');
    return;
  }

  for(var i=0;i<files.length;i++){
    var file = files[i];
    var start = 0;
    var stop = file.size - 1;

    var reader = new FileReader();

    // If we use onloadend, we need to check the readyState.
    reader.onloadend = function(evt) {
      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
        if(domId == 'data'){
          data.csv = readCsvRaw(evt.target.result);

          //when you load csv data, it creates the attachments subtable too
          createAttachmentTable(data);
          console.log(data)
        }
        if(domId == 'mainTable') {
          data.mainTable = readSqlRaw(evt.target.result);
          //createMap(data.mainTable);
        }
        if(domId == 'subTables'){
          if(!data.subTables) data.subTables = [];
          data.subTables.push(readSqlRaw(evt.target.result));
          //createMap(data.subTables.slice(-1).pop());
          console.log(data)
        }
        if(domId == 'mapFile'){
          data.map = _.extend(data.map, readJsonMap(evt.target.result));
        }
        if(domId == 'checkData'){
          data.dataCheck = readSqlInserts(data, evt.target.result);
        }
      }
    };

    var blob = file.slice(start, stop + 1);
    reader.readAsBinaryString(blob);
  }
}

function handleFileSelect(evt) {
  var files = evt.target.files; // FileList object

  // files is a FileList of File objects. List some properties.
  var output = [];
  for (var i = 0, f; f = files[i]; i++) {
    output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ')','</li>');
  }

  readBlob($(this)[0].id);
  $(this).siblings('.filesUploaded').html('<ul>' + output.join('') + '</ul>');
}