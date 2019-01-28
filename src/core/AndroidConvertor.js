import BaseConvertor from './BaseConvertor'
import ConvertionItemUtils from '../utils/ConvertionItemUtils'
import * as StringUtils from './extension/StringExt'

class AndroidConvertor extends BaseConvertor {

    translateFromConversionItems(args) {
        let availableLang = ConvertionItemUtils.findLanguages(args);
        let groupedItems = ConvertionItemUtils.groupBy(this._config["groupBy"],args);
        let groupedKey = Object.keys(groupedItems).sort();
        var result ={};

        for (let langIndex = 0; langIndex < availableLang.length; langIndex++) {
            const lang = availableLang[langIndex];
            result[lang] = this._printForLang(groupedItems,groupedKey,lang)
        }
        return result;
      
    }

    _printForLang(items,keys,lang){
        let stringXML = '<?xml version="1.0" encoding="utf-8"?> \n  <!-- generation time : ' + new Date().toISOString() + '--> \n<resources>\n';

        keys.forEach((key) => stringXML += this._printGroup(key,items[key],lang));
        stringXML += '</resources>'
        return stringXML;
    }

    _printGroup(key,items,lang) {
        let group = key.trim().length == 0 ? "\n" : `<!-- ${key} -->\n`;;
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
        let id = specificId ? specificId : item.ids["string"];
        if(this._config.transfomIdFunction){
            var fn = new Function("return " + this._config.transfomIdFunction)();
            id = fn(id);
        }
        return id;
    }

    _formatForXML(unformatted) {
        let regex = /{{(number|text|float|float:[0-9]*)}}/g;
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
        unformatted = StringUtils.replaceAll(unformatted,"'","\\'");
        unformatted = StringUtils.toXMLFormat(unformatted);
        return unformatted;
    }
}
export default AndroidConvertor;