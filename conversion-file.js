var firstLanguageIndex;
var errors = [];

function isStringIdUnique(id, ids) {
    if(ids == null || ids.length == 0){
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
        if (csvDatas[line].String_ID.length == 0) {            
            errors.push("Erreur la ligne: " + (line + 2) + " ne contient pas d'ID pour identifier la strings.");
            lineIsValid = false;
        }else{
            var tempStringId = toSnakeCase(csvDatas[line].String_ID) + (csvDatas[line].Plurial.trim().length == 0 ? "_singular" : "_plurial") + "_"+csvDatas[line].Target;
            var element = isStringIdUnique(tempStringId, readLinesID);
            if (element != null) {
                element.lines.push(line);
                lineIsValid = false;
            }else{
                readLinesID.push({"lines": [line], "ID": tempStringId});
            }
        }
        if (isAllLangageEmpty(csvDatas[line])) {
            errors.push("Erreur la ligne: " + (line + 2) + " ne contient aucune valeur");
        }
        
    }

    var duplicatesStringId = readLinesID.filter(function(element){
        return element.lines.length > 1;
    });

    duplicatesStringId.forEach(function(element){
        var error = "Les lignes ";
        for(var index = 0; index < element.lines.length; index++){
            error += element.lines[index];
            if(index < element.lines.length - 1){
                error += ", ";
            }
        }
        error += " on le même id";
        errors.push(error);
    });


    var grouped = _.groupBy(validCsvDatas, function (string) {
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
        result += '<' + key + '>' + formatValue(string[key]) + '</' + key + '>';
    }
    result += '</string>';
    return result;
}

function handleIdConflict(stringIdConflict) {
    if (stringIdConflict.length === 2) {
        if (stringIdConflict[0].Target === stringIdConflict[1].Target) {
            return printPlurialConversionFileString(stringIdConflict);
        } else {
            return printSimpleConversionFileString(stringIdConflict[0]) + printSimpleConversionFileString(stringIdConflict[1]);
        }
    }

}

function printPlurialConversionFileString(plurialsFile) {
    var result = '<string id="' + toSnakeCase(plurialsFile[0].String_ID) + '" target="' + plurialsFile[0].Target + '">';
    for (i = firstLanguageIndex; i < Object.keys(plurialsFile[0]).length; i++) {
        var key = Object.keys(plurialsFile[0])[i];
        result += '<' + key + '>';
        result += (plurialsFile[0].Plurial === "" ? "<one>" : "<many>") + formatValue(plurialsFile[0][key]) + (plurialsFile[0].Plurial === "" ? "</one>" : "</many>");
        result += (plurialsFile[1].Plurial === "" ? "<one>" : "<many>") + formatValue(plurialsFile[1][key]) + (plurialsFile[1].Plurial === "" ? "</one>" : "</many>");
        result += '</' + key + '>';
    }
    result += '</string>';
    return result;
}

function formatValue(unformattedString) {
    if (unformattedString.length == 0) return " ";
    return unformattedString.removeAll('\\').removeAll('"').toXmlFormat();
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