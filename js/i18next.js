var language;

function generatei18nextStringFile(conversionFile, language) {
    this.language = language;

    var strings = {};

    var xmlDoc = jQuery.parseXML(conversionFile);
    for (var index = 0; index < xmlDoc.children[0].children.length; index++) {
        var section = xmlDoc.children[0].children[index];

        var sectionXML = section.getAttribute("id");
        var parent = strings;
        if (sectionXML) {
            var sectionName = camelize(sectionXML);
            if (!strings[sectionName])
                strings[sectionName] = {};

            parent = strings[sectionName];
        }

        readSectionFori18next(section, parent);
    }

    return JSON.stringify({
        translation: strings
    }, null, 4);
}

function readSectionFori18next(section, parent) {
    for (var index = 0; index < section.children.length; index++) {
        var string = section.children[index];
        if (string.getAttribute("target") == "Mobile" || string.getAttribute("target") == "Web") {
            if (section.children[index].getElementsByTagName(language)[0].childNodes.length == 1) {
                var id = geti18nextStringId(string);
                parent[id] = toi18nextString(string.getElementsByTagName(this.language));
            } else {
                var single = string.getElementsByTagName(language)[0].getElementsByTagName("one");
                var plural = string.getElementsByTagName(language)[0].getElementsByTagName("many");
                var id = geti18nextStringId(section.children[index]);

                parent[id] = toi18nextString(single);
                parent[id + "_plural"] = toi18nextString(plural);
            }

        }
    }
}

function geti18nextStringId(string) {
    if (string.getAttribute("id").trim().length == 0) {
        return string.getAttribute("Web_ID");
    }
    return string.getAttribute("id");
}

function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
        if (+ match === 0)
            return ""; // or if (/\s+/.test(match)) for white spaces
        return index == 0
            ? match.toLowerCase()
            : match.toUpperCase();
    });
}

function toi18nextString(valueXml) {
    var floatFormattedString = i18nextFloatTextFormat(valueXml[0].childNodes[0].nodeValue);
    var stringFormatted = i18nextTextFormat(floatFormattedString);
    return stringFormatted;
}

function i18nextTextFormat(unformattedString) {
    var count = 0;
    var res = unformattedString;

    // Replace {{text}} with named variable. Ex: {{text0}}
    while (res.indexOf('{{text}}') > -1) {
        res = res.replace('{{text}}', `{{text${count}}}`);
        count++;
    }

    count = 0;

    // Replace {{number}} with named variable. Ex: {{number0}}
    while (res.indexOf('{{number}}') > -1) {
        res = res.replace('{{number}}', `{{number${count}}}`);
        count++;
    }

    return res;
}

function i18nextFloatTextFormat(unformattedString) {
    var floatRegex = /{{float:?\d*}}/;
    var count = 0;
    var res = unformattedString;
    while (res.search(floatRegex) > -1) {
        var index = res.search(floatRegex);

        if (res[index + 7] === ':') {
            //Ressouce potentially has decimals
            var numberIndex = index + 8,
                number = '';

            //Fetch whole decimal number
            while (res[numberIndex] !== '}') {
                number += res[numberIndex];
                numberIndex++;
            }

            //There were not any numbers after the ':', replace as {{float}}
            if (numberIndex === index + 8) {
                res = res.replace('{{float:}}', `{{decimal${count}}}`);
            } else {
                // Add format
                var floatPrecision = parseInt(number);
                var format = '0';
                if (floatPrecision > 0) {
                    format += '.';
                    for (var point = 0; point < floatPrecision; point++) {
                        format += '0';
                    }
                }
                res = res.replace(`{{float:${number}}}`, `{{decimal${count}, ${format}}}`);
            }
        } else {
            // Resource has no decimals.
            res = res.replace('{{float}}', `{{decimal${count}}}`);
        }
        count++;
    }

    return res;
}
