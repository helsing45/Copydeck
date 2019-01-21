import BaseConvertor from './BaseConvertor'
import ConversionItem from '../model/ConversionItem'

const csv = require('csvtojson')
const LocalCode = require('locale-code')
const ISO6391 = require('iso-639-1')

/*npm run compile*/
class CsvConvertor extends BaseConvertor {

    translateToConversionItems(input) {
        var csvBuilder;
        if(input["format"] == 'filePath'){
            csvBuilder = csv().fromFile(input['data']);
        }else if(input['format']=='string_data' && input['data'].length > 0 && input['data'][0]['data']){
            csvBuilder = csv().fromString(input['data'][0]['data'])
        }
        return csvBuilder.then((json) => {
            var conversionItems = json.map(x => this._jsonObjectToConversionObject(x));
            return this._associateRelations(conversionItems);
        });
    }

    _jsonObjectToConversionObject(json) {
        var item = new ConversionItem();
        Object.keys(json).forEach(key => {
            if (ISO6391.validate(key) || LocalCode.validate(key)) {
                item.addValue(key, json[key]);
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

    _associateRelations(items) {
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
                result.push(this._handleRelationOf(element));
            }
        }
        return result;
    }

    _handleRelationOf(items) {
        var result = new ConversionItem();
        var hasBeenSetup = false;

        for (let index = 0; index < items.length; index++) {
            const element = items[index];
            var foundRelation = this._findRelation(element);
            if (!foundRelation) {
                if (!hasBeenSetup) {
                    result.copy(element);
                    hasBeenSetup = true;
                } else {
                    this._warnings.push("Duplicate ID detected");
                }
            } else {
                result.addRelation(foundRelation.toLowerCase(), element);
            }

        }
        return result;
    }

    _findRelation(conversionItem) {
        if(conversionItem.meta["relation"]){
            return conversionItem.meta["relation"];
        }else if (conversionItem.meta["Plural"]) {
            return "Plural";
        }
        return "";
    }
}
export default CsvConvertor;