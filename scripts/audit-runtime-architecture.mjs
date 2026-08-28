import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve(import.meta.dirname,'..');
const catalogPath=path.join(root,'js','recipe-catalog.js');
const searchPath=path.join(root,'data','recipe-search-index.json');
const detailsDir=path.join(root,'data','recipes');
const appPath=path.join(root,'js','app.js');

const sandbox={window:{}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(catalogPath,'utf8'),sandbox,{filename:'recipe-catalog.js'});
const recipes=sandbox.window.TABLE_BOOK_RECIPES||[];
if(!recipes.length) throw new Error('Recipe catalog is empty');

const searchIndex=JSON.parse(fs.readFileSync(searchPath,'utf8'));
const ids=new Set();
for(const recipe of recipes){
  if(!recipe?.id) throw new Error('Catalog entry without an ID');
  if(ids.has(recipe.id)) throw new Error(`Duplicate catalog ID: ${recipe.id}`);
  ids.add(recipe.id);
  if(Object.hasOwn(recipe,'ingredients')||Object.hasOwn(recipe,'steps')){
    throw new Error(`${recipe.id}: heavy recipe fields leaked into the startup catalog`);
  }
  if(!recipe.ingredientGroup) throw new Error(`${recipe.id}: ingredient group is missing from the catalog summary`);
  if(!Array.isArray(searchIndex[recipe.id])) throw new Error(`${recipe.id}: search index entry is missing`);

  const detail=JSON.parse(fs.readFileSync(path.join(detailsDir,`${recipe.id}.json`),'utf8'));
  if(detail.id!==recipe.id) throw new Error(`${recipe.id}: detail file contains another recipe ID`);
  if(!Array.isArray(detail.ingredients)||!detail.ingredients.length) throw new Error(`${recipe.id}: lazy detail has no ingredients`);
  if(!Array.isArray(detail.steps)||!detail.steps.length) throw new Error(`${recipe.id}: lazy detail has no preparation steps`);
}

const extraSearchIds=Object.keys(searchIndex).filter(id=>!ids.has(id));
if(extraSearchIds.length) throw new Error(`Search index contains unknown recipes: ${extraSearchIds.join(', ')}`);

const appSource=fs.readFileSync(appPath,'utf8');
for(const required of [
  'const CLOUD_USER_RECIPE_TABLE="user_recipes"',
  'async function ensureRecipeSearchIndex()',
  'async function ensureWeekRecipeDetails(',
  'async function saveUserRecipeToCloud(',
  'async function loadUserRecipesFromCloud()',
  "onAuthStateChange(callback)"
]){
  if(!appSource.includes(required)) throw new Error(`Runtime optimization is missing: ${required}`);
}
if(/my_recipes\s*:\s*snap\.myRecipes/u.test(appSource)){
  throw new Error('The full personal recipe library is still written into user_app_state');
}

const catalogBytes=fs.statSync(catalogPath).size;
const searchBytes=fs.statSync(searchPath).size;
if(catalogBytes>160_000) throw new Error(`Startup catalog grew to ${catalogBytes} bytes`);

console.log(JSON.stringify({
  recipes:recipes.length,
  catalogBytes,
  lazySearchIndexBytes:searchBytes,
  lazyDetailFiles:recipes.length,
  normalizedUserRecipeStorage:true
},null,2));
console.log('OK: startup catalog is lightweight; recipe ingredients, steps and search data are loaded only for the active feature.');
