// index for ingestor
if(typeof require !== 'undefined') XLSX = require('xlsx');
function compactToken(expr){
	expr = expr.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ");
	var tokens = expr.trim().split(/\s+/);
	return tokens.map((token)=>token.substr(0,1).toUpperCase()+token.substr(1)).join('');
}


var workbook = XLSX.readFile('Game.xlsx');
var nsWorksheet = workbook.Sheets["_Namespaces_"];
var nsArr = XLSX.utils.sheet_to_json(nsWorksheet);
var nsTemplate = (nsNode)=>`prefix ${nsNode.prefix}: <${nsNode.namespace.trim()}>`;
var spup = nsArr.map((nsNode)=>nsTemplate(nsNode)).join('\n')+'\n';
console.log(spup);
var shaclDeclTemplate = (nsArr)=>`
shape:
	sh:declare 
	${nsArr.map((nsNode)=>`
	[
		sh:prefix "${nsNode.prefix}"^^xsd:string ;
		sh:namespace <${nsNode.namespace.trim()}> ;
		sh:description """${nsNode.description.trim()}"""^^xsd:string ;
	]`).join(',\n')} .
	`;
console.log(shaclDeclTemplate(nsArr))
var vocabWorksheet = workbook.Sheets["Vocab"];
var vocabArr = XLSX.utils.sheet_to_json(vocabWorksheet);

var vocabTemplate = (row)=>`
vocab:_${compactToken(row["Pref Label"])}
    a vocab: ;
    vocab:prefLabel "${row["Pref Label"]}"^^xsd:string ;
    rdfs:label "${row["Pref Label"]}"^^xsd:string ;
    vocab:description "${row["Description"]}"^^xsd:string ;
  .`;
var vocabs = vocabArr.map((row)=>vocabTemplate(row)).join("\n");
console.log(vocabs);

var termWorksheet = workbook.Sheets["Term"];
var termArr = XLSX.utils.sheet_to_json(termWorksheet);

var termTemplate = (row)=>`
term:_${compactToken(row["Vocab"])}_${compactToken(row["Pref Label"])}
    a term: ;
    term:prefLabel "${row["Pref Label"]}"^^xsd:string ;
    rdfs:label "${row["Pref Label"]}"^^xsd:string ;
    term:hasVocab vocab:_${compactToken(row["Vocab"])} ;
    ${row["Symbol"]?`term:symbol "${row["Symbol"]}"^^xsd:string ;`:''}
    ${row["Default Value"]?`term:defaultValue "${row["Default Value"]}"^^xsd:string ;`:''}
    term:description """${row["Description"]}"""^^xsd:string ;
  .`;
var terms = termArr.map((row)=>termTemplate(row)).join("\n");
console.log(terms);

var npcWorksheet = workbook.Sheets["NPC"];
var npcArr = XLSX.utils.sheet_to_json(npcWorksheet);
var npcAttributes = [
	"Strength","Endurance","Agility",
	"Dexterity","Presence","Attractiveness",
	"Sanity","Intelligence","Memory",
	"Wisdom","Magic","Luck","Creativity"];
var currencies = ["Farthing","Penny","Crescent","Lunad","Solad"]	
var npcTemplate = (row,npcAttributes)=>`
npc:_${compactToken(row.Name)}
    a npc: ;
    term:prefLabel "${row.Name}"^^xsd:string ;
    rdfs:label "${row.Name}"^^xsd:string ;
    npc:hasGender term:_Gender_${compactToken(row.Gender)} ;
    npc:hasSpecies term:_Species_${compactToken(row.Species)} ;
    npc:hasVocation term:_Vocation_${compactToken(row.Vocation)} ;
    npc:hasApparentAge term:_ApparentAge_${compactToken(row["Apparent Age"])} ;
    npc:hasAlignment term:_Alignment_${compactToken(row.Alignment)} ;
    ${npcAttributes.map((attribute)=>`
    npc:has${compactToken(attribute)} "${row[attribute]}"^^xsd:integer ;`).join('')};
    npc:hasPurse ${currencies.map((currency)=>`
   		[
   			a purse: ;
   			purse:currencyType term:_Currency_${compactToken(currency)} ;
   			purse:count "${row[currency]}"^^xsd:integer
   		]`)};
    npc:description """${row["Description"]}"""^^xsd:string ;
  .`;
var npcs = npcArr.map((row)=>npcTemplate(row,npcAttributes)).join("\n");
console.log(npcs);

