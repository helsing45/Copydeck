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
        if (csvDatas[line].String_ID.trim().length == 0) {
            errors.push("Error line: " + (line + 2) + " doesn't have any ID");
            lineIsValid = false;
        } else {
            var tempStringId = toSnakeCase(csvDatas[line].String_ID) + (csvDatas[line].Plural.trim().length == 0 ? "_singular" : "_plural") + "_" + csvDatas[line].Target;
            var element = isStringIdUnique(tempStringId, readLinesID);
            if (element != null) {
                element.lines.push((line + 2));
                lineIsValid = false;
            } else {
                readLinesID.push({ "lines": [(line + 2)], "ID": tempStringId });
            }
        }
        if (isAllLangageEmpty(csvDatas[line])) {
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

function printConversionFileStrings(sectionStrings) {
    var groups = _.groupBy(sectionStrings, function (value) {
        return value.Target + '#' + value.String_ID;
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
    var result = '<string id="' + toSnakeCase(string.String_ID) + '" target="' + string.Target + '">';
    for (i = firstLanguageIndex; i < Object.keys(string).length; i++) {
        var key = Object.keys(string)[i];
        result += '<' + key + " html='"+ string[key].isHTMLFormat() +"'>" + formatValue(string[key]) + '</' + key + '>';
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
    var result = '<string id="' + toSnakeCase(plurialsFile[0].String_ID) + '" target="' + plurialsFile[0].Target + '">';
    for (i = firstLanguageIndex; i < Object.keys(plurialsFile[0]).length; i++) {
        var key = Object.keys(plurialsFile[0])[i];
        result += '<' + key + '>';
        result += '<' + getQuantity(plurialsFile[0]) + " html='"+ plurialsFile[0][key].isHTMLFormat() +"'>" + formatValue(plurialsFile[0][key]) + "</" + getQuantity(plurialsFile[0]) +">";
        result += '<' + getQuantity(plurialsFile[1]) + " html='"+ plurialsFile[1][key].isHTMLFormat() +"'>" + formatValue(plurialsFile[1][key]) + "</" + getQuantity(plurialsFile[1]) +">";
        result += '</' + key + '>';
    }
    result += '</string>';
    return result;
}

function getQuantity(string){
    return string.Plural === "" ? "one" : "many";
}

function formatValue(unformattedString) {
    if (unformattedString.length == 0) return " ";
    //TODO don't replace all backstack
    //TODO don't remove "
    return unformattedString.trim().replaceAll('\u2019','\u0027').removeBackslash().toXmlFormat();
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