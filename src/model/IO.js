import CsvConvertor from "../core/CsvConvertor";
import AndroidConvertor from "../core/AndroidConvertor";
import IOSConvertor from "../core/IOSConvertor";

class IO {
    constructor() {
        this._src;
        this._type;
    }

    get src() {
        return this._src;
    }

    set src(src) {
        this._src = src;
    }

    get type() {
        return this._type;
    }

    set type(type) {
        this._type = type;
    }

    getConvertor(config) {
        switch (this._type) {
            case 'csv':
                return new CsvConvertor(config);
            case 'android':
                return new AndroidConvertor(config);
            case 'IOS':
                return new IOSConvertor(config);
            default:
                throw "IO type is not supported";
        }
    }

}
export default IO;