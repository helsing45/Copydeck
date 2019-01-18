import BaseConvertor from './BaseConvertor'
class AndroidConvertor extends BaseConvertor {

    translateFromConversionItems(args) {
        let availableLang = this._getAvailableLang(args);
        let groupedItems = this._groupBy(args);
        let groupedKey = Object.keys(groupedItems);

        let stringXML = '<?xml version="1.0" encoding="utf-8"?> \n  <!-- generation time : ' + new Date().toISOString() + '--> \n<resources>\n';

        groupedKey.forEach(key => {
            stringXML += key.trim().length == 0 ? "\n" : `<!-- ${key} -->\n`;
            stringXML += this._printGroup(groupedItems[key], availableLang[0]);
        });
        stringXML += '</resources>'
        return stringXML;
    }

    _getAvailableLang(convertionItems) {
        let lang = [];
        convertionItems.forEach(element => {
            let langKeys = Object.keys(element.values);
            for (let index = 0; index < langKeys.length; index++) {
                if (lang.indexOf(langKeys[index]) == -1) {
                    lang.push(langKeys[index]);
                }
            }
        });
        return lang;
    }

    _groupBy(convertionItems) {
        let groupedBySectionItems = {};
        convertionItems.forEach(element => {
            let elementSection = element.meta[this._config["groupBy"]];
            elementSection = typeof elementSection === "undefined" ? "" : elementSection;
            if (!(elementSection in groupedBySectionItems)) {
                groupedBySectionItems[elementSection] = [];
            }
            groupedBySectionItems[elementSection].push(element);
        });
        return groupedBySectionItems;
    }

    _printGroup(items, lang) {
        let group = "";
        items.forEach(element => {
            group += this._printItem(element, lang);
        });
        return group;
    }

    _printItem(item, lang) {
        let id = this._getRightId(item);
        if (!id) {
            throw "String is missing a id";
        }

        if (!item.relation) {
            return `<string name="${id}">${this._formatForXML(item.values[lang])}</string>\n`
        } else {
            let pluralsXml = `<plurals name="${id}">`;
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
        let specificId = item.ids["android"];
        return specificId ? specificId : item.ids["string"];
    }

    _formatForXML(unformatted) {
        let regex = /{{(text|number|float(:.+)?)}}/g;
        let matchs = unformatted.match(regex);
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