import BaseConvertor from './BaseConvertor'
class AndroidConvertor extends BaseConvertor {

    translateFromConversionItems(args) {
        var availableLang = this._getAvailableLang(args);
        var groupedItems = this._groupBy(args);
        var groupedKey = Object.keys(groupedItems);

        var stringXML = '<?xml version="1.0" encoding="utf-8"?> \n  <!-- generation time : ' + new Date().toISOString() + '--> \n<resources>\n';

        groupedKey.forEach(key => {
            stringXML += key.trim().length == 0 ? "\n" : `<!-- ${key} -->\n`;
            stringXML += this._printGroup(groupedItems[key], availableLang[0]);
        });
        stringXML += '</resources>'
        return stringXML;
    }

    _getAvailableLang(convertionItems) {
        var lang = [];
        convertionItems.forEach(element => {
            var langKeys = Object.keys(element.values);
            for (let index = 0; index < langKeys.length; index++) {
                if (lang.indexOf(langKeys[index]) == -1) {
                    lang.push(langKeys[index]);
                }
            }
        });
        return lang;
    }

    _groupBy(convertionItems) {
        var groupedBySectionItems = {};
        convertionItems.forEach(element => {
            var elementSection = element.meta[this._config["groupBy"]];
            elementSection = typeof elementSection === "undefined" ? "" : elementSection;
            if (!(elementSection in groupedBySectionItems)) {
                groupedBySectionItems[elementSection] = [];
            }
            groupedBySectionItems[elementSection].push(element);
        });
        return groupedBySectionItems;
    }

    _printGroup(items, lang) {
        var group = "";
        items.forEach(element => {
            group += this._printItem(element, lang);
        });
        return group;
    }

    _printItem(item, lang) {
        var id = this._getRightId(item);
        if (id === undefined) {
            throw "String is missing a id";
        }

        if (item.relation === undefined) {
            return `<string name="${id}">${this._formatForXML(item.values[lang])}</string>\n`
        } else {
            var pluralsXml = `<plurals name="${id}">`;
            if (item.relation['zero']) {
                pluralsXml += `\n <item quantity="zero">${this._formatForXML(item.relation.zero.values[lang])}</item>`;
            }
            pluralsXml += `\n <item quantity="one">${this._formatForXML(item.values[lang])}</item>`;
            pluralsXml += `\n <item quantity="other">${this._formatForXML(item.relation.plural.values[lang])}</item>`;
            pluralsXml += '\n</plurals>\n';
            return pluralsXml;
        }

    }

    _getRightId(item) {
        var specificId = item.ids["android"];
        return specificId === undefined || specificId.length == 0 ? item.ids["string"] : specificId;
    }

    _formatForXML(unformatted) {
        var regex = /{{(text|number|float(:.+)?)}}/g;
        var matchs = unformatted.match(regex);
        if (matchs != null) {
            for (let occurence = 0; occurence < matchs.length; occurence++) {
                var foundPattern = matchs[occurence];
                switch (foundPattern) {
                    case "{{text}}":
                        unformatted = unformatted.replace(foundPattern, `%${occurence + 1}$s`)
                        break;
                    case "{{number}}":
                        unformatted = unformatted.replace(foundPattern, `%${occurence + 1}$d`)
                        break;
                    case "{{float}}":
                        unformatted = unformatted.replace(foundPattern, `%${occurence + 1}$f`)
                        break;
                    default:
                        if (foundPattern.includes("{{float:")) {
                            var decimal = foundPattern.replace("{{float:", "").replace("}}", "");
                            unformatted = unformatted.replace(foundPattern, `%${occurence + 1}$.${decimal}f`)
                        }

                }
            }
        }

        return unformatted;
    }
}
export default AndroidConvertor;