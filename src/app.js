
import Convertor from './core/Convertor'

var config = {
    "inputSrcType":"file_path",
    "groupBy":"Section"
};

new Convertor()
    .setConfig(config)
    .setInputSrc("./files/multiple_ids.csv")
    .setInputType("csv")
    .setOutputType("android")
    .build()
    .then(result => {
        console.log(result);
    }).catch(e =>{
        console.log(e);
    });

