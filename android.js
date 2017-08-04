var language;

function generateStringFile(conversionFile, language){
	this.language = language;
	var xmlDoc = jQuery.parseXML(conversionFile);
	var stringXML = '<resources>\n';
	for(var index = 0; index < xmlDoc.children[0].children.length; index++){
		stringXML += readSection(xmlDoc.children[0].children[index]);
	}
	
	stringXML += '</resources>';
	return stringXML;
}

function readSection(section){
	var sectionXML ='<!-- ' + section.getAttribute("id") + ' -->\n';
	for(var index = 0; index < section.children.length; index++){
		var string = section.children[index];
		if(string.getAttribute("target") == "Mobile" || string.getAttribute("target") == "Android"){
			if(section.children[index].getElementsByTagName(language)[0].childNodes.length == 1){
				sectionXML += '<string name="'+string.getAttribute("id")+'">' + xmlToAndroidXmlString(string.getElementsByTagName(this.language)[0].childNodes[0].nodeValue) + '</string>\n';				
			}else{				
				var single = string.getElementsByTagName(language)[0].getElementsByTagName("one")[0].childNodes[0].nodeValue;
				var plural = string.getElementsByTagName(language)[0].getElementsByTagName("many")[0].childNodes[0].nodeValue;
				
				var pluralsXml = '<plurals name="'+section.children[index].getAttribute("id")+'">';
				pluralsXml += '<item quantity="one">' + xmlToAndroidXmlString(single) + '</item>';
				pluralsXml += '<item quantity="other">' + xmlToAndroidXmlString(plural) + '</item> </plurals>\n';
				sectionXML += pluralsXml;
			}
			
		}
	}
	return sectionXML;
}

/* Will change all the {{number}} for %d and {{text}} for %s*/
function xmlToAndroidXmlString(unformattedString){
	var numberFormattedString = unformattedString.split('{{number}}').join('%d');
	var stringFormatted = numberFormattedString.split('{{text}}').join('%s');
	var androidFormatted = stringFormatted.split("'").join("\\'");
	return androidFormatted;
}