var firstLanguageIndex;
var errors = [];

function generateConvertionFile(csvDatas, firstLanguageIndex) {
    this.firstLanguageIndex = firstLanguageIndex;
	
	var validCsvDatas = [];
	for(var line = 0; line < csvDatas.length; line++){
		if(csvDatas[line].String_ID.length == 0){
			errors.push("Erreur la ligne: "+ line +" ne contient pas d'ID pour identifier la strings.");
		}else{
			validCsvDatas.push(csvDatas[line]);
		}
	}
	
    var grouped = _.groupBy(validCsvDatas, function(string) {
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
		'errors':errors,
		'copydeck': conversionFile
	};
}

function printConversionFileStrings(sectionStrings) {
    var groups = _.groupBy(sectionStrings, function(value) {
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
        result += '<' + key + '>' + string[key] + '</' + key + '>';
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
        result += (plurialsFile[0].Plurial === "" ? "<one>" : "<many>") + plurialsFile[0][key] + (plurialsFile[0].Plurial === "" ? "</one>" : "</many>");
        result += (plurialsFile[1].Plurial === "" ? "<one>" : "<many>") + plurialsFile[1][key] + (plurialsFile[1].Plurial === "" ? "</one>" : "</many>");
        result += '</' + key + '>';
    }
    result += '</string>';
    return result;
}

function toSnakeCase(unformattedString) {
    var lower = unformattedString.toLowerCase();
    return lower.split(' ').join('_');
}