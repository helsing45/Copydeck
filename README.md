# String file resources generator

This tool allow you to maintain all the strings for many platform.
For now it work for android and IOS device.

This tool make it easy to maintain string by generate the string resource for you.

## Input
This tool need a csv to work.
The Csv must meet some specific requirements; 
- No column, other than the language columns, should be found after the "Plural" column.
- Column nomenclature is important for mandatory columns.
- The column "String_ID" must not contain any special characters.
#### Mandatory column
| Column | Description |
| ------ | ------ |
|Section_ID|Represents a section identifier for organizing strings.|
|String_ID|The identifier of the string, must be unique, except in the case where you have the plurals of a string, in this case only you must have the same identifier for the plural string and for the singular string.|
|Target|This column indicates on which platform the string is used|
|Plurial|Indicates which of the two strings (having the same identifier) is the plural.|

#### Language column
All the columns that are found after the Plural column are the languages their headers should represent the following language code: [Language Codes]
The __first column of languages__ will be defined as the default. (Base.lproj or values)

#### String with parameter
| Parameter | Description |
| ------ | ------ |
|{{number}}|Indicates that the string will be composed of a parameter that is a numeric|
|{{text}}|Indicates that the string will be composed of a parameter that is a text.|

#### Additional Column
If you want to add comment columns or any other columns that are not used for file generation, you must add them before the Plural column.

[Input Exemple]

## Output
Once you upload a well formatted copydeck.csv the tool will generate three file.
### ConversionFile.xml
This file only use is for debug purpose, this file  is the base for generating resource file it allow the conversion between the copydeck.csv and the resource files.

### Android resources
```
android-String.zip
    |-> values
        |-> string.xml
    |-> values-{langage-code}
        |-> string.xml
```

### IOS resources
```
iOS-Locale.zip
    |-> Base.lproj
        |-> Localizable.strings
    |-> {langage-code}.lproj
        |-> Localizable.strings
```
[//]: # 

[Language Codes]: <https://msdn.microsoft.com/fr-fr/en%C2%ADus/library/ms533052(d=printer,v=vs.85).aspx>
[Input Exemple]:<https://github.com/helsing45/Copydeck/blob/gh-pages/doc/Copy-deck%20V2%20(WIP).csv>