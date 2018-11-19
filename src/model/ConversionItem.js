class ConversionItem {
    constructor() {
        this._ids = {};
        this._values = {};
        this._relations;
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
        var formattedId = id.substring(0, startIndex).toLowerCase();
        this._ids[formattedId] = value;
    }

    getUniqueId() {
        var formattedId = "";

        var keys = Object.keys(this._ids);
        for (let index = 0; index < keys.length; index++) {
            formattedId += this._ids[keys[index]];
        }
        return formattedId;
    }

    get values() {
        return this._values;
    }

    set values(values) {
        this._values = values;
    }

    addValue(key, value) {
        this._values[key] = value;
    }

    get relation() {
        return this._relations;
    }

    set relation(relation) {
        this._relations = relation;
    }

    addRelation(type, relatedItem) {
        if(this._relations === undefined){
            this._relations = {};
        }
        this._relations[type] = relatedItem;
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