import LocalValue from "./LocalValue";
import {
    formatWithOptions
} from "util";

class ConversionItem {
    constructor() {
        this._ids = [];
        this._values = [];
        this._relation = [];
        this._meta = {};
    }

    get ids() {
        return this._ids;
    }

    set ids(ids) {
        this._ids = ids;
    }

    addId(id, value) {
        var startIndex = id.toLowerCase().indexOf("_id");
        var formattedId = id.substring(0, startIndex);
        this._ids.push({
            [formattedId]: value
        });
    }

    getUniqueId() {
        var formattedId = "";
        for (let index = 0; index < this._ids.length; index++) {
            var id = this._ids[index];
            formattedId += id[Object.keys(id)[0]];
        }
        return formattedId;
    }

    get values() {
        return this._values;
    }

    set values(values) {
        this._values = ids;
    }

    addValue(value) {
        this._values.push(value);
    }

    get relation() {
        return this._relation;
    }

    set relation(relation) {
        this._relation = relation;
    }

    addRelation(type, relatedItem) {
        this._relation.push({
            [type]: relatedItem
        })
    }

    addMeta(id, value) {
        this._meta[id] = value;
    }

    get meta() {
        return this._meta;
    }

    set meta(meta) {
        this._meta = meta;
    }

    copy(item) {
        this._ids = item.ids;
        this._values = item.values;
        this._meta = item.meta;
    }
}
export default ConversionItem;