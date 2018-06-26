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
|Plural|Indicates which of the two strings (having the same identifier) is the plural.|

#### Language column
All the columns that are found after the Plural column are the languages their headers should represent the following language code: [Language Codes]
The __first column of languages__ will be defined as the default. (Base.lproj or values)

#### String with parameter
| Parameter | Description |
| ------ | ------ |
|{{number}}|Indicates that the string will be composed of a parameter that is a numeric|
|{{text}}|Indicates that the string will be composed of a parameter that is a text.|
|{{float:precision}}|Indicates that the string will be composed of a parameter that is a float. The precision parameter is optional, it's use to determine what is the maximal decimal. By exemple, the output of {{float}} is %f and {{float:2}} is %.2f|

#### Additional Column
If you want to add comment columns or any other columns that are not used for file generation, you must add them before the Plural column.

#### Column key
| Column | Description |
| ------ | ------ |
|String_ID*|Default key for the string|
|IOS_ID| Key for the string, that will be use for IOS ressource|
|Android_ID| Key for the string, that will be use for android ressource|
|Web_ID| Key for the string, that will be use for i18Next ressource|

\* _String_ID_ values will override the other column key if not empty.

[Input Exemple]

## Output
Once you upload a well formatted copydeck.csv the tool will generate four files.
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

### i18Next resources
```
i18next-String.zip
    |-> {langage-code}.json
        
```

# CSV file generator from resource
This tool allow you to generates a csv file based on resources already in use on an application.
\* Only work with android and IOS resources files.
## Input
For the proper use of the tools, the input file must have the following format
```
resources
    |-> Base.lproj
        |-> Localizable.strings
    |-> {langage-code}.lproj
        |-> Localizable.strings        
    |-> values
        |-> string.xml
    |-> values-{langage-code}
        |-> string.xml
```
## Output
The CSV file that will allow you to generate the resource file.
# Release notes
## v0.2.3
_NEW:_
* Now handle float tags.

_IMPROVEMENT:_ 
* The conversionFile generation algorithm has been improve:
    * The character ’ (\u2019) is now replaced by ' (\u0027).
    * No longer remove quotation mark, the IOS resource generation algorithm handle this case by adding backslash before the quotation mark.
    * The backslash are no longer remove if the next character is _n_ so now \n are no longer break by the algorithm.
    * The strings are now trim before being add to the file.

_FIX:_ 
* The column Plurial is now name plural
* The plurals of IOS are no longer _plurial it's been correct to _plural

## v0.3.0
_NEW:_
* New feature that allows you to generate the csv file from an application's resources
* Resource generation now allows specifying IDs for android or IOS

## v0.4.0
_NEW:_ 
* The resource generator, now generate i18Next resources
* It's now possible to specify a key for web.


[//]: # 

[Language Codes]: <https://msdn.microsoft.com/fr-fr/en%C2%ADus/library/ms533052(d=printer,v=vs.85).aspx>
[Input Exemple]:<https://github.com/helsing45/Copydeck/blob/gh-pages/doc/Copy-deck%20V2%20(WIP).csv>