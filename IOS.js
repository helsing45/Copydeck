var language;

function generateIOSStringFile(conversionFile, language){
	this.language = language;
	var xmlDoc = jQuery.parseXML(conversionFile);
	var stringsFile = '/* \n  Localizable.strings \n   Copyright ©  APPCOM. All rights reserved.\n*/\n';
	for(var index = 0; index < xmlDoc.children[0].children.length; index++){
		stringsFile += readSectionForLocalizableFile(xmlDoc.children[0].children[index]);
	}
	return stringsFile;
}

function readSectionForLocalizableFile(section){
	var sectionXML ='/* ' + section.getAttribute("id") + ' */ \n';
	
	return sectionXML;
}