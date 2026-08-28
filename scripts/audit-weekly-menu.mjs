import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('./fixtures/weekly-menu-2026-08.js',import.meta.url),'utf8');
const context={window:{}};
vm.createContext(context);
vm.runInContext(source,context,{filename:'weekly-menu-2026-08.js'});

const data=context.window.TABLE_BOOK_WEEKLY_MENU_20260819;
if(!data) throw new Error('Weekly menu payload was not exported');

const expectedDates=['2026-08-19','2026-08-20','2026-08-21','2026-08-22','2026-08-23','2026-08-24','2026-08-25'];
const actualDates=Object.keys(data.mealPlan).sort();
if(JSON.stringify(actualDates)!==JSON.stringify(expectedDates)) throw new Error(`Expected exactly ${expectedDates.join(', ')}, received ${actualDates.join(', ')}`);

const recipes=new Map(data.recipes.map(recipe=>[recipe.id,recipe]));
if(recipes.size!==data.recipes.length) throw new Error('Duplicate weekly recipe IDs found');
if(recipes.size!==44) throw new Error(`Expected 44 normalized recipe cards, received ${recipes.size}`);
for(const duplicateId of ['week-20260824-lunch-turkey-container','week-20260825-lunch-chicken-container']){
  if(recipes.has(duplicateId)) throw new Error(`Duplicate container recipe is still exported: ${duplicateId}`);
}
for(const replacedId of ['week-20260819-breakfast-nordic','week-snack-savushkin-grapefruit','week-snack-savushkin-orange','week-20260820-breakfast-nordic-egg','week-breakfast-nordic-water-egg','week-20260823-breakfast-last-nordic','week-20260824-breakfast-oatmeal','week-20260825-breakfast-oatmeal']){
  if(recipes.has(replacedId)) throw new Error(`Composite duplicate is still exported: ${replacedId}`);
}
for(const obsoleteId of [
  'week-chip-san-carlo-tomato-25',
  'week-chip-san-carlo-tomato-20',
  'week-chip-san-carlo-classica-15',
  'week-chip-san-carlo-classica-25',
  'week-chip-san-carlo-lime-25',
  'week-chip-san-carlo-any-25',
  'week-fruit-grapefruit-small'
]){
  if(recipes.has(obsoleteId)) throw new Error(`Obsolete duplicate is still exported: ${obsoleteId}`);
}
const titleKeys=new Set();
for(const recipe of recipes.values()){
  if(/контейнер|container/iu.test(`${recipe.id} ${recipe.title}`)) throw new Error(`Container copy still exists as a recipe: ${recipe.id}`);
  const titleKey=String(recipe.title||'').normalize('NFKC').trim().toLocaleLowerCase('ru-RU').replace(/\s+/g,' ');
  if(titleKeys.has(titleKey)) throw new Error(`Duplicate recipe title remains: ${recipe.title}`);
  titleKeys.add(titleKey);
}
if([...recipes.values()].filter(recipe=>recipe.category==='Фрукты').length!==24) throw new Error('Expected twenty-four unique fruit and berry cards in the Fruits category');

const expectedChipIds=[
  'week-chip-san-carlo-classic',
  'week-chip-san-carlo-lime-pepper',
  'week-chip-san-carlo-tomato'
];
const chips=[...recipes.values()]
  .filter(recipe=>recipe.id.startsWith('week-chip-san-carlo-'))
  .sort((a,b)=>a.id.localeCompare(b.id));
if(JSON.stringify(chips.map(recipe=>recipe.id))!==JSON.stringify(expectedChipIds)) throw new Error('Expected exactly the three canonical San Carlo chip cards');
for(const chip of chips){
  if(/\b\d+(?:[.,]\d+)?\s*г(?=\s|[,.!;:]|$)/iu.test(chip.title)) throw new Error(`${chip.id}: portion must not be present in the title`);
  if(chip.ingredientNutrition?.length!==1||Number(chip.ingredientNutrition[0]?.weight)!==25) throw new Error(`${chip.id}: standard portion must be 25 g`);
  if(!chip.ingredients.some(value=>/—\s*25\s*г(?=\s|[,.!;:]|$)/iu.test(value))) throw new Error(`${chip.id}: ingredient list must contain the 25 g portion`);
}

const requiredSlots=['breakfast','lunch','snack','dinner','extraSnack'];
const chipDates=new Set(['2026-08-19','2026-08-20','2026-08-21','2026-08-22','2026-08-23','2026-08-25']);
const report=[];

for(const date of expectedDates){
  const day=data.mealPlan[date];
  for(const slot of requiredSlots){
    if(!Array.isArray(day[slot])) throw new Error(`${date}: slot ${slot} is missing`);
    if(slot!=='extraSnack' && day[slot].length<1) throw new Error(`${date}: slot ${slot} must contain at least one recipe`);
  }
  if(day.extraSnack.length!==(chipDates.has(date)?1:0)) throw new Error(`${date}: chips placement does not match the plan`);
  let kcal=0,protein=0,fat=0,carbs=0;
  for(const slot of requiredSlots){
    for(const ref of day[slot]){
      if(ref.source!=='custom') throw new Error(`${date}: recipe ${ref.id} must resolve from My Recipes`);
      const recipe=recipes.get(ref.id);
      if(!recipe) throw new Error(`${date}: recipe ${ref.id} is missing`);
      for(const field of ['title','prepTime','cookTime','totalTime','servings','nutrition']) if(!recipe[field]) throw new Error(`${recipe.id}: ${field} is missing`);
      if(!Array.isArray(recipe.ingredients)||!recipe.ingredients.length) throw new Error(`${recipe.id}: ingredients are missing`);
      if(!Array.isArray(recipe.steps)||!recipe.steps.length) throw new Error(`${recipe.id}: steps are missing`);
      const instructionalText=[...(recipe.steps||[]),recipe.tips||'',recipe.batchLabel||''];
      const fixedAmount=instructionalText.find(value=>/(?:^|\s)\d+(?:[.,]\d+)?\s*(?:г|кг|мл|л|шт\.?)(?=\s|[,.!;:]|$)/iu.test(value));
      if(fixedAmount) throw new Error(`${recipe.id}: fixed ingredient quantity remains outside the ingredient list: ${fixedAmount}`);
      kcal+=Number(recipe.nutrition.kcal)||0;
      protein+=Number(recipe.nutrition.protein)||0;
      fat+=Number(recipe.nutrition.fat)||0;
      carbs+=Number(recipe.nutrition.carbs)||0;
    }
  }
  report.push({
    date,
    kcal:Math.round(kcal),
    protein:Math.round(protein*10)/10,
    fat:Math.round(fat*10)/10,
    carbs:Math.round(carbs*10)/10,
    target:kcal>=1500&&kcal<=1600,
    acceptable:kcal>=1450&&kcal<=1700
  });
}

const assertText=(id,pattern,message)=>{
  const recipe=recipes.get(id);
  const text=[...(recipe?.ingredients||[]),...(recipe?.steps||[]),recipe?.tips||'',recipe?.batchLabel||''].join(' ');
  if(!pattern.test(text)) throw new Error(message);
};
assertText('week-20260819-lunch-unagi-bowl',/угорь унаги в соусе — 100 г/,'19 August lunch must use 100 g unagi');
assertText('week-20260819-dinner-unagi-kimbap',/оставшийся угорь унаги — 100 г/,'19 August dinner must use remaining 100 g unagi');
assertText('week-20260821-dinner-pollock-batch',/фарш минтая \(на всю партию\) — 400 г/,'21 August must cook the full 400 g pollock pack');
assertText('week-20260822-lunch-rice-noodles-pollock',/1\/2 партии, приготовленной 21 августа/,'22 August must use the remaining pollock half');
assertText('week-20260823-dinner-turkey-batch',/Готовим сразу 2 порции: ужин \+ обед на работу/,'23 August must prepare Monday work lunch');
assertText('week-20260824-dinner-chicken-bowl-batch',/Готовим сразу 2 порции: ужин \+ обед на работу/,'24 August must prepare Tuesday work lunch');
assertText('week-20260825-dinner-pollock-batch',/фарш минтая \(на всю партию\) — 400 г/,'25 August must open the second 400 g pollock pack');
assertText('week-20260825-dinner-pollock-batch',/использовать 26 августа или заморозить/,'25 August must preserve the leftover note');

const mondayLunch=data.mealPlan['2026-08-24'].lunch[0];
if(mondayLunch.id!=='week-20260823-dinner-turkey-batch'||!mondayLunch.skipShopping||!mondayLunch.workday) throw new Error('24 August lunch must reuse the Sunday batch without duplicating shopping');
const tuesdayLunch=data.mealPlan['2026-08-25'].lunch[0];
if(tuesdayLunch.id!=='week-20260824-dinner-chicken-bowl-batch'||!tuesdayLunch.skipShopping||!tuesdayLunch.workday) throw new Error('25 August lunch must reuse the Monday batch without duplicating shopping');

console.table(report);
const outsideSafetyRange=report.filter(day=>!day.acceptable);
if(outsideSafetyRange.length){
  throw new Error(`Daily energy is outside the 1450–1700 kcal safety range: ${outsideSafetyRange.map(day=>`${day.date} (${day.kcal} kcal)`).join(', ')}`);
}
const targetDays=report.filter(day=>day.target).length;
console.log(`OK: ${actualDates.length} days, ${data.recipes.length} unique recipe cards, every day is within the 1450–1700 kcal validation range.`);
console.log(`NOTICE: ${targetDays}/7 days are within the narrower 1500–1600 kcal guide; the remaining days stay within the allowed validation tolerance.`);
