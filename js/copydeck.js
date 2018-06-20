function receivedCopydeck() {
    var csv = copydeckFileReader.result;
    var csvArray = $.csv.toArrays(csv);
    var headers = csvArray[0];
    var firstLanguageIndex = csvArray[0].indexOf("Plural") + 1;
    var csvObject = $.csv.toObjects(csv);
    var conversionFile = generateConvertionFile(csvObject, firstLanguageIndex);
    var languages = [];
    for (i = firstLanguageIndex; i < headers.length; i++) {
        languages.push(headers[i]);
    }

    showErrors(conversionFile.errors);
    showConversionFileDownloadLink(conversionFile.copydeck);
    showAndroidStringDownloadLink(languages, conversionFile.copydeck);
    showIOSStringDownloadLink(languages, conversionFile.copydeck);
    showi18nextStringDownloadLink(languages, conversionFile.copydeck);
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

    $("#results").append('<li class="download Android"><a id="android-Strings" download="android-String.zip" type="application/zip">android-Strings</a></li>');
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

    $("#results").append('<li class="download IOS"><a id="iOS-Locale" download="iOS-Locale.zip" type="application/zip">iOS-Locale</a></li>');
    zip.generateAsync({
        type: "blob"
    }).then( // Generate the zip file asynchronously
        function(content) {
            var fileLink = document.getElementById("iOS-Locale");
            fileLink.href = URL.createObjectURL(content);
        });
}

function showi18nextStringDownloadLink(languages, copydeck) {
    var zip = new JSZip();
    for (var index = 0; index < languages.length; index++) {
        var language = languages[index];
        zip.file(language + ".json", generatei18nextStringFile(copydeck, language));
    }
    $("#results").append('<li class="download i18next"><a id="i18next-Strings" download="i18next-String.zip" type="application/zip">i18next-Strings</a></li>');
    zip.generateAsync({
        type: "blob"
    }).then( // Generate the zip file asynchronously
        function(content) {
            var fileLink = document.getElementById("i18next-Strings");
            fileLink.href = URL.createObjectURL(content);
        });
}

function showErrors(errors) {
    for (var index = 0; index < errors.length; index++) {
        $("#error").append('<li class="error">' + errors[index] + '</li>');
    }
}
