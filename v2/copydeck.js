

String.prototype.removeAll = function(caract){
	return this.split(caract).join('');
}

String.prototype.replaceAll = function(oldCaract,newCaract){
	return this.split(oldCaract).join(newCaract);
}

String.prototype.toXmlFormat = function(oldCaract,newCaract){
	return this.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

function receivedText() {
    var csv = fr.result;
    var headers = $.csv.toArrays(csv)[0];
    var firstLanguageIndex = $.csv.toArrays(csv)[0].indexOf("Plurial") + 1;
    var conversionFile = generateConvertionFile($.csv.toObjects(csv), firstLanguageIndex);

    var languages = [];
    for (i = firstLanguageIndex; i < headers.length; i++) {
        languages.push(headers[i]);
    }

    showErrors(conversionFile.errors);
    showConversionFileDownloadLink(conversionFile.copydeck);
    showAndroidStringDownloadLink(languages, conversionFile.copydeck);
    showIOSStringDownloadLink(languages, conversionFile.copydeck);
}

function showConversionFileDownloadLink(copydeck) {
    var data = new Blob([copydeck]);
    $("#results").append('<li class="download Conversion"><a id="conversionFileLink" download="conversionFile.xml" type="text/xml">ConversionFile</a></li>');
    var conversionFileLink = document.getElementById("conversionFileLink");
    conversionFileLink.href = URL.createObjectURL(data);
}

function showAndroidStringDownloadLink(languages, copydeck) {
    var zip = new JSZip();

    for (var index = 0; index < languages.length; index++) {
        var language = languages[index];
        zip.folder("values" + (index > 0 ?"-"+ language: "")).file("strings.xml", generateAndroidStringFile(copydeck, language));
    }
    
    $("#results").append('<li class="download Android"><a id="android-Strings" download="android-String" type="text/xml">android-Strings</a></li>');
    zip.generateAsync({
        type: "blob"
    }).then( // Generate the zip file asynchronously
        function(content) {
            var fileLink = document.getElementById("android-Strings");
            fileLink.href = URL.createObjectURL(content);
        });
}

function showIOSStringDownloadLink(languages, copydeck) {   
    var zip = new JSZip();

    for (var index = 0; index < languages.length; index++) {
        var language = languages[index];
        zip.folder(index == 0 ? "Base.lproj": language +".lproj").file("Localizable.strings", generateIOSStringFile(copydeck, language));
    }

    $("#results").append('<li class="download IOS"><a id="iOS-Locale" download="iOS-Locale" type="text/xml">iOS-Locale</a></li>');
    zip.generateAsync({
        type: "blob"
    }).then( // Generate the zip file asynchronously
        function(content) {
            var fileLink = document.getElementById("iOS-Locale");
            fileLink.href = URL.createObjectURL(content);
        });
}

function showErrors(errors) {
    for (var index = 0; index < errors.length; index++) {
        $("#error").append('<li class="error">' + errors[index] + '</li>');
    }
}