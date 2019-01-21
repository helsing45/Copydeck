export function replaceAll(string, oldCaract, newCaract) {
    return string.split(oldCaract).join(newCaract);
}

export function toXMLFormat(string) {
    string = replaceAll(string, '&', '&amp;');
    string = replaceAll(string, '<', '&lt;');
    string = replaceAll(string, '>', '&gt;');
    return string;
}

/*String.prototype.removeAll = function (caract) {
    return this.split(caract).join('');
}

String.prototype.fromXmlFormat = function () {
    return this
        .replaceAll('&amp;', '&')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>');
}

Object.assign(String.prototype, {
    toXmlFormat() {
        
    }
});*/