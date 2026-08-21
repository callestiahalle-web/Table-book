import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve(import.meta.dirname,'..');
const sandbox={window:{}};
vm.createContext(sandbox);
for(const file of ['food-reference.js','product-portions.js','chef-food-reference.js']){
  vm.runInContext(fs.readFileSync(path.join(root,'js',file),'utf8'),sandbox,{filename:file});
}

const quote=value=>`'${String(value??'').replaceAll("'","''")}'`;
const array=values=>`array[${(Array.isArray(values)?values:[]).map(quote).join(',')}]::text[]`;
const number=value=>Number.isFinite(Number(value))?String(Number(value)):'0';
const nullableNumber=value=>Number.isFinite(Number(value))&&Number(value)!==0?String(Number(value)):'null';

const nutrition=sandbox.window.TABLE_BOOK_FOOD_NUTRITION_FALLBACK||[];
const portions=sandbox.window.TABLE_BOOK_PRODUCT_PORTION_FALLBACK||[];

const nutritionValues=nutrition.map(row=>`  (${[
  quote(row.canonical_name),array(row.aliases),number(row.kcal),number(row.protein),number(row.fat),number(row.carbs),nullableNumber(row.fdc_id),
  quote(row.data_type),quote(row.dataset_release),quote(row.source_name),quote(row.source_url)
].join(',')})`).join(',\n');
const portionValues=portions.map((row,index)=>`  (${[
  quote(row.canonical_name),array(row.aliases),quote(row.unit_code),quote(row.unit_label),number(row.grams),quote(row.note),number((index+1)*10)
].join(',')})`).join(',\n');

console.log(`insert into public.food_nutrition_reference
  (canonical_name,aliases,kcal,protein,fat,carbs,fdc_id,data_type,dataset_release,source_name,source_url)
values
${nutritionValues}
on conflict (canonical_name) do update set
  aliases=excluded.aliases,kcal=excluded.kcal,protein=excluded.protein,fat=excluded.fat,
  carbs=excluded.carbs,fdc_id=excluded.fdc_id,data_type=excluded.data_type,
  dataset_release=excluded.dataset_release,source_name=excluded.source_name,
  source_url=excluded.source_url,updated_at=now();

insert into public.product_portion_weights
  (canonical_name,aliases,unit_code,unit_label,grams,note,sort_order)
values
${portionValues}
on conflict (canonical_name,unit_code) do update set
  aliases=excluded.aliases,unit_label=excluded.unit_label,grams=excluded.grams,
  note=excluded.note,sort_order=excluded.sort_order,updated_at=now();`);
