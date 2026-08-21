import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve(import.meta.dirname,'..');
const sandbox={window:{}};
vm.createContext(sandbox);
for(const file of ['food-reference.js','product-portions.js','chef-food-reference.js']){
  vm.runInContext(fs.readFileSync(path.join(root,'js',file),'utf8'),sandbox,{filename:file});
}

const nutrition=sandbox.window.TABLE_BOOK_FOOD_NUTRITION_FALLBACK||[];
const portions=sandbox.window.TABLE_BOOK_PRODUCT_PORTION_FALLBACK||[];
const normalize=value=>String(value||'').toLocaleLowerCase('ru-RU').replace(/ё/g,'е').replace(/[^a-zа-я0-9\s-]/gi,' ').replace(/\s+/g,' ').trim();
const names=row=>[row.canonical_name,...(row.aliases||[])].map(normalize);
const nutritionFor=name=>nutrition.find(row=>names(row).includes(normalize(name)))||nutrition.find(row=>names(row).some(value=>normalize(name).includes(value)||value.includes(normalize(name))));
const gramsFor=(name,unit,amount)=>{
  if(unit==='g') return amount;
  const exact=portions.find(row=>row.unit_code===unit&&names(row).includes(normalize(name)));
  if(!exact) throw new Error(`Нет веса порции: ${name} / ${unit}`);
  return amount*Number(exact.grams);
};
const round=(value,digits=1)=>Number(Number(value).toFixed(digits));

const sharedRiceSteps=[
  'Промойте рис 4–5 раз до почти прозрачной воды и оставьте в сите на 10 минут.',
  'Залейте рис водой, доведите до кипения за 4–5 минут и готовьте под крышкой на минимальном огне 12 минут.',
  'Снимите кастрюлю с огня и выдержите рис под крышкой ещё 10 минут.',
  'Переложите рис в широкую миску, вмешайте кунжутное масло и соль и остудите до тёплого состояния за 10–15 минут.'
];
const rollingSteps=[
  'Положите лист нори блестящей стороной вниз и распределите рис тонким слоем, оставив дальний край свободным примерно на 2 см.',
  'Разложите начинку длинными ровными полосами вдоль ближней трети листа, не перегружая центр.',
  'Приподнимите ближний край коврика, плотно подверните нори вокруг начинки и сверните рулет одним равномерным движением.',
  'Оставьте рулет швом вниз на 2 минуты, затем тонко смажьте кунжутным маслом и посыпьте кунжутом.',
  'Смочите или смажьте нож и нарежьте каждый рулет на 8–10 кусочков.',
  'Подавайте кимпаб в течение 30 минут после нарезки, пока нори остаются упругими.'
];

const templates=[
  {
    id:'account-kimbap-classic-beef',title:'Классический кимпаб с говядиной',finishedWeight:1510,
    ingredients:[
      ['рис японский сухой',300,'g'],['нори',5,'piece'],['говядина постная',250,'g'],['куриное яйцо',3,'piece'],['морковь',120,'g'],['шпинат',150,'g'],['огурец',150,'g'],['данмуджи',120,'g'],['кунжутное масло',20,'milliliter'],['соевый соус',20,'milliliter'],['сахар',8,'g'],['кунжут',8,'g'],['соль',3,'g']
    ],
    steps:[...sharedRiceSteps,
      'Нарежьте говядину поперёк волокон тонкими длинными полосками за 5 минут и смешайте с соевым соусом и сахаром.',
      'Готовьте говядину на хорошо разогретой сковороде 4–5 минут небольшими порциями, пока мясо полностью не изменит цвет; остудите.',
      'Бланшируйте шпинат 30 секунд, сразу охладите в холодной воде и тщательно отожмите.',
      'Нарежьте морковь соломкой и готовьте на среднем огне 2–3 минуты до лёгкой мягкости.',
      'Приготовьте тонкий яичный пласт за 2–3 минуты и после остывания нарежьте длинными полосками.',
      'Нарежьте огурец и данмуджи длинными брусками и разложите все начинки отдельно.',...rollingSteps],
    tips:'Классическая домашняя начинка: говядина, яйцо, шпинат, морковь, огурец и данмуджи. Все компоненты должны остыть до сборки.'
  },
  {
    id:'account-kimbap-vegetable-tofu',title:'Овощной кимпаб с тофу',finishedWeight:1640,
    ingredients:[
      ['рис японский сухой',300,'g'],['нори',5,'piece'],['тофу твёрдый',250,'g'],['морковь',150,'g'],['шпинат',150,'g'],['огурец',150,'g'],['данмуджи',120,'g'],['шиитаке',150,'g'],['кунжутное масло',20,'milliliter'],['соевый соус',25,'milliliter'],['кунжут',8,'g'],['соль',3,'g']
    ],
    steps:[...sharedRiceSteps,
      'Оберните тофу полотенцем, прижмите лёгким грузом на 15 минут и нарежьте длинными брусками.',
      'Смажьте тофу соевым соусом и запекайте при 200 °C 18–20 минут, перевернув один раз в середине приготовления.',
      'Нарежьте шиитаке полосками и готовьте на среднем огне 5–6 минут до испарения влаги.',
      'Бланшируйте шпинат 30 секунд, охладите и тщательно отожмите.',
      'Нарежьте морковь соломкой и готовьте 2–3 минуты, чтобы она осталась слегка хрустящей.',
      'Нарежьте огурец и данмуджи длинными брусками и полностью остудите приготовленные компоненты.',...rollingSteps],
    tips:'Тофу нужно хорошо обсушить: влажная начинка размягчает нори и мешает рулету держать форму.'
  },
  {
    id:'account-kimbap-tuna-egg',title:'Кимпаб с тунцом, яйцом и огурцом',finishedWeight:1450,
    ingredients:[
      ['рис японский сухой',300,'g'],['нори',5,'piece'],['тунец консервированный',240,'g'],['майонез',60,'g'],['куриное яйцо',3,'piece'],['огурец',150,'g'],['морковь',120,'g'],['данмуджи',120,'g'],['кунжутное масло',20,'milliliter'],['кунжут',8,'g'],['соль',3,'g']
    ],
    steps:[...sharedRiceSteps,
      'Переложите тунец в сито, дайте жидкости стечь 10 минут и затем разберите рыбу вилкой.',
      'Смешайте тунца с майонезом 1 минуту до связной, но не жидкой начинки.',
      'Приготовьте тонкий яичный пласт за 2–3 минуты, остудите и нарежьте длинными полосками.',
      'Нарежьте морковь соломкой и готовьте на среднем огне 2–3 минуты.',
      'Удалите из огурца очень влажную семенную сердцевину и нарежьте мякоть длинными брусками.',
      'Нарежьте данмуджи полосками и перед сборкой убедитесь, что все начинки холодные и сухие.',...rollingSteps],
    tips:'Тунец следует тщательно отцедить. Начинка должна держаться на ложке и не выделять жидкость.'
  },
  {
    id:'account-kimbap-spicy-kimchi',title:'Острый кимпаб с кимчи и яйцом',finishedWeight:1510,
    ingredients:[
      ['рис японский сухой',300,'g'],['нори',5,'piece'],['кимчи',250,'g'],['куриное яйцо',3,'piece'],['морковь',120,'g'],['данмуджи',120,'g'],['листья периллы',30,'g'],['кочуджан',30,'g'],['кунжутное масло',20,'milliliter'],['кунжут',8,'g'],['сахар',5,'g'],['соль',3,'g']
    ],
    steps:[...sharedRiceSteps,
      'Откиньте кимчи на сито на 10 минут, слегка отожмите и нарежьте поперёк короткими полосками.',
      'Готовьте кимчи с сахаром на среднем огне 4–5 минут, чтобы ушла лишняя влага, затем полностью остудите.',
      'Смешайте кочуджан с остывшим кимчи 30 секунд и попробуйте начинку до сборки.',
      'Приготовьте тонкий яичный пласт за 2–3 минуты и нарежьте длинными полосками.',
      'Нарежьте морковь соломкой и готовьте 2–3 минуты до лёгкой мягкости.',
      'Промойте листья периллы, тщательно обсушите и удалите жёсткие концы черешков.',
      'Нарежьте данмуджи длинными полосками и разложите все начинки по отдельности.',...rollingSteps],
    tips:'Главное — удалить из кимчи лишний рассол. Иначе рулет разойдётся, а нори быстро размокнут.'
  },
  {
    id:'account-kimbap-spicy-tuna',title:'Острый кимпаб с тунцом',finishedWeight:1430,
    ingredients:[
      ['рис японский сухой',300,'g'],['нори',5,'piece'],['тунец консервированный',240,'g'],['майонез',40,'g'],['кочуджан',40,'g'],['огурец',150,'g'],['морковь',120,'g'],['данмуджи',120,'g'],['листья периллы',30,'g'],['кунжутное масло',20,'milliliter'],['кунжут',8,'g'],['соль',3,'g']
    ],
    steps:[...sharedRiceSteps,
      'Откиньте тунца на сито на 10 минут и дополнительно промокните, если рыба остаётся влажной.',
      'Смешайте тунца, майонез и кочуджан 1 минуту до однородной связной начинки.',
      'Нарежьте морковь соломкой и готовьте на среднем огне 2–3 минуты.',
      'Удалите влажную семенную сердцевину огурца и нарежьте мякоть длинными брусками.',
      'Промойте и тщательно обсушите листья периллы.',
      'Нарежьте данмуджи полосками и охладите все приготовленные компоненты.',...rollingSteps],
    tips:'Остроту регулируйте кочуджаном, а не дополнительным жидким соусом: начинка должна оставаться плотной.'
  },
  {
    id:'account-kimbap-spicy-chicken',title:'Острый кимпаб с курицей',finishedWeight:1580,
    ingredients:[
      ['рис японский сухой',300,'g'],['нори',5,'piece'],['куриная грудка',300,'g'],['кочуджан',45,'g'],['соевый соус',20,'milliliter'],['мёд',15,'g'],['морковь',120,'g'],['шпинат',150,'g'],['данмуджи',120,'g'],['кунжутное масло',20,'milliliter'],['кунжут',8,'g'],['соль',3,'g']
    ],
    steps:[...sharedRiceSteps,
      'Нарежьте куриное филе поперёк волокон длинными полосками толщиной около 1 см.',
      'Смешайте кочуджан, соевый соус и мёд за 1 минуту, добавьте курицу и маринуйте в холодильнике 20 минут.',
      'Переложите курицу вместе с маринадом в форму и запекайте при 200 °C 14–16 минут до полной готовности.',
      'Проверьте, что температура в самой толстой полоске достигла 74 °C, затем остудите курицу 10 минут.',
      'Бланшируйте шпинат 30 секунд, охладите в холодной воде и тщательно отожмите.',
      'Нарежьте морковь соломкой и готовьте 2–3 минуты до лёгкой мягкости.',
      'Нарежьте данмуджи полосками и разложите все полностью остывшие начинки отдельно.',...rollingSteps],
    tips:'Не собирайте рулеты с горячей курицей. Для безопасности птица должна достичь 74 °C в центре.'
  }
];

const ingredientLabel=([name,amount,unit])=>{
  const labels={g:'г',piece:'шт.',milliliter:'мл'};
  return `${name} — ${amount} ${labels[unit]||unit}`;
};

const recipes=templates.map(template=>{
  const rows=template.ingredients.map(([name,amount,unit])=>{
    const reference=nutritionFor(name);
    if(!reference) throw new Error(`Нет КБЖУ: ${name}`);
    const weight=gramsFor(name,unit,amount);
    return {
      name,amount,unit,weight:round(weight,2),gramsPerUnit:round(weight/amount,2),
      kcal:reference.kcal,protein:reference.protein,fat:reference.fat,carbs:reference.carbs,
      fdcId:reference.fdc_id,nutritionAuto:true,nutritionSource:reference.source_name,ingredientLinked:true
    };
  });
  const total=rows.reduce((sum,row)=>{
    const factor=row.weight/100;
    sum.kcal+=row.kcal*factor; sum.protein+=row.protein*factor; sum.fat+=row.fat*factor; sum.carbs+=row.carbs*factor;
    return sum;
  },{kcal:0,protein:0,fat:0,carbs:0});
  const perServing=Object.fromEntries(Object.entries(total).map(([key,value])=>[key,round(value/4)]));
  const per100=Object.fromEntries(Object.entries(total).map(([key,value])=>[key,round(value/template.finishedWeight*100)]));
  const nutritionTotal=Object.fromEntries(Object.entries(total).map(([key,value])=>[key,round(value)]));
  const now='2026-08-21T00:00:00.000Z';
  return {
    id:template.id,title:template.title,country:'Корея',category:'Закуски',source:'custom',origin:'Корейская кухня · кимпаб',
    time:'1 ч 10 мин',prepTime:'45 мин',cookTime:'25 мин',totalTime:'1 ч 10 мин',servings:4,difficulty:'средне',
    ingredients:template.ingredients.map(ingredientLabel),extraIngredients:template.ingredients.map(ingredientLabel),steps:template.steps,tips:template.tips,
    historyNote:'Кимпаб — самостоятельное корейское блюдо: рис приправляют кунжутным маслом, начинки готовят отдельно и сворачивают в листы ким.',
    recipeSources:[{label:'Korea.net · Gimbap',url:'https://www.korea.net/Events/Overseas/view?articleId=11880'}],
    nutrition:perServing,nutrition100:per100,nutritionTotal,ingredientNutrition:rows,
    ingredientWeight:round(rows.reduce((sum,row)=>sum+row.weight,0)),weight:template.finishedWeight,estimatedWeight:template.finishedWeight,weightEstimated:true,
    savedAt:now,updatedAt:now,revision:'2026-08-21-kimbap-v1'
  };
});

console.log(JSON.stringify(recipes));
