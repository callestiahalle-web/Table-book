(function(){
  'use strict';

  const normalize=value=>String(value||'')
    .toLocaleLowerCase('ru-RU')
    .replace(/ё/g,'е')
    .replace(/[^a-zа-я0-9\s-]/gi,' ')
    .replace(/\s+/g,' ')
    .trim();
  const def=(tag,patterns,parents=[])=>({tag,patterns,parents});

  // Patterns ending in * match a whole word by its beginning. Multi-word
  // patterns must match adjacent words, so a generic word such as "филе"
  // never turns salmon into chicken.
  const definitions=[
    def('курица',['куриц*','цыпл*','курин* филе','филе курин*','курин* грудк*','курин* бедр*','курин* голен*','курин* крыл*','курин* фарш*','курин* мяс*','курин* бульон*'],['птица']),
    def('индейка',['индейк*','индюш*'],['птица']),
    def('утка',['утк*','утин* грудк*','утиное филе'],['птица']),
    def('перепел',['перепел*'],['птица']),
    def('говядина',['говядин*','теляти*','говяж*'],['мясо']),
    def('свинина',['свинин*','свин* вырезк*','свин* ше*','свин* ребр*','свиные ребра'],['мясо']),
    def('баранина',['баранин*','ягнен*'],['мясо']),
    def('бекон',['бекон*'],['мясо']),
    def('ветчина',['ветчин*'],['мясо']),
    def('колбаса',['колбас*','сосиск*','салями'],['мясо']),
    def('печень',['печен*','печень'],['субпродукты']),
    def('лосось',['лосос*','семг*'],['рыба']),
    def('форель',['форел*'],['рыба']),
    def('тунец',['тунец','тунц*'],['рыба']),
    def('треска',['треск*'],['рыба']),
    def('скумбрия',['скумбр*'],['рыба']),
    def('сельдь',['сельд*','селед*'],['рыба']),
    def('дорадо',['дорад*'],['рыба']),
    def('белая рыба',['бел* рыба','рыб* филе','филе рыб*'],['рыба']),
    def('креветки',['кревет*'],['морепродукты']),
    def('мидии',['миди*'],['морепродукты']),
    def('кальмар',['кальмар*'],['морепродукты']),
    def('осьминог',['осьминог*'],['морепродукты']),
    def('краб',['краб*'],['морепродукты']),
    def('яйца',['яйцо','яйца','яиц*','яичн*']),
    def('молоко',['молок*']),
    def('сливки',['сливк*']),
    def('сметана',['сметан*']),
    def('кефир',['кефир*']),
    def('йогурт',['йогурт*','мацон*']),
    def('творог',['творог*','творож*']),
    def('сыр',['сыр','сыра','сырн*']),
    def('моцарелла',['моцарелл*'],['сыр']),
    def('фета',['фета','фету','феты'],['сыр']),
    def('картофель',['картоф*','картош*']),
    def('морковь',['морков*']),
    def('лук',['репчат* лук','красн* лук','бел* лук','луковиц*','лук']),
    def('зеленый лук',['зелен* лук','перья лука']),
    def('чеснок',['чеснок*','чесноч*']),
    def('томаты',['томат*','помидор*']),
    def('огурец',['огур*']),
    def('кабачок',['кабач*','цуккин*']),
    def('баклажан',['баклаж*']),
    def('болгарский перец',['болгарск* перец','сладк* перец','красн* перец','зелен* перец'],['перец']),
    def('острый перец',['перец чили','чили','остр* перец'],['перец']),
    def('капуста',['капуст*']),
    def('цветная капуста',['цветн* капуст*'],['капуста']),
    def('брокколи',['брокколи']),
    def('шпинат',['шпинат*']),
    def('грибы',['гриб*','шампин*','вешен*','шиитаке']),
    def('тыква',['тыкв*']),
    def('свекла',['свекл*']),
    def('редис',['редис*','редьк*']),
    def('сельдерей',['сельдер*']),
    def('спаржа',['спарж*']),
    def('зеленый горошек',['зелен* горош*','горох*']),
    def('рис',['рис','риса','рисов*']),
    def('гречка',['греч*']),
    def('овсянка',['овсян*','овес','геркулес']),
    def('манка',['манн* круп*','манка']),
    def('булгур',['булгур*']),
    def('кускус',['кускус*']),
    def('киноа',['киноа']),
    def('паста',['паста','пасты','макарон*','спагет*','лапш*']),
    def('мука',['мука','муки','мучн*']),
    def('хлеб',['хлеб*','чиабатт*','багет*','лаваш*','тост*']),
    def('нут',['нут','нута']),
    def('чечевица',['чечевиц*']),
    def('фасоль',['фасол*','бобы']),
    def('тофу',['тофу']),
    def('яблоко',['яблок*']),
    def('банан',['банан*']),
    def('лимон',['лимон*']),
    def('лайм',['лайм*']),
    def('апельсин',['апельсин*']),
    def('мандарины',['мандарин*']),
    def('авокадо',['авокадо']),
    def('манго',['манго']),
    def('ананас',['ананас*']),
    def('груша',['груш*']),
    def('персик',['персик*','персич*']),
    def('слива',['слив*']),
    def('вишня',['вишн*','черешн*']),
    def('ягоды',['ягод*','клубник*','малин*','черник*','смород*']),
    def('виноград',['виноград*']),
    def('гранат',['гранат*']),
    def('кокос',['кокос*']),
    def('орехи',['орех*','миндал*','фисташ*','кешью','арахис*','макадам*']),
    def('кунжут',['кунжут*']),
    def('шоколад',['шоколад*']),
    def('какао',['какао']),
    def('мед',['мед','меда','медом']),
    def('сахар',['сахар*']),
    def('растительное масло',['растител* масло','подсолнеч* масло']),
    def('оливковое масло',['оливков* масло']),
    def('сливочное масло',['сливочн* масло']),
    def('соевый соус',['соев* соус']),
    def('мисо',['мисо']),
    def('кимчи',['кимчи','кимчхи']),
    def('водоросли',['водоросл*','нори','вакаме','комбу']),
    def('петрушка',['петруш*']),
    def('укроп',['укроп*']),
    def('кинза',['кинз*','кориандр*']),
    def('базилик',['базилик*'])
  ];

  const stopWords=new Set(['свежий','свежая','свежие','спелый','спелая','спелые','крупный','крупная','мелкий','мелкая','сухой','сухая','готовый','готовая','вареный','вареная','очищенный','очищенная','нарезанный','нарезанная','по','вкусу','для','подачи','или','и','без','кожи','костей','вода','соль']);
  const words=value=>normalize(value).split(' ').filter(Boolean);
  const patternWords=value=>String(value||'').toLocaleLowerCase('ru-RU').replace(/ё/g,'е').replace(/[^a-zа-я0-9\s*-]/gi,' ').replace(/\s+/g,' ').trim().split(' ').filter(Boolean);
  const tokenMatches=(token,pattern)=>pattern.endsWith('*')?token.startsWith(pattern.slice(0,-1)):token===pattern;
  const phraseMatches=(text,pattern)=>{
    const hay=words(text),needle=patternWords(pattern);
    if(!hay.length||!needle.length||needle.length>hay.length) return false;
    for(let i=0;i<=hay.length-needle.length;i++){
      if(needle.every((part,j)=>tokenMatches(hay[i+j],part))) return true;
    }
    return false;
  };
  const queryMatches=(query,pattern)=>{
    const hay=words(query),needle=patternWords(pattern);
    return hay.length===needle.length&&needle.every((part,index)=>tokenMatches(hay[index],part));
  };
  const resolve=value=>{
    const key=normalize(value);
    if(!key) return '';
    const exact=definitions.find(item=>normalize(item.tag)===key);
    if(exact) return exact.tag;
    const candidates=definitions.flatMap(item=>item.patterns.filter(pattern=>queryMatches(key,pattern)).map(pattern=>({item,specificity:patternWords(pattern).reduce((sum,part)=>sum+part.replace(/\*$/,'').length,0)}))).sort((a,b)=>b.specificity-a.specificity);
    return candidates[0]?.item.tag||key;
  };
  const ingredientNames=recipe=>[
    ...(Array.isArray(recipe?.ingredientSearch)?recipe.ingredientSearch:[]),
    ...(Array.isArray(recipe?.ingredients)?recipe.ingredients:[]),
    ...(Array.isArray(recipe?.ingredientNutrition)?recipe.ingredientNutrition.map(item=>item?.name||''):[])
  ].map(value=>String(value||'').split(/\s+[—–-]\s+/)[0].trim()).filter(Boolean);
  const tagsForRecipe=recipe=>{
    const tags=new Set((Array.isArray(recipe?.productTags)?recipe.productTags:[]).map(resolve).filter(Boolean));
    ingredientNames(recipe).forEach(name=>{
      const normalized=normalize(name);
      let matched=false;
      definitions.forEach(item=>{
        if(item.patterns.some(pattern=>phraseMatches(normalized,pattern))){
          matched=true;
          tags.add(item.tag);
          item.parents.forEach(parent=>tags.add(parent));
        }
      });
      tags.add(normalized);
      words(normalized).filter(word=>word.length>2&&!stopWords.has(word)&&!/^\d/.test(word)).forEach(word=>tags.add(word));
      if(!matched&&normalized) tags.add(normalized);
    });
    return [...tags].filter(Boolean).sort((a,b)=>a.localeCompare(b,'ru'));
  };
  const recipeMatches=(recipe,queries)=>{
    const recipeTags=new Set(tagsForRecipe(recipe));
    const resolved=[...new Set((Array.isArray(queries)?queries:[]).map(resolve).filter(Boolean))];
    const matched=resolved.filter(tag=>recipeTags.has(tag));
    return {tags:recipeTags,queries:resolved,matched,all:resolved.length>0&&matched.length===resolved.length};
  };

  window.TABLE_BOOK_PRODUCT_TAGS={definitions,normalize,resolve,tagsForRecipe,recipeMatches,availableTags:definitions.map(item=>item.tag)};
})();
