String.prototype.removeAll = function (caract) {
    return this.split(caract).join('');
}

String.prototype.replaceAll = function (oldCaract, newCaract) {
    return this.split(oldCaract).join(newCaract);
}

String.prototype.toXmlFormat = function () {
    return this.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    //return this.replaceAll('&','&amp;');
}

String.prototype.indexesOf = function (caract) {
    var indexes = [];
    for (var i = 0; i < this.length; i++) {
        if (this[i] === caract) indexes.push(i);
    }
    return indexes;
}

String.prototype.replaceAt = function (index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + 1);
}

String.prototype.removeBackslash = function () {
    var result = "";
    for (var i = 0, len = this.length; i < len; i++) {
        var currentCaract = this[i];
        if (currentCaract == '\\' && this[i + 1] != 'n') {
            continue;
        }
        result += currentCaract;
    }
    return result;
}

String.prototype.fromXmlFormat = function () {
    return this
        .replaceAll('&amp;', '&')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>');
}

String.prototype.isHTMLFormat = function () {
    return /<(br|basefont|hr|input|source|frame|param|area|meta|!--|col|link|option|base|img|wbr|!DOCTYPE).*?>|<(a|abbr|acronym|address|applet|article|aside|audio|b|bdi|bdo|big|blockquote|body|button|canvas|caption|center|cite|code|colgroup|command|datalist|dd|del|details|dfn|dialog|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frameset|head|header|hgroup|h1|h2|h3|h4|h5|h6|html|i|iframe|ins|kbd|keygen|label|legend|li|map|mark|menu|meter|nav|noframes|noscript|object|ol|optgroup|output|p|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video).*?<\/\2>/.test(this);
}

String.prototype.formatAndroidResourceTextToCsv = function () {
    var result = this.replaceAll("\\'", "'");
    result = result
        .matchReplace(/%\d+\$d/g, '{{number}}')
        .matchReplace(/%\d+\$s/g, '{{text}}')
        .matchReplace(/%\d+\$f/g, '{{float}}');

    var matchs = this.match(/%\d+\$\.\d+f/g);
    if (matchs != null) {
        matchs.forEach(function (s) {
            var decimal = s.substring(4, s.length - 1);
            result = result.replaceAll(s, decimal == 0 ? '{{float}}' : '{{float:' + decimal + '}}');
        });
    }
    return result;
}

String.prototype.matchReplace = function (regex, newValues) {
    var result = this;
    var matchs = result.match(regex);
    if (matchs != null) {
        matchs.forEach(function (s) {
            result = result.replaceAll(s, newValues)
        });
    }
    return result;
}

String.prototype.formatIOSResourceTextToCsv = function () {
    var result = this.slice(1, this.length - 1)
        .replaceAll('\\"', '"')
        .replaceAll('%@', '{{text}}')
        .replaceAll('%d', '{{number}}')
        .replaceAll('%f', '{{float}}');
    var regex = /%\.\d+f/g;
    var matchs = result.match(regex);
    if (matchs == null) {
        return result;
    }

    for (index = 0; index < matchs.length; index++) {
        var decimal = matchs[index].substring(2, matchs[index].length - 1);
        result = result.replaceAll(matchs[index], '{{float:' + decimal + '}}');
    }
    return result;
}