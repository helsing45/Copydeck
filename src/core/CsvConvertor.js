import BaseConvertor from './BaseConvertor'
import ConversionItem from '../model/ConversionItem'
import LocalValue from '../model/LocalValue'
const csv = require('csvtojson')
const LocalCode = require('locale-code')
const ISO6391 = require('iso-639-1')
const SECTION_ID = "Section_ID";

/*npm run compile*/
class CsvConvertor extends BaseConvertor {
    toConversionItem(inputPath) {
        csv()
            .fromFile(inputPath)
            .then((json) => {
                var conversionItems = json.map(x => this.jsonObjectToConversionObject(x));
                var cc = this.associateRelations(conversionItems);
                var b = true;
            })
    }

    jsonObjectToConversionObject(json) {
        var item = new ConversionItem();
        Object.keys(json).forEach(key => {
            if (ISO6391.validate(key)) {
                item.addValue(new LocalValue(key, null, json[key]));
            } else if (LocalCode.validate(key)) {
                var keySplit = key.split('-');
                item.addValue(new LocalValue(keySplit[0], keySplit[1], json[key]));
            } else if (key.toLowerCase().includes("_id")) {
                if (json[key].trim().length > 0) {
                    item.addId(key, json[key]);
                }
            } else {
                item.addMeta(key, json[key]);
            }
        });
        return item;
    }

    associateRelations(items) {
        var groupedItems = {};
        items.forEach(element => {
            if (!(element.getUniqueId() in groupedItems)) {
                groupedItems[element.getUniqueId()] = [];
            }
            groupedItems[element.getUniqueId()].push(element);
        });
        var result = [];

        var keys = Object.keys(groupedItems);
        for (let index = 0; index < keys.length; index++) {
            var element = groupedItems[keys[index]];
            if (element.length == 1) {
                result.push(element[0]);
            } else {
                result.push(this.handleRelationOf(element));
            }
        }
        return result;
    }

    handleRelationOf(items) {
        var result = new ConversionItem();
        var hasBeenSetup = false;

        for (let index = 0; index < items.length; index++) {
            const element = items[index];
            var foundRelation = this.findRelation(element);
            if (!foundRelation) {
                if(!hasBeenSetup){
                result.copy(element);
                hasBeenSetup = true;
                }else{
                    this._warnings.push("Duplicate ID detected");
                }
            } else {
                result.addRelation(foundRelation,element);
            }

        }
        return result;
    }

    findRelation(conversionItem) {
        if(conversionItem.meta["Plural"]){
            return "Plural";
        }
        return "";
    }
}
export default CsvConvertor;