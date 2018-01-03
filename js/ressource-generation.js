function onResourceReceived(resources) {
    var androidString = extractStringFromAndroid(
        resources.filter(function (resourceFile) {
            return resourceFile.name.startsWith('values')
        })
        .map(androidMapFunction)
        .sort(sortAlphaEmptyFirst));

    var IOSString = extractStringFromIOS(
        resources.filter(function (resourceFile) {
            return resourceFile.name.endsWith('.lproj')
        })
        .map(iOSMapFunction)
        .sort(sortAlphaEmptyFirst));

    merge(androidString, IOSString);
}

function androidMapFunction(element) {
    element.name = element.name.removeAll('values').removeAll('-');
    element.data = element.data.replaceAll('<br>', '<br/>').replaceAll('</br>', '<br/>')
    element.data = jQuery.parseXML(element.data);
    return element;
}

function iOSMapFunction(element) {
    element.name = element.name.removeAll('.lproj').removeAll('Base');
    var datas = [];
    var languageValues = element.data.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '').trim().split(';');
    for (valuesIndex = 0; valuesIndex < languageValues.length; valuesIndex++) {
        var values = languageValues[valuesIndex].split('=');
        if (values.length == 2) {
            datas.push({
                id: values[0].trim().removeAll('"'),
                value: values[1].trim()
            });
        }
    }
    element.data = datas;
    return element;
}

function sortAlphaEmptyFirst(a, b) {
    return (a.name.lenght == 0) - (b.name.lenght == 0) || +(a.name > b.name) || -(a.name < b.name);
}

function extractStringFromAndroid(xmlDocs) {
    if (xmlDocs == null) {
        return;
    }
    var languageArray = xmlDocs.slice().map(x => {
        return x.name.length == 0 ? 'default' : x.name
    });

    var baseXmlDoc = xmlDocs[0]; //the one who got the most value, some value may be in only one file.
    xmlDocs.forEach(function (a) {
        if (a.data.length > baseXmlDoc.data.length) {
            baseXmlDoc = a;
        }
    });

    var stringValueArray = [];

    for (childrenIndex = 0; childrenIndex < baseXmlDoc.data.children[0].childElementCount; childrenIndex++) {
        var nodeType = baseXmlDoc.data.children[0].children[childrenIndex].nodeName;
        var idVar = baseXmlDoc.data.children[0].children[childrenIndex].getAttribute('name');
        var searchTerm = nodeType + "[name='" + idVar + "']";
        if (nodeType == 'string') {
            var valueArray = [];
            xmlDocs.forEach(function (xmlDoc) {
                valueArray.push($(xmlDoc.data).find(searchTerm).text().formatAndroidResourceTextToCsv())
            });

            stringValueArray.push({
                id: idVar,
                languages: languageArray,
                values: valueArray
            });

        } else if (nodeType == 'plurals') {
            var singularValueArray = [];
            var pluralValueArray = [];
            xmlDocs.forEach(function (xmlDoc) {
                for (index = 0; index < $(xmlDoc.data).find(searchTerm).children().length; index++) {
                    if ($(xmlDoc.data).find(searchTerm).children().get(index).getAttribute('quantity') == 'one') {
                        singularValueArray.push($(xmlDoc.data).find(searchTerm).children().get(index).innerHTML.formatAndroidResourceTextToCsv())
                    } else if ($(xmlDoc.data).find(searchTerm).children().get(index).getAttribute('quantity') == 'other') {
                        pluralValueArray.push($(xmlDoc.data).find(searchTerm).children().get(index).innerHTML.formatAndroidResourceTextToCsv())
                    }
                }
            });
            stringValueArray.push({
                id: idVar + '_singular',
                languages: languageArray,
                values: singularValueArray
            });
            stringValueArray.push({
                id: idVar + '_plural',
                languages: languageArray,
                values: pluralValueArray
            });

        }
    }
    return stringValueArray;
}

function extractStringFromIOS(xmlDocs) {
    if (xmlDocs == null) {
        return;
    }

    var languageArray = xmlDocs.slice().map(x => {
        return x.name.length == 0 ? 'default' : x.name
    });
    var baseXmlDoc = xmlDocs[0]; //the one who got the most value, some value may be in only one file.
    xmlDocs.forEach(function (a) {
        if (a.data.length > baseXmlDoc.data.length) {
            baseXmlDoc = a;
        }
    });

    var stringValueArray = [];
    baseXmlDoc.data.forEach(function (data) {
        var idVar = data.id;
        var valueArray = [];

        xmlDocs.forEach(function (xmlDoc) {
            foundValue = xmlDoc.data.find(function (x) {
                return x.id == data.id;
            });
            valueArray.push(typeof foundValue !== 'undefined' ? foundValue.value.formatIOSResourceTextToCsv() : '')
        });

        stringValueArray.push({
            id: idVar,
            languages: languageArray,
            values: valueArray
        });

    });
    return stringValueArray;
}

function merge() {
    if (arguments.length < 2) {
        return arguments.length == 1 ? arguments[0] : null;
    }
    var args = [];
    for (i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
    }

    args[0].forEach(function(stringValue){
        for (argIndex = 1; argIndex < args.length; argIndex++) {
            var result = findClosed(stringValue,args[argIndex]);
            console.log("Was looking for " + stringValue + " has found " +result.value.values[0])            
        }
    });
}

function findClosed(stringValueToMatch, arrays) {
    var closestDistance = Infinity;
    var currentResult;
    for (i = 0; i < arrays.length; i++) {
        var tempDistance = 0;
        for (langaguageIndex = 0; langaguageIndex < stringValueToMatch.values.length; langaguageIndex++) {
            tempDistance += levenshtein_distance(stringValueToMatch.values[langaguageIndex], arrays[i].values[langaguageIndex]);
        }
        if (tempDistance == 0) {
            return {
                distance: tempDistance,
                value: arrays[i]
            };
        }
        if (closestDistance > tempDistance) {
            closestDistance = tempDistance
            currentResult = arrays[i];
        }
    };
    return {
        distance: tempDistance,
        value: currentResult
    };
}

function levenshtein_distance(a, b) {
    if (a.length == 0) return b.length;
    if (b.length == 0) return a.length;

    var matrix = [];

    // increment along the first column of each row
    var i;
    for (i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // increment each column in the first row
    var j;
    for (j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1)); // deletion
            }
        }
    }

    return matrix[b.length][a.length];
}
