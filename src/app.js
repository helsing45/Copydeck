
import Convertor from './core/Convertor'

var config = {
    "inputSrcType":"file_path",
    "groupBy":"Section",
    "filter":'item.meta.target == "android" || item.meta.target == "all"'
   
};

new Convertor()
    .setConfig(config)
    .setInputSrc("./files/target.csv")
    .setInputType("csv")
    .setOutputType("android")
    .build()
    .then(result => {
        console.log(result);
    }).catch(e =>{
        console.log(e);
    });

