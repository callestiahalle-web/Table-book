import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const parseScript=file=>JSON.parse(execFileSync(process.execPath,[fileURLToPath(new URL(file,import.meta.url))],{encoding:'utf8'}));
const review=parseScript('./build-personal-recipe-review.mjs');
const kimbaps=parseScript('./build-account-kimbaps.mjs');
const recipes=[...review.fixtureRecipes,...review.manualPatches.map(({_merge,...recipe})=>recipe),...kimbaps];

if(recipes.length!==56) throw new Error(`Expected 56 reviewed personal recipes, received ${recipes.length}`);
const ids=new Set(),titles=new Set();
const fixedMeasure=/(?:^|\s)\d+(?:[.,]\d+)?\s*(?:г|кг|мл|л|шт\.?)(?=\s|[,.!;:]|$)/iu;
for(const recipe of recipes){
  if(ids.has(recipe.id)) throw new Error(`Duplicate recipe id: ${recipe.id}`);
  ids.add(recipe.id);
  const title=String(recipe.title||'').normalize('NFKC').trim().toLocaleLowerCase('ru-RU');
  if(titles.has(title)) throw new Error(`Duplicate recipe title: ${recipe.title}`);
  titles.add(title);
  if(!Array.isArray(recipe.ingredients)||!recipe.ingredients.length) throw new Error(`${recipe.id}: ingredients are missing`);
  const malformedIngredient=recipe.ingredients.find(ingredient=>!String(ingredient).includes('—'));
  if(malformedIngredient) throw new Error(`${recipe.id}: ingredient must use the «product — amount» format: ${malformedIngredient}`);
  if(!Array.isArray(recipe.steps)||recipe.steps.length<2) throw new Error(`${recipe.id}: detailed steps are missing`);
  const measured=recipe.steps.find(step=>fixedMeasure.test(step));
  if(measured) throw new Error(`${recipe.id}: ingredient amount remains in a step: ${measured}`);
  if(!recipe.prepTime||!recipe.cookTime||!recipe.totalTime) throw new Error(`${recipe.id}: timing fields are incomplete`);
  if(!recipe.nutrition||!Number.isFinite(Number(recipe.nutrition.kcal))) throw new Error(`${recipe.id}: nutrition is missing`);
}

const fruitCount=recipes.filter(recipe=>recipe.category==='Фрукты').length;
if(fruitCount!==24) throw new Error(`Expected 24 fruit and berry cards, received ${fruitCount}`);
for(const title of ['Унадон — рис с угрём','Домашний омлет с молоком','Овощное рагу по-домашнему','Абрикос','Арбуз','Чёрная смородина','Клюква']){
  if(!titles.has(title.toLocaleLowerCase('ru-RU'))) throw new Error(`Reviewed recipe is missing: ${title}`);
}

console.log(`OK: ${recipes.length} unique reviewed personal recipes; ${fruitCount} fruit and berry cards; all ingredients use the «product — amount» format; no ingredient gram or milliliter quantities remain in preparation steps.`);
