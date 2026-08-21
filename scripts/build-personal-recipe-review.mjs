import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve(import.meta.dirname,'..');
const sandbox={window:{}};
vm.createContext(sandbox);
for(const file of ['food-reference.js','product-portions.js','chef-food-reference.js']){
  vm.runInContext(fs.readFileSync(path.join(root,'js',file),'utf8'),sandbox,{filename:file});
}
vm.runInContext(fs.readFileSync(path.join(root,'scripts','fixtures','weekly-menu-2026-08.js'),'utf8'),sandbox,{filename:'weekly-menu-2026-08.js'});

const nutrition=sandbox.window.TABLE_BOOK_FOOD_NUTRITION_FALLBACK||[];
const portions=sandbox.window.TABLE_BOOK_PRODUCT_PORTION_FALLBACK||[];
const weekly=sandbox.window.TABLE_BOOK_WEEKLY_MENU_20260819;
if(!weekly) throw new Error('Weekly menu fixture was not exported');

const normalize=value=>String(value||'').toLocaleLowerCase('ru-RU').replace(/ё/g,'е').replace(/[^a-zа-я0-9\s-]/gi,' ').replace(/\s+/g,' ').trim();
const names=row=>[row.canonical_name,...(row.aliases||[])].map(normalize);
const nutritionFor=name=>nutrition.find(row=>names(row).includes(normalize(name)))||nutrition.find(row=>names(row).some(value=>normalize(name).includes(value)||value.includes(normalize(name))));
const portionFor=(name,unit)=>portions.find(row=>row.unit_code===unit&&names(row).includes(normalize(name)));
const round=(value,digits=1)=>Number(Number(value).toFixed(digits));
const unitLabels={g:'г',piece:'шт.',milliliter:'мл',tablespoon:'ст. л.',teaspoon:'ч. л.',slice:'ломтик'};

function ingredientRow(spec){
  if(spec.includeNutrition===false) return null;
  const reference=spec.values||nutritionFor(spec.referenceName||spec.name);
  if(!reference) throw new Error(`Нет КБЖУ: ${spec.name}`);
  const amount=Number(spec.amount);
  const unit=spec.unit||'g';
  const portion=unit==='g'?null:portionFor(spec.referenceName||spec.name,unit);
  const weight=unit==='g'?amount:amount*Number(portion?.grams||spec.gramsPerUnit||0);
  if(!(weight>=0)) throw new Error(`Нет веса порции: ${spec.name} / ${unit}`);
  return {
    name:spec.name,amount,unit,weight:round(weight,2),gramsPerUnit:round(amount?weight/amount:0,2),
    kcal:Number(reference.kcal)||0,protein:Number(reference.protein)||0,fat:Number(reference.fat)||0,carbs:Number(reference.carbs)||0,
    fdcId:reference.fdc_id??null,nutritionAuto:!spec.values,nutritionSource:reference.source_name||spec.source||'Справочное значение',ingredientLinked:true
  };
}

const ingredientLabel=spec=>spec.label||`${spec.name} — ${spec.amount} ${unitLabels[spec.unit||'g']||spec.unit}`;
function manualRecipe(value){
  const rows=value.products.map(ingredientRow).filter(Boolean);
  const total=rows.reduce((sum,row)=>{
    const factor=row.weight/100;
    sum.kcal+=row.kcal*factor;sum.protein+=row.protein*factor;sum.fat+=row.fat*factor;sum.carbs+=row.carbs*factor;
    return sum;
  },{kcal:0,protein:0,fat:0,carbs:0});
  const nutritionTotal=Object.fromEntries(Object.entries(total).map(([key,number])=>[key,round(number)]));
  const nutritionPerServing=Object.fromEntries(Object.entries(total).map(([key,number])=>[key,round(number/value.servings)]));
  const nutrition100=Object.fromEntries(Object.entries(total).map(([key,number])=>[key,round(number/value.finishedWeight*100)]));
  return {
    _merge:true,id:value.id,title:value.title,country:value.country,origin:value.origin,category:value.category,source:'custom',
    time:value.totalTime,prepTime:value.prepTime,cookTime:value.cookTime,totalTime:value.totalTime,servings:value.servings,difficulty:value.difficulty||'легко',
    ingredients:value.products.map(ingredientLabel),extraIngredients:value.products.map(ingredientLabel),steps:value.steps,tips:value.tips||'',
    historyNote:value.historyNote||'',recipeSources:value.recipeSources||[],ingredientNutrition:rows,
    nutrition:nutritionPerServing,nutrition100,nutritionTotal,ingredientWeight:round(rows.reduce((sum,row)=>sum+row.weight,0),2),
    weight:value.finishedWeight,estimatedWeight:value.finishedWeight,weightEstimated:true,
    updatedAt:'2026-08-21T00:00:00.000Z',revision:'2026-08-21-personal-chef-review-v1'
  };
}

const russianFoodOmelet={label:'RussianFood · омлет с молоком',url:'https://www.russianfood.com/recipes/bytype/?fid=869'};
const russianFoodApple={label:'RussianFood · печёные яблоки',url:'https://www.russianfood.com/recipes/recipe.php?rid=97877'};
const maffUnadon={label:'MAFF Japan · унаги кабаяки и унадон',url:'https://www.maff.go.jp/e/policies/market/k_ryouri/search_menu/6616/index.html'};

const manualPatches=[
  manualRecipe({
    id:'my-1787235306254',title:'Яйцо в хлебе',country:'Россия',origin:'Современный домашний завтрак',category:'Завтраки',servings:1,
    prepTime:'5 мин',cookTime:'6 мин',totalTime:'11 мин',finishedWeight:120,
    products:[
      {name:'ржаной хлеб',referenceName:'ржаной хлеб',amount:75,unit:'g',label:'ржаной хлеб — 1 крупный ломтик, 75 г'},
      {name:'куриное яйцо',amount:1,unit:'piece'},
      {name:'подсолнечное масло',amount:1,unit:'milliliter'},
      {name:'соль',includeNutrition:false,label:'соль — по вкусу'}
    ],
    steps:[
      'Вырежьте в середине ломтика хлеба круглое отверстие, оставив по краям прочный ободок шириной около 2 см.',
      'Разогрейте антипригарную сковороду на среднем огне 1 минуту и тонко смажьте поверхность маслом.',
      'Положите хлеб на сковороду и прогрейте первую сторону 1 минуту.',
      'Переверните хлеб, разбейте яйцо в отверстие и слегка посолите.',
      'Уменьшите нагрев до слабого, накройте сковороду крышкой и готовьте 3–4 минуты, пока белок полностью не схватится.',
      'Для плотного желтка аккуратно переверните хлеб ещё раз и готовьте 30–60 секунд.',
      'Переложите яйцо в хлебе на тарелку и подавайте сразу.'
    ],
    tips:'Это современный домашний вариант блюда egg in a hole; единого исторического состава у него нет.',
    historyNote:'Яйцо, приготовленное внутри ломтика хлеба, известно под разными названиями в современной домашней кухне. Здесь сохранён простой вариант на ржаном хлебе.'
  }),
  manualRecipe({
    id:'my-1783546360234',title:'Яблоко, запечённое с мёдом',country:'Россия',origin:'Домашняя русская кухня',category:'Десерты',servings:1,
    prepTime:'8 мин',cookTime:'25 мин',totalTime:'33 мин',finishedWeight:170,
    products:[
      {name:'яблоко',amount:1,unit:'piece',label:'яблоко — 1 шт., около 180 г'},
      {name:'мёд',amount:1,unit:'teaspoon'},
      {name:'вода',amount:30,unit:'milliliter',label:'вода — 2 ст. л.'},
      {name:'корица',includeNutrition:false,label:'корица — по вкусу'}
    ],
    steps:[
      'Разогрейте духовку до 180 °C.',
      'Вымойте яблоко, обсушите и срежьте сверху небольшую крышечку.',
      'Удалите семенную коробочку чайной ложкой или узким ножом, не прорезая дно плода.',
      'Поставьте яблоко срезом вверх в небольшую жаропрочную форму.',
      'Положите мёд в углубление и при желании посыпьте корицей.',
      'Налейте воду на дно формы, не заполняя ею яблоко.',
      'Запекайте 20–30 минут до мягкости мякоти, сохраняя целой кожицу.',
      'Дайте десерту остыть 5 минут и подавайте тёплым.'
    ],
    tips:'Точное время зависит от сорта и размера яблока: готовая мякоть легко прокалывается ножом.',
    historyNote:'Печёные яблоки — распространённый домашний десерт; воду добавляют на дно формы, а сладкую начинку помещают в удалённую сердцевину.',
    recipeSources:[russianFoodApple]
  }),
  manualRecipe({
    id:'my-1783693175163',title:'Домашний омлет с молоком',country:'Россия',origin:'Домашняя русская кухня',category:'Завтраки',servings:2,
    prepTime:'5 мин',cookTime:'10 мин',totalTime:'15 мин',finishedWeight:210,
    products:[
      {name:'куриное яйцо',amount:3,unit:'piece'},
      {name:'молоко цельное',referenceName:'молоко цельное',amount:70,unit:'milliliter',label:'молоко — 70 мл'},
      {name:'подсолнечное масло',amount:2,unit:'milliliter'},
      {name:'соль',includeNutrition:false,label:'соль — по вкусу'}
    ],
    steps:[
      'Разбейте яйца в глубокую миску и перемешайте венчиком до соединения белков и желтков, не взбивая в плотную пену.',
      'Влейте молоко, добавьте соль и перемешайте смесь до однородности.',
      'Разогрейте сковороду с толстым дном на среднем огне 1 минуту и тонко смажьте маслом.',
      'Вылейте яичную смесь, сразу уменьшите нагрев до слабого и накройте сковороду крышкой.',
      'Готовьте 7–9 минут, пока края и середина омлета полностью не схватятся.',
      'Снимите сковороду с огня и оставьте омлет под крышкой на 1 минуту.',
      'Разделите омлет на две порции и подавайте горячим.'
    ],
    tips:'Разрыхлитель не нужен: спокойный слабый нагрев и закрытая крышка дают ровную, нежную структуру.',
    historyNote:'Классический французский omelette обычно готовят без молока; эта версия относится к привычной русской домашней традиции омлета с молоком.',
    recipeSources:[russianFoodOmelet]
  }),
  manualRecipe({
    id:'my-1784050833872',title:'Унадон — рис с угрём',country:'Япония',origin:'Япония · унадон',category:'Горячие блюда',servings:1,
    prepTime:'25 мин',cookTime:'25 мин',totalTime:'50 мин',finishedWeight:310,difficulty:'средне',
    products:[
      {name:'рис японский сухой',amount:70,unit:'g'},
      {name:'угорь унаги в соусе',amount:100,unit:'g'},
      {name:'соус унаги',amount:15,unit:'g',values:{kcal:143,protein:1.47,fat:0,carbs:34.4},source:'Данные продукта',label:'соус унаги — 15 г'},
      {name:'нори',amount:0.5,unit:'piece',label:'нори — 1/2 листа'},
      {name:'кунжут',amount:3,unit:'g'},
      {name:'сансё',includeNutrition:false,label:'перец сансё — по желанию'}
    ],
    steps:[
      'Промывайте рис холодной водой, пока стекающая вода не станет почти прозрачной.',
      'Оставьте рис в сите на 10 минут, затем переложите в кастрюлю и добавьте воду по инструкции производителя.',
      'Доведите до кипения, накройте крышкой и готовьте на минимальном огне время, указанное на упаковке.',
      'Снимите рис с огня и выдержите под крышкой ещё 10 минут, не перемешивая.',
      'Угря вместе с глазурью прогрейте по инструкции на упаковке до горячей середины, не пересушивая поверхность.',
      'Соус унаги прогрейте отдельно на слабом огне 1–2 минуты.',
      'Разрыхлите рис лопаткой и выложите в глубокую тёплую миску.',
      'Полейте рис частью соуса, сверху уложите угря кожей вниз.',
      'Добавьте оставшийся соус, нарезанный нори, кунжут и при желании щепотку сансё.',
      'Подавайте унадон сразу, пока рис и угорь горячие.'
    ],
    tips:'Лук и чеснок исключены: для унадона характерны горячий рис, угорь кабаяки и сладко-солёный соус тарэ.',
    historyNote:'Унадон стал популярным в период Эдо как способ подать глазированного угря кабаяки на горячем рисе и сохранить блюдо тёплым.',
    recipeSources:[maffUnadon]
  }),
  manualRecipe({
    id:'my-1784013007456',title:'Мягкие вафли в электровафельнице',country:'Россия',origin:'Современная домашняя выпечка',category:'Выпечка',servings:8,
    prepTime:'15 мин',cookTime:'25 мин',totalTime:'40 мин',finishedWeight:430,
    products:[
      {name:'пшеничная мука',amount:160,unit:'g'},
      {name:'молоко цельное',referenceName:'молоко цельное',amount:200,unit:'milliliter',label:'молоко — 200 мл'},
      {name:'куриное яйцо',amount:2,unit:'piece'},
      {name:'разрыхлитель теста',amount:1,unit:'teaspoon'},
      {name:'сахар',amount:30,unit:'g'},
      {name:'подсолнечное масло',amount:1,unit:'teaspoon',label:'подсолнечное масло — 1 ч. л. для панелей'},
      {name:'соль',includeNutrition:false,label:'соль — 1 щепотка'}
    ],
    steps:[
      'Достаньте молоко и яйца из холодильника заранее, чтобы они согрелись до комнатной температуры.',
      'Просейте муку вместе с разрыхлителем и солью в отдельную миску.',
      'В другой миске перемешайте яйца с сахаром до растворения крупинок, не взбивая до плотной пены.',
      'Влейте молоко и перемешайте венчиком до однородности.',
      'Всыпьте сухую смесь в жидкую в два приёма и перемешайте только до исчезновения сухой муки.',
      'Оставьте тесто на 10 минут, чтобы мука равномерно впитала жидкость.',
      'Разогрейте электровафельницу по инструкции производителя и тонко смажьте панели маслом.',
      'Выложите тесто в центр каждой формы, оставляя место для расширения.',
      'Закройте вафельницу и готовьте одну партию 3–5 минут до ровной золотистой корочки.',
      'Переложите вафли на решётку в один слой, чтобы поверхность не отсырела.'
    ],
    tips:'Не перемешивайте тесто долго после добавления муки: это делает вафли плотными.',
    historyNote:'Это современная мягкая вафля для электрической вафельницы, а не заявка на конкретный бельгийский или льежский исторический тип.'
  }),
  manualRecipe({
    id:'my-1783536797238',title:'Овощное рагу по-домашнему',country:'Россия',origin:'Современная домашняя кухня',category:'Горячие блюда',servings:6,
    prepTime:'15 мин',cookTime:'40 мин',totalTime:'55 мин',finishedWeight:1180,
    products:[
      {name:'картофель',amount:500,unit:'g'},
      {name:'морковь',amount:1,unit:'piece'},
      {name:'зелёный горошек',amount:150,unit:'g'},
      {name:'болгарский перец',amount:100,unit:'g'},
      {name:'томатная паста',amount:70,unit:'g'},
      {name:'подсолнечное масло',amount:2,unit:'tablespoon'},
      {name:'вода',amount:300,unit:'milliliter',label:'вода — 300 мл'},
      {name:'соль',includeNutrition:false,label:'соль — по вкусу'}
    ],
    steps:[
      'Очистите картофель и морковь, удалите у перца плодоножку, семена и белые перегородки.',
      'Нарежьте картофель крупными кубиками, морковь и перец — кубиками среднего размера.',
      'Разогрейте масло в кастрюле с толстым дном на среднем огне.',
      'Добавьте морковь и готовьте 4 минуты, периодически перемешивая.',
      'Добавьте сладкий перец и продолжайте готовить ещё 3 минуты.',
      'Положите картофель, добавьте горячую воду и доведите до слабого кипения.',
      'Накройте кастрюлю крышкой и тушите на слабом огне 20 минут.',
      'Разведите томатную пасту небольшим количеством горячей жидкости из кастрюли и вмешайте в рагу.',
      'Добавьте зелёный горошек, посолите и тушите ещё 8–10 минут до мягкости картофеля.',
      'Снимите кастрюлю с огня и дайте рагу настояться под крышкой 5 минут.'
    ],
    tips:'Название исправлено: без мяса это овощное рагу, а не классическое жаркое.',
    historyNote:'Жаркое в русской традиции предполагает мясо; сохранённый овощной состав корректнее называть домашним овощным рагу.'
  })
];

const koreanSource={label:'Korea.net · кимпаб',url:'https://www.korea.net/Resources/Multimedia/Video/view?articleId=5874'};
const modernWeeklyHistory='Современное домашнее блюдо, составленное для персонального недельного меню; оно не заявлено как исторический канон конкретной кухни.';
const fixtureRecipes=weekly.recipes.map(recipe=>{
  const out={...recipe};
  if(recipe.id==='week-20260819-lunch-unagi-bowl'){
    out.historyNote='Современный боул на основе японской подачи унаги с рисом; овощная часть является авторским дополнением.';
    out.recipeSources=[maffUnadon];
  }else if(recipe.id.includes('kimbap')){
    out.historyNote='Кимпаб — корейский рисовый рулет в листе ким; рис приправляют кунжутным маслом, а подготовленные начинки раскладывают полосами перед сворачиванием.';
    out.recipeSources=[koreanSource];
  }else if(!['Фрукты','Закуски'].includes(recipe.category)){
    out.historyNote=modernWeeklyHistory;
  }
  return out;
});

console.log(JSON.stringify({fixtureRecipes,manualPatches}));
