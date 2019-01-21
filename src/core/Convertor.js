import IO from '../model/IO'
class Convertor {
    constructor() {
        this._config;
        this._input = new IO();
        this._output = new IO();
    }

    setInputFilePath(inputSrc) {
        this._input.src = inputSrc;
        return this;
    }

    setInputFile(json) {
        this._input.file = json;
        return this;
    }

    setInputType(inputType) {
        this._input.type = inputType;
        return this;
    }

    setOutputSrc(outputSrc) {
        this._output.src = outputSrc;
        return this;
    }

    setOutputType(outputType) {
        this._output.type = outputType;
        return this;
    }

    setConfig(config) {
        this._config = config;
        return this;
    }

    build() {
        var inputConvertor = this._input.getConvertor(this._config);
        var json = {};
        if (this._input.file) {
            json["format"] = "string_data";
            json["data"] = this._input.file;
        } else if (this._input.src) {
            var json = {};
            json["format"] = "filePath";
            json["data"] = this._input.src;
        }

        return inputConvertor
            .toConversionItem(json)
            .then((r)=>this.filter(r));
    }

    filter(result){
        var outputConvertor = this._output.getConvertor(this._config);
        if (this._config.filter) {
            var evaluation = this._config.filter
            result = result.filter(function(item){
                return eval(evaluation);
            });
        }
        return outputConvertor.fromConversionItem(result);
    }
}
export default Convertor;