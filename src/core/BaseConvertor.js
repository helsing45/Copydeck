class BaseConvertor {
    constructor(config) {
        this._config = config;
        this._errors = [];
        this._warnings = [];
        this._fromConversionItemPromise = args => {
            return new Promise((resolve) => {
                resolve(this.translateFromConversionItems(args));
            });
        };
        this._toConversionItemPromise = args => {
            return new Promise((resolve) => {
                resolve(this.translateToConversionItems(args));
            });
        }
    }

    translateFromConversionItems(args) {}
    translateToConversionItems(args){}

    toConversionItem(args) {
        return this._toConversionItemPromise(args);
    }

    fromConversionItem(args) {
        return this._fromConversionItemPromise(args);
    }
}
export default BaseConvertor;