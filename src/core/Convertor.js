import IO from '../model/IO'
class Convertor {
    constructor (){
        this._config;
        this._input = new IO();
        this._output = new IO();
    }

    setInputSrc(inputSrc){
        this._input.src = inputSrc;
        return this;
    }

    setInputType(inputType){
        this._input.type = inputType;
        return this;
    }

    setOutputSrc(outputSrc){
        this._output.src = outputSrc;
        return this;
    }

    setOutputType(outputType){
        this._output.type = outputType;
        return this;
    }

    setConfig(config){
        this._config = config;
        return this;
    }

    build(){
        var inputConvertor = this._input.getConvertor(this._config);
        var outputConvertor = this._output.getConvertor(this._config);
        return inputConvertor
                .toConversionItem(this._input.src)
                .then( r=>{
                    return outputConvertor.fromConversionItem(r)
                });

    }
}
export default Convertor;   