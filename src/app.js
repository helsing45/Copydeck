
import Convertor from './core/Convertor'

var AndroidDefaultConfig = {
    "inputSrcType":"file_path",
    "groupBy":"Section",
};

var IOSDefaultConfig = {
    "inputSrcType":"file_path",
    "groupBy":"Section",
    "transfomIdFunction":"function(id){return id.toUpperCase();}"
};

//"filter":'item.meta.target == "android" || item.meta.target == "all"'   

new Convertor()
    .setConfig(AndroidDefaultConfig)
    .setInputSrc("./files/relation.csv")
    .setInputType("csv")
    .setOutputType("IOS")
    .build()
    .then(result => {
        console.log(result);
    }).catch(e =>{
        console.log(e);
    });

