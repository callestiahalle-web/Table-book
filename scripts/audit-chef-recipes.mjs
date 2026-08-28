import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve(import.meta.dirname,'..');
const sandbox={window:{},console,structuredClone:globalThis.structuredClone};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'js','recipe-catalog.js'),'utf8'),sandbox,{filename:'recipe-catalog.js'});
const recipes=(sandbox.window.TABLE_BOOK_RECIPES||[]).map(recipe=>Object.assign({},recipe,JSON.parse(fs.readFileSync(path.join(root,'data','recipes',`${recipe.id}.json`),'utf8'))));
vm.runInContext(fs.readFileSync(path.join(root,'js','food-reference.js'),'utf8'),sandbox,{filename:'food-reference.js'});
vm.runInContext(fs.readFileSync(path.join(root,'js','product-portions.js'),'utf8'),sandbox,{filename:'product-portions.js'});
vm.runInContext(fs.readFileSync(path.join(root,'js','chef-food-reference.js'),'utf8'),sandbox,{filename:'chef-food-reference.js'});

const normalize=value=>String(value||'').normalize('NFKC').toLocaleLowerCase('ru-RU').replace(/ё/g,'е').replace(/[«»"'`]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim();
const timePattern=/\b\d+(?:[–—-]\d+)?\s*(?:секунд(?:у|ы)?|сек\.?|минут(?:у|ы)?|мин\.?|час(?:а|ов)?|ч\.)(?=\s|[.,;:]|$)|\b\d+\s*°c\b/iu;
const gramInStep=/\b\d+(?:[.,]\d+)?\s*(?:г|кг|мл|л)\b/iu;
const amountPattern=/\d+(?:[.,]\d+)?(?:\s*\/\s*\d+)?/u;
const optionalAmount=/по вкусу|по потребности|щепотк|немного|несколько|для подачи|для воды|для верха|для жарки|для фритюра|для сковороды|для панировки|для смазывания|для склеивания|необходимое количество/iu;
const nonFoodIngredient=/деревянные шпажки|кулинарная нить|куриные кости и каркасы/iu;
const foodRows=sandbox.window.TABLE_BOOK_FOOD_NUTRITION_FALLBACK||[];
const foodAliases=foodRows.flatMap(row=>[row.canonical_name,...(row.aliases||[])].map(alias=>({alias:normalize(alias),canonical:row.canonical_name}))).sort((a,b)=>b.alias.length-a.alias.length);
const portionRows=sandbox.window.TABLE_BOOK_PRODUCT_PORTION_FALLBACK||[];
const portionAliases=portionRows.flatMap(row=>[row.canonical_name,...(row.aliases||[])].map(alias=>({alias:normalize(alias),row}))).sort((a,b)=>b.alias.length-a.alias.length);
const ingredientName=line=>String(line||'').split(/\s+[—–]\s+/u)[0].replace(/^начинка:\s*/iu,'').trim();
const nutritionMatch=name=>{const key=normalize(name);return foodAliases.find(item=>item.alias===key)||foodAliases.find(item=>key.length>=4&&item.alias.length>=4&&(key.includes(item.alias)||item.alias.includes(key)));};
const parseNutritionAmount=line=>{
  const source=String(line||'').replace(/½/g,'1/2').replace(/¼/g,'1/4').replace(/¾/g,'3/4');
  const amountText=source.split(/\s+[—–]\s+/u).slice(1).join(' — ')||source;
  const number=value=>{const raw=String(value||'').replace(',','.').trim(); if(raw.includes('/')){const [a,b]=raw.split('/').map(Number); return b?a/b:0;} return Number(raw)||0;};
  const embeddedWeight=amountText.match(/(?:около|весом|массой)\s*(\d+(?:[.,]\d+)?)(?:\s*[–—-]\s*(\d+(?:[.,]\d+)?))?\s*г(?![а-яё])/iu);
  if(embeddedWeight){const low=number(embeddedWeight[1]),high=number(embeddedWeight[2]||embeddedWeight[1]);return {amount:(low+high)/2,unit:'g'};}
  const match=amountText.match(/(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+)?)(?:\s*[–—-]\s*(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+)?))?\s*(кг|мг|г\.?|мл\.?|шт\.?|ст\.?\s*л\.?|ч\.?\s*л\.?|зубчик(?:а|ов)?|ломтик(?:а|ов)?|дольк(?:а|и|ек)|пуч(?:ок|ка|ков)|лист(?:а|ов)?|стеб(?:ель|ля|лей)|пер(?:о|а|ьев)|палочк(?:а|и|ек)|полоск(?:а|и|ок)|л\.?)(?![а-яё])/iu);
  if(!match) return null;
  const amount=Math.max(number(match[1]),number(match[2]||match[1]));
  const raw=match[3].toLocaleLowerCase('ru-RU').replace(/\s+/g,'').replace(/\.$/,'');
  let unit='piece';
  if(raw==='кг') return {amount:amount*1000,unit:'g'};
  if(raw==='мг') return {amount:amount/1000,unit:'g'};
  if(raw==='г') unit='g'; else if(raw==='л') return {amount:amount*1000,unit:'milliliter'}; else if(raw==='мл') unit='milliliter';
  else if(raw.startsWith('ст.л')) unit='tablespoon'; else if(raw.startsWith('ч.л')) unit='teaspoon'; else if(raw.startsWith('зубчик')) unit='clove'; else if(raw.startsWith('ломтик')) unit='slice'; else if(raw.startsWith('дольк')) unit='wedge';
  return {amount,unit};
};
const portionMatch=(name,unit)=>{const key=normalize(name);return portionAliases.find(item=>item.row.unit_code===unit&&item.alias===key)?.row||portionAliases.find(item=>item.row.unit_code===unit&&key.length>=4&&item.alias.length>=4&&(key.includes(item.alias)||item.alias.includes(key)))?.row||null;};

const failures={duplicateIds:[],shortSteps:[],duplicateSteps:[],withoutStepTimings:[],gramsInsideSteps:[],ingredientsWithoutAmount:[],missingTime:[]};
const unknownNutrition=new Map();
const unresolvedNutritionRecipes=[];
const ids=new Set();
const countryCounts={};
for(const recipe of recipes){
  countryCounts[recipe.country]=(countryCounts[recipe.country]||0)+1;
  if(ids.has(recipe.id)) failures.duplicateIds.push(recipe.id); else ids.add(recipe.id);
  const steps=Array.isArray(recipe.steps)?recipe.steps.filter(Boolean):[];
  if(steps.length<5) failures.shortSteps.push({id:recipe.id,title:recipe.title,count:steps.length});
  const seen=new Set();
  for(const step of steps){const key=normalize(step);if(seen.has(key)) failures.duplicateSteps.push({id:recipe.id,step});else seen.add(key);}
  if(!steps.some(step=>timePattern.test(step))) failures.withoutStepTimings.push({id:recipe.id,title:recipe.title});
  if(steps.some(step=>gramInStep.test(step))) failures.gramsInsideSteps.push(recipe.id);
  const missing=(recipe.ingredients||[]).filter(line=>!amountPattern.test(line)&&!optionalAmount.test(line));
  if(missing.length) failures.ingredientsWithoutAmount.push({id:recipe.id,title:recipe.title,ingredients:missing});
  for(const line of recipe.ingredients||[]){
    const name=ingredientName(line);
    if(!nonFoodIngredient.test(name)&&!nutritionMatch(name)) unknownNutrition.set(normalize(name),name);
  }
  const measurable=(recipe.ingredients||[]).filter(line=>!nonFoodIngredient.test(ingredientName(line))).map(line=>({line,amount:parseNutritionAmount(line)})).filter(item=>item.amount);
  const resolved=measurable.filter(item=>{const name=ingredientName(item.line); if(!nutritionMatch(name)) return false; if(item.amount.unit==='g') return true; return Boolean(portionMatch(name,item.amount.unit));});
  if(!resolved.length||resolved.length<Math.min(2,measurable.length)||resolved.length/Math.max(1,measurable.length)<.65){
    const unresolved=measurable.filter(item=>!resolved.includes(item)).map(item=>({line:item.line,name:ingredientName(item.line),unit:item.amount.unit,hasNutrition:Boolean(nutritionMatch(ingredientName(item.line))),hasPortion:Boolean(portionMatch(ingredientName(item.line),item.amount.unit))}));
    unresolvedNutritionRecipes.push({id:recipe.id,title:recipe.title,resolved:resolved.length,measurable:measurable.length,unresolved});
  }
  if(!String(recipe.time||'').trim()) failures.missingTime.push(recipe.id);
}

const summary={
  recipes:recipes.length,
  countries:countryCounts,
  shortSteps:failures.shortSteps.length,
  duplicateSteps:failures.duplicateSteps.length,
  withoutStepTimings:failures.withoutStepTimings.length,
  gramsInsideSteps:failures.gramsInsideSteps.length,
  ingredientsWithoutAmount:failures.ingredientsWithoutAmount.length,
  missingTime:failures.missingTime.length
  ,unknownNutritionProducts:unknownNutrition.size,
  autoNutritionRecipes:recipes.length-unresolvedNutritionRecipes.length,
  fallbackNutritionRecipes:unresolvedNutritionRecipes.length
};
console.log(JSON.stringify(summary,null,2));
const requestedId=process.argv.find(value=>value.startsWith('--recipe='))?.slice('--recipe='.length);
if(requestedId){
  const requested=recipes.find(recipe=>String(recipe.id)===requestedId);
  if(!requested) throw new Error(`Рецепт не найден: ${requestedId}`);
  console.log(`\nrecipe ${requestedId}`);
  console.log(JSON.stringify(requested,null,2));
  process.exit(0);
}
if(unknownNutrition.size){console.log(`\nunknownNutritionProducts (${unknownNutrition.size})`);console.log(JSON.stringify([...unknownNutrition.values()].sort((a,b)=>a.localeCompare(b,'ru')).slice(0,250),null,2));}
if(unresolvedNutritionRecipes.length){console.log(`\nfallbackNutritionRecipes (${unresolvedNutritionRecipes.length})`);console.log(JSON.stringify(unresolvedNutritionRecipes.slice(0,50),null,2));}
for(const [name,items] of Object.entries(failures)){
  if(!items.length) continue;
  console.log(`\n${name} (${items.length})`);
  console.log(JSON.stringify(items.slice(0,25),null,2));
}

if(failures.duplicateIds.length||failures.duplicateSteps.length||failures.shortSteps.length||failures.missingTime.length) process.exitCode=1;
