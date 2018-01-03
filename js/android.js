var language;

function generateAndroidStringFile(conversionFile, language) {
	this.language = language;
	var xmlDoc = jQuery.parseXML(conversionFile);
	var date = moment().format("MMMM Do YYYY, h:mm:ss a");
	var stringXML = '<?xml version="1.0" encoding="utf-8"?> \n  <!-- generation time : ' + date + '--> \n<resources>\n';
	for (var index = 0; index < xmlDoc.children[0].children.length; index++) {
		stringXML += (index > 0 ? "\n" : "") + readSectionForAndroidXML(xmlDoc.children[0].children[index]);
	}

	stringXML += '</resources>';
	return stringXML;
}

function readSectionForAndroidXML(section) {
	var sectionXML = section.getAttribute("id").length == 0 ? "" : '<!-- ' + section.getAttribute("id") + ' -->\n';
	for (var index = 0; index < section.children.length; index++) {
		var string = section.children[index];
		if (string.getAttribute("target") == "Mobile" || string.getAttribute("target") == "Android") {
			if (section.children[index].getElementsByTagName(language)[0].childNodes.length == 1) {
				sectionXML += '    <string name="' + string.getAttribute("id") + '">' + xmlToAndroidXmlString(string.getElementsByTagName(this.language)) + '</string>\n';
			} else {
				var single = string.getElementsByTagName(language)[0].getElementsByTagName("one");
				var plural = string.getElementsByTagName(language)[0].getElementsByTagName("many");

				var pluralsXml = '    <plurals name="' + section.children[index].getAttribute("id") + '">';
				pluralsXml += '\n        <item quantity="one">' + xmlToAndroidXmlString(single) + '</item>';
				pluralsXml += '\n        <item quantity="other">' + xmlToAndroidXmlString(plural) + '</item>';
				pluralsXml += '\n    </plurals>\n';
				sectionXML += pluralsXml;
			}

		}
	}
	return sectionXML;
}

function xmlToAndroidXmlString(valueXml) {
	var floatFormattedString = floatTextFormat(valueXml[0].childNodes[0].nodeValue);
	var numberFormattedString = numberFormat(floatFormattedString);
	var stringFormatted = textFormat(numberFormattedString).replaceAll("'", "\\'");
	if (valueXml[0].getAttribute("html") == "true") {
		return stringFormatted;
	} else {
		return stringFormatted.toXmlFormat();
	}

}

function numberFormat(unformattedString) {
	return formatString(unformattedString, '{{number}}', 'd');
}

function textFormat(unformattedString) {
	return formatString(unformattedString, '{{text}}', 's');
}

function floatTextFormat(unformattedString) {
	// Replace float with no custom decimal
	unformattedString = unformattedString.replaceAll('{{float}}', '%f').replaceAll('{{float:}}', '%f');

	//Prepare to replace the float with custom decimal;
	var regex = /{{float:\d+}}/g;
	var matchs = unformattedString.match(regex);
	//If the string is already well formatted we don't continue.
	if (matchs != null) {
		for (var index = 0; index < matchs.length; index++) {
			var decimal = matchs[index].substring(8, matchs[index].length - 2);
			unformattedString = unformattedString.replaceAll(matchs[index], '%.' + decimal + 'f')
		}
	}

	
	var indexes = unformattedString.indexesOf('%');
	for (var index = indexes.length - 1; index >= 0; index--) {
		unformattedString = unformattedString.replaceAt(indexes[index],('%' + (index + 1) + '$'));
	}
	return unformattedString;
}

function formatString(unformattedString, oldPattern, newPattern) {
	var splittedStrings = unformattedString.split(oldPattern);
	var formattedString = "";

	for (var index = 0; index < splittedStrings.length - 1; index++) {
		var formattedVariable = '%' + (index + 1) + '$' + newPattern;
		formattedString += splittedStrings[index];
		formattedString += formattedVariable;
	}
	formattedString += splittedStrings[splittedStrings.length - 1];
	return formattedString;
}