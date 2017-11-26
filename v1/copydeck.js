

String.prototype.removeAll = function(caract){
	return this.split(caract).join('');
}

String.prototype.replaceAll = function(oldCaract,newCaract){
	return this.split(oldCaract).join(newCaract);
}

String.prototype.toXmlFormat = function(){
    return this.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
    //return this.replaceAll('&','&amp;');
}

String.prototype.indexesOf = function(caract){
    var indexes = [];
    for(var i=0; i<this.length;i++) {
        if (this[i] === caract) indexes.push(i);
    }
    return indexes;
}

String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0,index) + replacement + this.substr(index + 1);
}

String.prototype.removeBackslash = function(){
    var result = "";
    for (var i = 0, len = this.length; i < len; i++) {
        var currentCaract = this[i];
        if(currentCaract =='\\' && this[i + 1] != 'n'){
            continue;
        }
        result += currentCaract;
    }
    return result;
}

String.prototype.fromXmlFormat = function(){
    return this
    .replaceAll('&amp;','&')
    .replaceAll('&lt;','<')
    .replaceAll('&gt;','>');
}

String.prototype.isHTMLFormat = function(){
    return /<(br|basefont|hr|input|source|frame|param|area|meta|!--|col|link|option|base|img|wbr|!DOCTYPE).*?>|<(a|abbr|acronym|address|applet|article|aside|audio|b|bdi|bdo|big|blockquote|body|button|canvas|caption|center|cite|code|colgroup|command|datalist|dd|del|details|dfn|dialog|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frameset|head|header|hgroup|h1|h2|h3|h4|h5|h6|html|i|iframe|ins|kbd|keygen|label|legend|li|map|mark|menu|meter|nav|noframes|noscript|object|ol|optgroup|output|p|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video).*?<\/\2>/.test(this);
}

function receivedText() {
    var csv = fr.result;
    var headers = $.csv.toArrays(csv)[0];
    var firstLanguageIndex = $.csv.toArrays(csv)[0].indexOf("Plural") + 1;
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