function handleFileSelect(){
	$("#error").empty();
	$("#results").empty();	
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
	
	showErrors(conversionFile.errors);
	
	var data = new Blob([conversionFile.copydeck]);
    $("#results").append('<li><a id="conversionFileLink" download="conversionFile.xml" type="text/xml">ConversionFile</a></li>'); 	
    var conversionFileLink = document.getElementById("conversionFileLink");
    conversionFileLink.href = URL.createObjectURL(data);	
	
	/* String d'android */
	var androidZip = new JSZip();
	var androidVarName = "android-Strings";
	for (i = firstLanguageIndex; i < headers.length; i++) {
		var language = headers[i];
        androidZip.folder("value-"+language).file("strings.xml", generateAndroidStringFile(conversionFile.copydeck,language));
	}
	$("#results").append('<li><a id="' + androidVarName + '" download="" type="text/xml">' + androidVarName + '</a></li>');
	$("#" + androidVarName).append('<div class="loader" id="android-Loader"> </div>');
	 androidZip.generateAsync({type:"blob"}).then(
      function(content) {
        var androidFileLink = document.getElementById(androidVarName);
		androidFileLink.href = URL.createObjectURL(content);
        $("#android-Loader").remove()
      });
	
	
    /* As the iOS way of handling locale files is based on the file structure, we need to generate a file structure, not the individual files
     * To do so, we turn the languages into a zip file respecting the file structure required. EG:
     *
     * ├── en/
     * │   └── Localizable.strings
     * ├── es/
     * │   └── Localizable.strings
     * └── fr/
     *     └── Localizable.strings  
     */
    var iOSZip = new JSZip();
    var iOSVarName = "iOS-Locale";
	for (i = firstLanguageIndex; i < headers.length; i++) {
		var language = headers[i];
        iOSZip.folder(language).file("Localizable.strings", generateIOSStringFile(conversionFile.copydeck,language)) // Store the locale content in a subfile called Localizable.strings of the language
	}
    $("#results").append('<li><a id="' + iOSVarName + '" download="" type="text/xml">' + iOSVarName + '</a></li>'); // Append a list item to hold the iOS locale data
    $("#" + iOSVarName).append('<div class="loader" id="iOS-Loader"> </div>') // Append a loading view to the item while waiting for the generation
    iOSZip.generateAsync({type:"blob"}).then( // Generate the zip file asynchronously
      function(content) {
        var iOSFileLink = document.getElementById(iOSVarName);
		iOSFileLink.href = URL.createObjectURL(content);
        $("#iOS-Loader").remove() // Generation of the zip file is over - remove the loading view
      });
  }
  
  function showErrors(errors){
	  for(var index=0; index < errors.length; index++){
	  $("#error").append('<li>'+errors[index]+'</li>');
	  }
  }

  