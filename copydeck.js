

String.prototype.removeAll = function(caract){
	return this.split(caract).join('');
}

String.prototype.replaceAll = function(oldCaract,newCaract){
	return this.split(oldCaract).join(newCaract);
}

String.prototype.toXmlFormat = function(oldCaract,newCaract){
	return this.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

function handleFileSelect() {
    $("#error").empty();
    $("#results").empty();
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        alert('The File APIs are not fully supported in this browser.');
        return;
    }

    input = document.getElementById('fileinput');
    if (!input) {
        alert("Um, couldn't find the fileinput element.");
    } else if (!input.files) {
        alert("This browser doesn't seem to support the `files` property of file inputs.");
    } else if (!input.files[0]) {
        alert("Please select a file before clicking 'Load'");
    } else {
        file = input.files[0];
        fr = new FileReader();
        fr.onload = receivedText;
        fr.readAsText(file, 'UTF-8');
    }
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
    $("#results").append('<li><a id="conversionFileLink" download="conversionFile.xml" type="text/xml">ConversionFile</a></li>');
    var conversionFileLink = document.getElementById("conversionFileLink");
    conversionFileLink.href = URL.createObjectURL(data);
}

function showAndroidStringDownloadLink(languages, copydeck) {
    showStringFileDownloadLink({
        downloadVariableName: "android-Strings",
        folderPrefix: "value-",
        languages: languages,
        fileName: "strings.xml",
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
    $("#results").append('<li><a id="' + downloadItem.downloadVariableName + '" download="" type="text/xml">' + downloadItem.downloadVariableName + '</a></li>');
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
        $("#error").append('<li>' + errors[index] + '</li>');
    }
}