
import Convertor from './core/Convertor'

var config = {
    "inputSrcType":"file_path",
    "groupBy":"Section"
};

new Convertor()
    .setConfig(config)
    .setInputSrc("./files/variables.csv")
    .setInputType("csv")
    .setOutputType("android")
    .build()
    .then(result => {
        var b = true;    
    }).catch(e =>{
        console.log(e);
    });

