function onResourceReceived(resources) {
    //ANDROID Conversion file
    var androidString = extractStringFromAndroid(
        resources.filter(function (resourceFile) {
            return resourceFile.name.startsWith('values')
        })
        .map(androidMapFunction)
        .sort(sortAlphaEmptyFirst));

    //IOS Conversion file
    var IOSString = extractStringFromIOS(
        resources.filter(function (resourceFile) {
            return resourceFile.name.endsWith('.lproj')
        })
        .map(iOSMapFunction)
        .sort(sortAlphaEmptyFirst));

    showCSVFileLink(createCsv(regroupSingularPluralValue(findEquivalent(androidString, IOSString)), androidString.languages));
}

function showCSVFileLink(csv) {
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'copydeck.csv';
    hiddenElement.click();
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
                values: pluralValueArray
            });

        }
    }
    return {
        target: "Android",
        languages: languageArray,
        values: stringValueArray
    };
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
            values: valueArray
        });

    });
    return {
        target: "IOS",
        languages: languageArray,
        values: stringValueArray
    };
}

function findEquivalent(list1, list2) {
    mergeResult = [];
    list2UnfoundIndex = Array.apply(null, {
        length: list2.values.length
    }).map(Number.call, Number)
    list1.values.forEach(function (mainValue) {

        for (let valuesIndex = 0; valuesIndex < list2.values.length; valuesIndex++) {
            const value = list2.values[valuesIndex];
            var distance = 0;
            var foundMatch = false;
            for (let languageIndex = 0; languageIndex < mainValue.values.length; languageIndex++) {
                distance += levenshtein_distance(mainValue.values[languageIndex], value.values[languageIndex]);
            }
            if (distance == 0) {
                foundMatch = true;
                list2UnfoundIndex.splice(list2UnfoundIndex.indexOf(valuesIndex), 1);

                mergeResult.push({
                    ids: [{
                        target: list1.target,
                        id: mainValue.id
                    }, {
                        target: list2.target,
                        id: value.id
                    }],
                    values: value.values
                });
                break;
            }
        }

        if (!foundMatch) {
            mergeResult.push({
                ids: [{
                    target: list1.target,
                    id: mainValue.id
                }],
                values: mainValue.values
            });
        }
    });

    list2UnfoundIndex.forEach(function (i) {
        mergeResult.push({
            ids: [{
                target: list2.target,
                id: list2.values[i].id
            }],
            values: list2.values[i].values
        });
    });
    return mergeResult;
}

function regroupSingularPluralValue(unformattedList) {
    /** Then we handle plurials **/
    formattedList = [];
    plurialArray = [];
    singularArray = [];

    for (let index = 0; index < unformattedList.length; index++) {
        const r = unformattedList[index];
        if (containsSingular(r.ids)) {
            singularArray.push(r);
            continue;
        }
        if (containsPlural(r.ids)) {
            plurialArray.push(r);
            continue;
        }
        formattedList.push({
            ids: r.ids,
            singular: r.values
        });
    }

    plurialArray.forEach(function (pluralElement) {
        for (j = 0; j < singularArray.length; j++) {
            singularItem = singularArray[j];
            if (idsEquivalent(pluralElement.ids, singularItem.ids)) {
                formattedList.push({
                    ids: clearPlurialSingularFromIds(pluralElement.ids),
                    singular: singularItem.values,
                    plural: pluralElement.values
                });
                continue;
            }
        }
    });

    return formattedList;
}

/*Return true if for the same target the string without _singular / _plural are equals */
function idsEquivalent(ids1, ids2) {
    ids1 = clearPlurialSingularFromIds(ids1);
    ids2 = clearPlurialSingularFromIds(ids2);
    for (id1Index = 0; id1Index < ids1.length; id1Index++) {
        for (let id2Index = 0; id2Index < ids2.length; id2Index++) {
            if (ids1[id1Index].target == ids2[id2Index].target && ids1[id1Index].id != ids2[id2Index].id) {
                return false;
            }
        }
    }
    return true;
}

function clearPlurialSingularFromIds(ids) {
    return ids.map(x => {
        return {
            target: x.target,
            id: x.id.removeAll('_plural').removeAll('_singular')
        }
    });
}

function containsSingular(array) {
    var result = false;
    array.forEach(function (item) {
        result = result || item.id.toLocaleLowerCase().includes("_singular");
    });
    return result;
}

function containsPlural(array) {
    var result = false;
    array.forEach(function (item) {
        result = result || item.id.toLocaleLowerCase().includes("_plural");
    });
    return result;
}

function createCsv(linesFile, languages) {
    var result = "Section_ID,String_ID,Android_ID,IOS_ID,Target,Plural," + languages.join() + "\n";
    linesFile.forEach(function (line) {
        result += getFormattedCsvLine(line, false) + "\n"
        if (line["plural"] !== undefined) {
            result += getFormattedCsvLine(line, true) + "\n"
        }
    });
    return result;
}

function getFormattedCsvLine(infoLine, isPlural) {
    formattedString = "";
    //Section_ID
    formattedString += ",";
    //String_ID
    if (infoLine.ids.length == 1) {
        formattedString += infoLine.ids[0].id + ","
        //Android_ID
        formattedString += ",";
        //IOS_ID
        formattedString += ",";
        //Target
        formattedString += infoLine.ids[0].target + ","
    } else {
        if (infoLine.ids[0].id == infoLine.ids[1].id) {
            formattedString += infoLine.ids[0].id + ","
            //Android_ID
            formattedString += ",";
            //IOS_ID
            formattedString += ",";
        } else {
            formattedString += ",";
            //Android_ID
            formattedString += (infoLine.ids[0].target == "Android" ? infoLine.ids[0].id : infoLine.ids[1].id) + ",";
            //IOS_ID
            formattedString += (infoLine.ids[0].target == "IOS" ? infoLine.ids[0].id : infoLine.ids[1].id) + ",";
        }
        //Target
        formattedString += "Mobile,";
    }

    //Plural
    formattedString += isPlural ? "X," : ",";

    var values = infoLine[isPlural ? "plural" : "singular"];
    for (let index = 0; index < values.length; index++) {
        formattedString += '"' +values[index] +'"';
        if (index < values.length - 1) {
            formattedString += ",";
        }
    }
    return formattedString;
}

function findClosed(stringValueToMatch, fileToMatch) {
    var closestDistance = Infinity;
    var currentResult;
    for (i = 0; i < fileToMatch.values.length; i++) {
        var tempDistance = 0;
        for (languageIndex = 0; languageIndex < stringValueToMatch.values.length; languageIndex++) {
            tempDistance += levenshtein_distance(stringValueToMatch.values[languageIndex], fileToMatch.values[i].values[languageIndex]);
        }
        if (tempDistance == 0) {
            return {
                distance: tempDistance,
                value: fileToMatch.values[i]
            };
        }
        if (closestDistance > tempDistance) {
            closestDistance = tempDistance
            currentResult = fileToMatch.values[i];
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
