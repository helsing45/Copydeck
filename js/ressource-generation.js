var myWorker;
var csv;
if (window.Worker) {

    console.log('Can run worker');
    var myWorker = new Worker("js/worker.js");

    myWorker.onmessage = function (e) {
        if('progress' in e.data){
            $("#progressbar-bg").css('visibility', 'visible');
            var progressbar = document.getElementById('progressbar');
            progressbar.style.width = Math.ceil(e.data['progress'] * 100) + '%';
        }
        if('result' in e.data){
            var data = new Blob([csv = e.data['result']]);
            $("#results-csv").append('<li class="download Copydeck"><a id="csvFileLink" download="copydeck.csv" type="text/csv">Copydeck</a></li>');            
            var progressbar = document.getElementById('progressbar');
            progressbar.style.width = '0%';
            var conversionFileLink = document.getElementById("csvFileLink");
            conversionFileLink.href = URL.createObjectURL(data);
        }
    };
    
};

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

        myWorker.postMessage([androidString,IOSString]);
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


