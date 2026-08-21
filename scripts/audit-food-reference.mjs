import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../js/food-reference.js',import.meta.url),'utf8');
const context={window:{}};
vm.createContext(context);
vm.runInContext(source,context,{filename:'food-reference.js'});

const rows=context.window.TABLE_BOOK_FOOD_NUTRITION_FALLBACK;
if(!Array.isArray(rows)) throw new Error('Food nutrition fallback was not exported');
if(rows.length<91) throw new Error(`Expected at least 91 nutrition reference products, received ${rows.length}`);

const names=new Set(rows.map(row=>row.canonical_name));
const fdcIds=new Set(rows.map(row=>row.fdc_id));
if(names.size!==rows.length) throw new Error('Duplicate canonical nutrition product names found');
if(fdcIds.size!==rows.length||fdcIds.has(0)||fdcIds.has(null)||fdcIds.has(undefined)) throw new Error('Every nutrition product must have a unique non-zero reference ID');

const normalize=value=>String(value||'').normalize('NFKC').toLocaleLowerCase('ru-RU').replace(/ё/g,'е').replace(/[«»"'`]/g,'').replace(/[.,:;()]/g,' ').replace(/\s+/g,' ').trim();
const aliases=new Map();
for(const row of rows){
  for(const value of [row.canonical_name,...(Array.isArray(row.aliases)?row.aliases:[])]){
    const key=normalize(value);
    const owner=aliases.get(key);
    if(owner&&owner!==row.canonical_name) throw new Error(`Ambiguous nutrition alias "${value}": ${owner} / ${row.canonical_name}`);
    aliases.set(key,row.canonical_name);
  }
}

const setupSql=fs.readFileSync(new URL('../supabase_setup.sql',import.meta.url),'utf8');
const seedBlocks=[...setupSql.matchAll(/insert into public\.food_nutrition_reference[\s\S]*?values([\s\S]*?)on conflict \(canonical_name\)/gimu)];
if(!seedBlocks.length) throw new Error('Supabase nutrition seed section was not found');
const seededNames=seedBlocks.flatMap(block=>[...block[1].matchAll(/^\s*\('((?:''|[^'])+)'/gmu)].map(match=>match[1].replaceAll("''","'")));
if(seededNames.length!==rows.length||new Set(seededNames).size!==rows.length) throw new Error('Supabase nutrition seed must contain the same number of unique products as the web fallback');
for(const name of names) if(!seededNames.includes(name)) throw new Error(`Supabase nutrition seed is missing: ${name}`);

const required={
  'подсолнечное масло':{kcal:884,protein:0,fat:100,carbs:0,fdc_id:171017},
  'сливочное масло':{kcal:717,protein:.85,fat:81.11,carbs:.06,fdc_id:173410},
  'сахар':{kcal:387,protein:0,fat:0,carbs:100,fdc_id:169655},
  'соль':{kcal:0,protein:0,fat:0,carbs:0,fdc_id:173468},
  'вода':{kcal:0,protein:0,fat:0,carbs:0,fdc_id:-1001},
  'грейпфрут':{kcal:42,protein:.77,fat:.14,carbs:10.66,fdc_id:-1002},
  'рисовая лапша сухая':{kcal:364,protein:5.95,fat:.56,carbs:80.18,fdc_id:169742},
  'фарш минтая':{kcal:70,protein:15.9,fat:.9,carbs:0,fdc_id:-1003},
  'угорь унаги в соусе':{kcal:281.4,protein:16.4,fat:29.4,carbs:1.8,fdc_id:-1004},
  'San Carlo Classica':{kcal:502,protein:6.3,fat:27,carbs:56.3,fdc_id:-1005},
  'San Carlo Lime & Pink Pepper':{kcal:493,protein:6.7,fat:26,carbs:56,fdc_id:-1006},
  'San Carlo томат':{kcal:480,protein:6.9,fat:23,carbs:59,fdc_id:-1007}
};
for(const [name,expected] of Object.entries(required)){
  const actual=rows.find(row=>row.canonical_name===name);
  if(!actual) throw new Error(`Required nutrition product is missing: ${name}`);
  for(const [field,value] of Object.entries(expected)){
    if(Number(actual[field])!==value) throw new Error(`${name}: expected ${field}=${value}, received ${actual[field]}`);
  }
}

console.log(`OK: ${rows.length} unique nutrition products and aliases; web fallback and Supabase seed match.`);
