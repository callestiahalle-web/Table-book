import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve(import.meta.dirname,'..');
const sandbox={window:{},console,structuredClone:globalThis.structuredClone};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'js','recipe-catalog.js'),'utf8'),sandbox,{filename:'recipe-catalog.js'});
const recipes=(sandbox.window.TABLE_BOOK_RECIPES||[]).map(recipe=>Object.assign(
  {},
  recipe,
  JSON.parse(fs.readFileSync(path.join(root,'data','recipes',`${recipe.id}.json`),'utf8'))
));
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
