import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve(import.meta.dirname,'..');
const appSource=fs.readFileSync(path.join(root,'js','app.js'),'utf8');
const start=appSource.indexOf('const recipes = ');
const end=appSource.indexOf('\n];',start);
if(start<0||end<0) throw new Error('Не удалось найти каталог recipes в app.js');
const json=appSource.slice(start+'const recipes = '.length,end+2);
const recipes=JSON.parse(json);

const sandbox={window:{},console,structuredClone:globalThis.structuredClone};
vm.createContext(sandbox);
const modifierFiles=[
  'recipe-quality.js','caucasus-recipes.js','detailed-recipes.js','mediterranean-recipes.js',
  'thai-recipes.js','japanese-recipes.js','korean-recipes.js','russian-recipes.js','sous-vide-recipes.js'
];
modifierFiles.forEach(file=>vm.runInContext(fs.readFileSync(path.join(root,'js',file),'utf8'),sandbox,{filename:file}));
[
  'TABLE_BOOK_RECIPE_QUALITY','TABLE_BOOK_CAUCASUS_RECIPES','TABLE_BOOK_DETAILED_RECIPES',
  'TABLE_BOOK_MEDITERRANEAN_RECIPES','TABLE_BOOK_THAI_RECIPES','TABLE_BOOK_JAPANESE_RECIPES',
  'TABLE_BOOK_KOREAN_RECIPES','TABLE_BOOK_RUSSIAN_RECIPES','TABLE_BOOK_SOUS_VIDE_RECIPES'
].forEach(key=>sandbox.window[key]?.apply?.(recipes));
vm.runInContext(fs.readFileSync(path.join(root,'js','product-tags.js'),'utf8'),sandbox,{filename:'product-tags.js'});
const tags=sandbox.window.TABLE_BOOK_PRODUCT_TAGS;
if(!tags) throw new Error('Справочник продуктовых тегов не загрузился');

const ids=new Set();
const duplicateIds=[];
const withoutIngredients=[];
const withoutTags=[];
recipes.forEach(recipe=>{
  if(ids.has(recipe.id)) duplicateIds.push(recipe.id); else ids.add(recipe.id);
  if(!Array.isArray(recipe.ingredients)||!recipe.ingredients.length) withoutIngredients.push(recipe.id);
  if(!tags.tagsForRecipe(recipe).length) withoutTags.push(recipe.id);
});

const queryCaseErrors=tags.availableTags.filter(tag=>tags.resolve(tag.toUpperCase())!==tag);
const chickenFalsePositives=recipes.filter(recipe=>tags.recipeMatches(recipe,['курица']).all && !/(куриц|цыпл|курин)/iu.test((recipe.ingredients||[]).join(' ')));
const salmonFalsePositives=recipes.filter(recipe=>tags.recipeMatches(recipe,['лосось']).all && !/(лосос|с[её]мг)/iu.test((recipe.ingredients||[]).join(' ')));
const failures={duplicateIds,withoutIngredients,withoutTags,queryCaseErrors,chickenFalsePositives:chickenFalsePositives.map(r=>r.id),salmonFalsePositives:salmonFalsePositives.map(r=>r.id)};
const failed=Object.values(failures).some(items=>items.length);

console.log(`Проверено рецептов: ${recipes.length}`);
console.log(`Нормализованных продуктовых тегов: ${tags.availableTags.length}`);
console.log(`Курица: ${recipes.filter(r=>tags.recipeMatches(r,['курица']).all).length}; лосось: ${recipes.filter(r=>tags.recipeMatches(r,['лосось']).all).length}`);
if(failed){console.error(JSON.stringify(failures,null,2));process.exitCode=1;}
else console.log('Аудит тегов пройден: дубликатов идентификаторов и ложных совпадений курица/лосось нет.');
