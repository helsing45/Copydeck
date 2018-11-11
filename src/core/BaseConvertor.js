class BaseConvertor {
    constructor(){
        this._errors=[];
        this._warnings=[];
    }

    toConversionItem(args) {
        console.log("Base convertor will convert to ConversionItem");
    }

    fromConversionItem() {
        console.log("Base convertor will generate data from ConversionItem");
    }
}
export default BaseConvertor;