function handleFileSelect(){               
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
      alert('The File APIs are not fully supported in this browser.');
      return;
    }   

    input = document.getElementById('fileinput');
    if (!input) {
      alert("Um, couldn't find the fileinput element.");
    }
    else if (!input.files) {
      alert("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
      alert("Please select a file before clicking 'Load'");               
    }
    else {
      file = input.files[0];
      fr = new FileReader();
      fr.onload = receivedText;      
      fr.readAsText(file,'UTF-8');
    }
  }
  function receivedText() {
    var csv = fr.result;
	var headers = $.csv.toArrays(csv)[0];
	var firstLanguageIndex = $.csv.toArrays(csv)[0].indexOf("Plurial") + 1;
    var conversionFile = generateConvertionFile($.csv.toObjects(csv),firstLanguageIndex);
	
	var data = new Blob([conversionFile]);
    $("#list").append('<li><a id="conversionFileLink" download="conversionFile.xml" type="text/xml">ConversionFile</a></li>'); 	
    var conversionFileLink = document.getElementById("conversionFileLink");
    conversionFileLink.href = URL.createObjectURL(data);	
	
	
	for (i = firstLanguageIndex; i < headers.length; i++) {
		var language = headers[i];
		var androidVarName = 'android-String-'+language;
		var data = new Blob([generateStringFile(conversionFile,language)]);
		$("#list").append('<li><a id="'+androidVarName+'" download="strings-'+language+'.xml" type="text/xml">'+androidVarName+'</a></li>');
 		var androidFileLink = document.getElementById(androidVarName);
		androidFileLink.href = URL.createObjectURL(data);	
	}
	
	for (i = firstLanguageIndex; i < headers.length; i++) {
		var language = headers[i];
		var iosVarName = 'IOS-String-'+language;
		$("#list").append('<li><a id="'+iosVarName+'" download="strings'+language+'.xml" type="text/xml">'+iosVarName+'</a></li>'); 		
	}
  }

  