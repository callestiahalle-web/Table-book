import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../js/food-reference.js',import.meta.url),'utf8');
const context={window:{}};
vm.createContext(context);
vm.runInContext(source,context,{filename:'food-reference.js'});

const rows=context.window.TABLE_BOOK_FOOD_NUTRITION_FALLBACK;
if(!Array.isArray(rows)) throw new Error('Food nutrition fallback was not exported');
if(rows.length!==81) throw new Error(`Expected 81 nutrition reference products, received ${rows.length}`);

const names=new Set(rows.map(row=>row.canonical_name));
const fdcIds=new Set(rows.map(row=>row.fdc_id));
if(names.size!==rows.length) throw new Error('Duplicate canonical nutrition product names found');
if(fdcIds.size!==rows.length||fdcIds.has(null)||fdcIds.has(undefined)) throw new Error('Every nutrition product must have a unique FoodData Central ID');

const setupSql=fs.readFileSync(new URL('../supabase_setup.sql',import.meta.url),'utf8');
const seedStart=setupSql.lastIndexOf('insert into public.food_nutrition_reference');
const seedEnd=setupSql.indexOf('on conflict (canonical_name)',seedStart);
if(seedStart<0||seedEnd<0) throw new Error('Supabase nutrition seed section was not found');
const seededNames=[...setupSql.slice(seedStart,seedEnd).matchAll(/^\s*\('((?:''|[^'])+)'/gmu)]
  .map(match=>match[1].replaceAll("''","'"));
if(seededNames.length!==rows.length||new Set(seededNames).size!==rows.length) throw new Error('Supabase nutrition seed must contain the same number of unique products as the web fallback');
for(const name of names) if(!seededNames.includes(name)) throw new Error(`Supabase nutrition seed is missing: ${name}`);

const required={
  'подсолнечное масло':{kcal:884,protein:0,fat:100,carbs:0,fdc_id:171017},
  'сливочное масло':{kcal:717,protein:.85,fat:81.11,carbs:.06,fdc_id:173410},
  'сахар':{kcal:387,protein:0,fat:0,carbs:100,fdc_id:169655},
  'соль':{kcal:0,protein:0,fat:0,carbs:0,fdc_id:173468}
};
for(const [name,expected] of Object.entries(required)){
  const actual=rows.find(row=>row.canonical_name===name);
  if(!actual) throw new Error(`Required nutrition product is missing: ${name}`);
  for(const [field,value] of Object.entries(expected)){
    if(Number(actual[field])!==value) throw new Error(`${name}: expected ${field}=${value}, received ${actual[field]}`);
  }
}

console.log(`OK: ${rows.length} unique FoodData Central products; oils, butter, sugar and salt are covered.`);
