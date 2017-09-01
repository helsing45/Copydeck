

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
    showStringFileDownloadLink({
        downloadVariableName: "android-Strings",
        folderPrefix: "value-",
        languages: languages,
        fileName: "strings.xml",
		downloadClass:"Android",
        fileGeneration: function(copydeck, language) {
            return generateAndroidStringFile(copydeck, language);
        }
    }, copydeck);
}

function showIOSStringDownloadLink(languages, copydeck) {
    showStringFileDownloadLink({
        downloadVariableName: "iOS-Locale",
        folderPrefix: "",
        languages: languages,
        fileName: "Localizable.strings",
		downloadClass:"IOS",
        fileGeneration: function(copydeck, language) {
            return generateIOSStringFile(copydeck, language);
        }		
    }, copydeck);
}

function showStringFileDownloadLink(downloadItem, copydeck) {
    var zip = new JSZip();
    var variableName = downloadItem.device + "-download-variable";
    for (var index = 0; index < downloadItem.languages.length; index++) {
        var langage = downloadItem.languages[index];
        zip.folder(downloadItem.folderPrefix + langage).file(downloadItem.fileName, downloadItem.fileGeneration(copydeck, langage));
    }
    $("#results").append('<li class="download '+downloadItem.downloadClass+' "><a id="' + downloadItem.downloadVariableName + '" download="" type="text/xml">' + downloadItem.downloadVariableName + '</a></li>');
    zip.generateAsync({
        type: "blob"
    }).then( // Generate the zip file asynchronously
        function(content) {
            var fileLink = document.getElementById(downloadItem.downloadVariableName);
            fileLink.href = URL.createObjectURL(content);
        });
}

function showErrors(errors) {
    for (var index = 0; index < errors.length; index++) {
        $("#error").append('<li class="error">' + errors[index] + '</li>');
    }
}