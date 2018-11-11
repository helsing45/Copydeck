import CsvConvertor from './core/CsvConvertor'

let csvStr = 
'Section_ID,String_ID,Android_ID,IOS_ID,Web_ID,Target,Plural,fr,en,es\n\
04 - Test cas extrem,,android_ID,IOS_ID,web_id,Mobile,,Test avec des IDs individuel,Test avec des IDs individuel,Test avec des IDs individuel\n\
01 - Login,login title,,,,Mobile,,Courriel,Email,Correo electrónico\n\
01 - Login,password title,,,,Mobile,,Mot de passe,Password,Contraseña\n\
04 - Test cas extrem,test 3,,,,Mobile,,"""test guillemet""","""test guillemet""","""test guillemet"""'


let csv = new CsvConvertor();
csv.toConversionItem("./files/mock.csv");

