import BaseConvertor from './BaseConvertor'
import ConvertionItemUtils from '../utils/ConvertionItemUtils'
class IOSConvertor extends BaseConvertor {
    translateFromConversionItems(args) {
        let availableLang = ConvertionItemUtils.findLanguages(args);
        let groupedItems = ConvertionItemUtils.groupBy(this._config["groupBy"],args);
        let groupedKey = Object.keys(groupedItems).sort();

        let stringsFile = `/* \n  Localizable.strings \n Generation time : ' ${new Date().toISOString()} \n  */\n`;
        
        groupedKey.forEach(key => {
            stringsFile += key.trim().length == 0 ? "\n" : `\n/* ${key} */ \n`;
            stringsFile += this._printGroup(groupedItems[key], availableLang[0]);
        });
        return stringsFile;
    }

    _printGroup(items, lang) {
        let group = "";
        items.forEach(element => {
            group += this._printItem(element, lang);
        });
        return group;
    }

    _printItem(item, lang) {
        let id = this._getItemId(item);
        if (!id) {
            throw "String is missing a id";
        }
        if(!item.relation){
            return `"${id}" = "${this._formatValue(item.values[lang])}"\n`;
        }else{
            let relationBloc = `"${this._getItemId(item,"_singular")}" = "${this._formatValue(item.values[lang])}"\n`;
            let relationKeys = Object.keys(item.relation);
            relationKeys.forEach(key => {
                relationBloc += `"${this._getItemId(item,"_"+key)}" = "${this._formatValue(item.relation[key].values[lang])}"\n`;
            });
            return relationBloc;
        }
    }

    _getItemId(item,suffix){
        if(!suffix){
            suffix = "";
        }
        let specificId = item.ids["IOS"];
        let id = (specificId ? specificId : item.ids["string"]) + suffix;
        if(this._config.transfomIdFunction){
            var fn = new Function("return " + this._config.transfomIdFunction)();
            id = fn(id);
        }
        return id;
    }

    

    _formatValue(unformatted){
        let regex = /{{(text|number|float|float:[0-9]*)}}/g;
        let matchs = unformatted.match(regex);
        if (matchs != null) {
            for (let occurence = 0; occurence < matchs.length; occurence++) {
                var foundPattern = matchs[occurence];
                switch (foundPattern) {
                    case "{{text}}":
                        unformatted = unformatted.replace(foundPattern, `%s`)
                        break;
                    case "{{number}}":
                        unformatted = unformatted.replace(foundPattern, `%@`)
                        break;
                    case "{{float}}":
                        unformatted = unformatted.replace(foundPattern, `%f`)
                        break;
                    default:
                        if (foundPattern.includes("{{float:")) {
                            var decimal = foundPattern.replace("{{float:", "").replace("}}", "");
                            unformatted = unformatted.replace(foundPattern, `%.${decimal}f`)
                        }

                }
            }
        }

        return unformatted;
    }
}
export default IOSConvertor;