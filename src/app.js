
import Convertor from './core/Convertor'

var AndroidDefaultConfig = {
    "inputSrcType":"file_path",
    "groupBy":"Section",
    "filter":'item.meta.Target == "android" || item.meta.Target == "all" || item.meta.Target == "Mobile"'
};

var IOSDefaultConfig = {
    "inputSrcType":"file_path",
    "groupBy":"Section",
    "transfomIdFunction":"function(id){return id.toUpperCase();}"
};

var json = require("../files/json/mock.json");
//"filter":'item.meta.target == "android" || item.meta.target == "all"'   
//npm run compile
new Convertor()
    .setConfig(AndroidDefaultConfig)
    //.setInputSrc("./files/group.csv")
    .setInputFile(json)
    .setInputType("csv")
    .setOutputType("android")
    .build()
    .then(result => {
        console.log(result);
    }).catch(e =>{
        console.log(e);
    });

