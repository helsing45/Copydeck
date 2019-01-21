class ConvertionItemUtils {

   static groupBy(group,items){
        let groupedBySectionItems = {};
        items.forEach(element => {
            let elementSection = element.meta[group];
            elementSection ?   elementSection : "";
            if (!(elementSection in groupedBySectionItems)) {
                groupedBySectionItems[elementSection] = [];
            }
            groupedBySectionItems[elementSection].push(element);
        });
        return groupedBySectionItems;
    }

    static findLanguages(items){
        let lang = [];
        items.forEach(element => {
            let langKeys = Object.keys(element.values);
            for (let index = 0; index < langKeys.length; index++) {
                if (lang.indexOf(langKeys[index]) == -1) {
                    lang.push(langKeys[index]);
                }
            }
        });
        return lang;
    }
}
export default ConvertionItemUtils;