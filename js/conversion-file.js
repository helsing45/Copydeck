var firstLanguageIndex;
var errors = [];

function isStringIdUnique(id, ids) {
    if (ids == null || ids.length == 0) {
        return null;
    }
    for (var index = 0; index < ids.length; index++) {
        var element = ids[index];
        if (element.ID === id) {
            return element;
        }
    }
    return null;
}


function generateConvertionFile(csvDatas, firstLanguageIndex) {
    this.firstLanguageIndex = firstLanguageIndex;

    var validCsvDatas = [];
    var readLinesID = [];
    var lineIsValid;

    for (var line = 0; line < csvDatas.length; line++) {
        lineIsValid = true;
        if ((csvDatas[line].hasOwnProperty('IOS_ID') && csvDatas[line].IOS_ID.trim().length == 0)
            && (csvDatas[line].hasOwnProperty('Android_ID') && csvDatas[line].Android_ID.trim().length == 0)
            && (csvDatas[line].hasOwnProperty('Web_ID') && csvDatas[line].Web_ID.trim().length == 0)
            && csvDatas[line].String_ID.trim().length == 0) {
            errors.push("Error line: " + (line + 2) + " doesn't have any ID");
            lineIsValid = false;
        } else {
            var tempStringId = getConversionFileStringId(csvDatas[line]);
            var element = isStringIdUnique(tempStringId, readLinesID);
            if (element != null) {
                element.lines.push((line + 2));
                lineIsValid = false;
            } else {
                readLinesID.push({
                    "lines": [(line + 2)],
                    "ID": tempStringId
                });
            }
        }
        if (document.getElementById('clean_empty').checked && isAllLangageEmpty(csvDatas[line])) {
            lineIsValid = false;
            errors.push("Error line: " + (line + 2) + " doesn't have any string value");
        }

        if (lineIsValid) {
            validCsvDatas.push(csvDatas[line]);
        }

    }

    var duplicatesStringId = readLinesID.filter(function (element) {
        return element.lines.length > 1;
    });

    duplicatesStringId.forEach(function (element) {
        var error = "Error lines: ";
        for (var index = 0; index < element.lines.length; index++) {
            error += element.lines[index];
            if (index < element.lines.length - 1) {
                error += ", ";
            }
        }
        error += " have the same ID";
        errors.push(error);
    });

    var sorted = validCsvDatas.sort(function (a, b) {
        return (a.Section_ID === null) - (b.Section_ID === null) || +(a.Section_ID > b.Section_ID) || -(a.Section_ID < b.Section_ID);
    });

    var grouped = _.groupBy(sorted, function (string) {
        return string.Section_ID;
    });

    var conversionFile = "<copydeck>";
    for (var propreties in grouped) {
        if (grouped.hasOwnProperty(propreties)) {
            conversionFile += '<section id ="' + propreties + '">';
            conversionFile += printConversionFileStrings(grouped[propreties]);
            conversionFile += "</section>";
        }
    }

    conversionFile += "</copydeck>";
    return {
        'errors': errors,
        'copydeck': conversionFile
    };
}

function getConversionFileStringId(element) {
    var id = buildCustomStringId(element);
    id += (element.Plural.trim().length == 0 ? "_singular" : "_plural") + "_" + element.Target;
    return id;
}

function buildCustomStringId(element){

    if(element.hasOwnProperty('String_ID') && element.String_ID.length > 0){
        return toSnakeCase(element.String_ID);
    }
    var customID;

    if(element.hasOwnProperty('IOS_ID') && element.IOS_ID.length > 0){
        customID = toSnakeCase(element.IOS_ID).trim();
    }

    if(element.hasOwnProperty('Android_ID') && element.Android_ID.length > 0){
        if(customID.length > 0){
            customID += "_";
        }
        customID += toSnakeCase(element.Android_ID).trim();
    }

    if(element.hasOwnProperty('Web_ID') && element.Web_ID.length > 0){
        if(customID.length > 0){
            customID += "_";
        }
        customID += toSnakeCase(element.Web_ID).trim();
    }

    return customID;
}

function printConversionFileStrings(sectionStrings) {
    var groups = _.groupBy(sectionStrings, function (value) {
        var id = value.Target + '#';
        id += buildCustomStringId(value);
        return id;
    });

    var result = "";
    for (var propreties in groups) {
        if (groups.hasOwnProperty(propreties)) {
            if (groups[propreties].length === 1) {
                // cas simple
                result += printSimpleConversionFileString(groups[propreties][0]);
            } else {
                result += handleIdConflict(groups[propreties]);
            }
        }
    }
    return result;
}

function printSimpleConversionFileString(string) {
    var result = '<string id="' + toSnakeCase(string.String_ID);
    if(string.hasOwnProperty('IOS_ID')){
        result += '" IOS_ID="' + string.IOS_ID;
    }
    if(string.hasOwnProperty('Android_ID')){
        result += '" Android_ID="' + string.Android_ID;
    }

    if (string.hasOwnProperty('Web_ID')) {
        result += '" Web_ID="' + string.Web_ID;
    }

    result += '" target="' + string.Target + '">';
    for (i = firstLanguageIndex; i < Object.keys(string).length; i++) {
        var key = Object.keys(string)[i];
        result += '<' + key + " html='" + string[key].isHTMLFormat() + "'>" + formatValue(string[key]) + '</' + key + '>';
    }
    result += '</string>';
    return result;
}

function handleIdConflict(stringIdConflict) {
    if (stringIdConflict.length === 2) {
        if (stringIdConflict[0].Target === stringIdConflict[1].Target) {
            return printPluralConversionFileString(stringIdConflict);
        } else {
            return printSimpleConversionFileString(stringIdConflict[0]) + printSimpleConversionFileString(stringIdConflict[1]);
        }
    }
}

function printPluralConversionFileString(plurialsFile) {
    var result = '<string id="' + toSnakeCase(plurialsFile[0].String_ID);
    if(plurialsFile[0].hasOwnProperty('IOS_ID')){
        result += '" IOS_ID="' + toSnakeCase(plurialsFile[0].IOS_ID);
    }
    if(plurialsFile[0].hasOwnProperty('Android_ID')){
        result += '" Android_ID="' + toSnakeCase(plurialsFile[0].Android_ID);
    }
    if(plurialsFile[0].hasOwnProperty('Web_ID')){
        result += '" Web_ID="' + toSnakeCase(plurialsFile[0].Web_ID);
    }
    result += '" target="' + plurialsFile[0].Target + '">';

    for (i = firstLanguageIndex; i < Object.keys(plurialsFile[0]).length; i++) {
        var key = Object.keys(plurialsFile[0])[i];
        result += '<' + key + '>';
        result += '<' + getQuantity(plurialsFile[0]) + " html='" + plurialsFile[0][key].isHTMLFormat() + "'>" + formatValue(plurialsFile[0][key]) + "</" + getQuantity(plurialsFile[0]) + ">";
        result += '<' + getQuantity(plurialsFile[1]) + " html='" + plurialsFile[1][key].isHTMLFormat() + "'>" + formatValue(plurialsFile[1][key]) + "</" + getQuantity(plurialsFile[1]) + ">";
        result += '</' + key + '>';
    }
    result += '</string>';
    return result;
}

function getQuantity(string) {
    return string.Plural === "" ? "one" : "many";
}

function formatValue(unformattedString) {
    if (unformattedString.length == 0) return " ";

    var formattedString = unformattedString.trim();
    formattedString = formattedString.replaceAll('\u2019', '\u0027');
    if (document.getElementById('clean_backslash').checked){
        formattedString = formattedString.removeBackslash();
    }
    formattedString = formattedString.toXmlFormat();
    return formattedString;
}

function toSnakeCase(unformattedString) {
    return unformattedString.trim().toLowerCase().replaceAll(' ', '_');
}

function isAllLangageEmpty(csvLine) {
    var totalLanguageCount = Object.keys(csvLine).length - firstLanguageIndex;
    return totalLanguageCount == getEmptyLangageKeys(csvLine).length;
}

function getEmptyLangageKeys(csvLine) {
    var emptyKeys = [];
    for (i = firstLanguageIndex; i < Object.keys(csvLine).length; i++) {
        var key = Object.keys(csvLine)[i];
        if (csvLine[key].length == 0) {
            emptyKeys.push(key);
        }
    }
    return emptyKeys;
}

function getNoEmptyLangageKeys(csvLine) {
    var emptyKeys = [];
    for (i = firstLanguageIndex; i < Object.keys(csvLine).length; i++) {
        var key = Object.keys(csvLine)[i];
        if (csvLine[key].length > 0) {
            emptyKeys.push(key);
        }
    }
    return emptyKeys;
}
