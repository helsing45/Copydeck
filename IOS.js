var language;

function generateIOSStringFile(conversionFile, language) {
	this.language = language;
	var xmlDoc = jQuery.parseXML(conversionFile);
	
	var date = moment().format("MMMM Do YYYY, h:mm:ss a");
	var stringsFile = '/* \n  Localizable.strings \n Generation time : ' + date + '\n  */\n';
	for (var index = 0; index < xmlDoc.children[0].children.length; index++) {
		stringsFile += readSectionForLocalizableFile(xmlDoc.children[0].children[index]);
	}
	return stringsFile;
}

function readSectionForLocalizableFile(section) {
	var sectionStringsFile =  section.getAttribute("id").length == 0 ? "\n" :'\n/* ' + section.getAttribute("id") + ' */ \n';
	for (var index = 0; index < section.children.length; index++) {
		var string = section.children[index];
		if (string.getAttribute("target") == "Mobile" || string.getAttribute("target") == "IOS") {
			if (section.children[index].getElementsByTagName(language)[0].childNodes.length == 1) {
				sectionStringsFile += '"' + string.getAttribute("id") + '" = "' + xmlToLocalizableString(string.getElementsByTagName(this.language)[0].childNodes[0].nodeValue) + '";\n';
			} else {
				var single = string.getElementsByTagName(language)[0].getElementsByTagName("one")[0].childNodes[0].nodeValue;
				var plural = string.getElementsByTagName(language)[0].getElementsByTagName("many")[0].childNodes[0].nodeValue;

				sectionStringsFile += '"' + string.getAttribute("id") + '_singular" = "' + xmlToLocalizableString(single) + '";\n';
				sectionStringsFile += '"' + string.getAttribute("id") + '_plural" = "' + xmlToLocalizableString(plural) + '";\n';
			}
		}
	}
	return sectionStringsFile;
}

function xmlToLocalizableString(unformattedString) {
	//TODO handle float
	var numberFormattedString = unformattedString.split('{{number}}').join('%d');
	var textFormattedString = numberFormattedString.split('{{text}}').join('%@');
	return textFormattedString;
}