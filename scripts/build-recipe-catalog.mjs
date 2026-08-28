import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve(import.meta.dirname,'..');
const appPath=path.join(root,'js','app.js');
const sourcePath=path.join(root,'scripts','fixtures','base-recipes.json');
const outputPath=path.join(root,'js','recipe-catalog.js');
const detailsDir=path.join(root,'data','recipes');
const searchIndexPath=path.join(root,'data','recipe-search-index.json');
const modifierFiles=[
  'recipe-quality.js','caucasus-recipes.js','detailed-recipes.js','mediterranean-recipes.js',
  'thai-recipes.js','japanese-recipes.js','korean-recipes.js','russian-recipes.js',
  'sous-vide-recipes.js','chef-review-recipes.js'
];
const modifierKeys=[
  'TABLE_BOOK_RECIPE_QUALITY','TABLE_BOOK_CAUCASUS_RECIPES','TABLE_BOOK_DETAILED_RECIPES',
  'TABLE_BOOK_MEDITERRANEAN_RECIPES','TABLE_BOOK_THAI_RECIPES','TABLE_BOOK_JAPANESE_RECIPES',
  'TABLE_BOOK_KOREAN_RECIPES','TABLE_BOOK_RUSSIAN_RECIPES','TABLE_BOOK_SOUS_VIDE_RECIPES',
  'TABLE_BOOK_CHEF_REVIEW'
];

fs.mkdirSync(path.dirname(sourcePath),{recursive:true});
let appSource=fs.readFileSync(appPath,'utf8');
if(!fs.existsSync(sourcePath)){
  const start=appSource.indexOf('const recipes = [');
  const end=appSource.indexOf('\nconst cuisineThemes=',start);
  if(start<0||end<0) throw new Error('Base recipe array was not found in app.js');
  const declaration=appSource.slice(start,end).replace(/^const recipes\s*=\s*/,'');
  const recipes=JSON.parse(declaration.replace(/;\s*$/,''));
  fs.writeFileSync(sourcePath,JSON.stringify(recipes));
}

const recipes=JSON.parse(fs.readFileSync(sourcePath,'utf8'));
const sandbox={window:{},console,structuredClone:globalThis.structuredClone};
vm.createContext(sandbox);
for(const file of modifierFiles){
  vm.runInContext(fs.readFileSync(path.join(root,'js',file),'utf8'),sandbox,{filename:file});
}
for(const key of modifierKeys) sandbox.window[key]?.apply?.(recipes);
const aliases=sandbox.window.TABLE_BOOK_RECIPE_QUALITY?.aliases||{};
const detailFields=['ingredients','steps','tips','historyNote','recipeSources','reviewVersion'];
const ingredientGroupRules=[
  ['Птица',['куриц','курин','цыпл','индей','утк','гус','перепел']],
  ['Рыба и морепродукты',['рыб','лосос','сёмг','семг','форел','тунец','треск','судак','скумбр','сельд','кревет','кальмар','миди','осьмин','морепродукт','краб','угор','красная икра','лососевая икра','икра минтая','анчоус','сардин','шпрот','дорад','сибас','палтус','карп','хек','минтай','гребеш','суши','ролл']],
  ['Мясо',['говя','телят','свинин','порос','баранин','ягн','бекон','ветчин','колбас','мяс','стейк','беф','рёбр','ребр','корейк','карбонад','хаш','печёноч','печеноч','печень гов','фарш мяс','голубц']],
  ['Крупы, бобовые и макароны',['рис','греч','овся','овёс','пшен','перлов','киноа','булгур','кускус','макарон','паста','спагет','лапш','рамэн','рамен','нут','чечев','фасол','горох','боб','тофу','полент','кукурузн круп','каша','плов']],
  ['Фрукты и ягоды',['яблок','груш','персик','абрикос','слив','вишн','черешн','клубник','малин','черник','смород','ягод','виноград','апельсин','мандарин','лимон','лайм','манго','ананас','банан','гранат','инжир','финик','айв']],
  ['Овощи и грибы',['картоф','капуст','свёкл','свекл','морков','томат','помидор','огур','баклаж','кабач','цуккин','перец','тыкв','шпинат','брокколи','цветн','гриб','шампин','лук','чеснок','редис','реп','спарж','авокадо','овощ']],
  ['Яйца и молочные продукты',['яйц','омлет','сыр','творог','молок','йогурт','сливк','сметан','кефир','мацон','ряжен','брынз','сулугун']],
  ['Тесто и выпечка',['мук','тест','хлеб','лаваш','пирог','пирож','булоч','блин','олад','вафл','печень','кекс','торт','хачапур','пельмен','вареник','манты','самс','штруд','галет']],
  ['Орехи и семена',['орех','миндал','фисташ','арахис','кунжут','семеч','маков']]
];
const ingredientGroupFallback={"Выпечка":"Тесто и выпечка","Морепродукты":"Рыба и морепродукты","Десерты":"Яйца и молочные продукты","Фрукты":"Фрукты и ягоды","Завтраки":"Яйца и молочные продукты","Салаты":"Овощи и грибы","Супы":"Овощи и грибы","Гарниры":"Овощи и грибы","Соусы":"Овощи и грибы"};
const ingredientName=line=>String(line||'').split(/\s+[—–-]\s+/)[0].trim();
const detectedIngredientGroup=value=>{
  const text=String(value||'').toLocaleLowerCase('ru-RU');
  if(text.includes('кабачковая икра')||text.includes('баклажанная икра')) return 'Овощи и грибы';
  return ingredientGroupRules.find(([,tokens])=>tokens.some(token=>text.includes(token)))?.[0]||'';
};
const recipeIngredientGroup=recipe=>{
  if(recipe.ingredientGroup) return recipe.ingredientGroup;
  const titleGroup=detectedIngredientGroup(recipe.title);
  if(titleGroup) return titleGroup;
  for(const line of (Array.isArray(recipe.ingredients)?recipe.ingredients:[]).slice(0,6)){
    const group=detectedIngredientGroup(line);
    if(group) return group;
  }
  return ingredientGroupFallback[recipe.category]||'Другие продукты';
};
fs.mkdirSync(detailsDir,{recursive:true});
let detailBytes=0;
const searchIndex={};
const catalog=recipes.map(recipe=>{
  const item={...recipe};
  item.ingredientGroup=recipeIngredientGroup(item);
  searchIndex[item.id]=[...new Set((Array.isArray(item.ingredients)?item.ingredients:[]).map(ingredientName).filter(Boolean))];
  const detail={id:item.id};
  for(const field of detailFields){
    if(Object.prototype.hasOwnProperty.call(item,field)) detail[field]=item[field];
    delete item[field];
  }
  const json=JSON.stringify(detail);
  fs.writeFileSync(path.join(detailsDir,`${item.id}.json`),json);
  detailBytes+=Buffer.byteLength(json);
  return item;
});
const output=`/* Generated by scripts/build-recipe-catalog.mjs. */\nwindow.TABLE_BOOK_RECIPES=${JSON.stringify(catalog)};\nwindow.TABLE_BOOK_RECIPE_ALIASES=${JSON.stringify(aliases)};\n`;
fs.writeFileSync(outputPath,output);
fs.writeFileSync(searchIndexPath,JSON.stringify(searchIndex));

if(process.argv.includes('--rewrite-app')){
  appSource=fs.readFileSync(appPath,'utf8');
  const start=appSource.indexOf('const recipes = [');
  const end=appSource.indexOf('\nconst cuisineThemes=',start);
  if(start>=0&&end>start){
    appSource=appSource.slice(0,start)+"const recipes=Array.isArray(window.TABLE_BOOK_RECIPES)?window.TABLE_BOOK_RECIPES:[];"+appSource.slice(end);
  }
  appSource=appSource.replace(/^if\(window\.TABLE_BOOK_(?:RECIPE_QUALITY|CAUCASUS_RECIPES|DETAILED_RECIPES|MEDITERRANEAN_RECIPES|THAI_RECIPES|JAPANESE_RECIPES|KOREAN_RECIPES|RUSSIAN_RECIPES|SOUS_VIDE_RECIPES|CHEF_REVIEW)\).*\r?\n/gm,'');
  fs.writeFileSync(appPath,appSource);
}

console.log(JSON.stringify({recipes:recipes.length,sourceBytes:fs.statSync(sourcePath).size,catalogBytes:fs.statSync(outputPath).size,detailBytes,searchIndexBytes:fs.statSync(searchIndexPath).size},null,2));
