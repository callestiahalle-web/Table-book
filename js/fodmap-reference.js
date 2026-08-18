(function(){
  'use strict';
  const normalize=value=>String(value||'').toLocaleLowerCase('ru-RU').replace(/ё/g,'е').replace(/[^a-zа-я0-9\s-]/gi,' ').replace(/\s+/g,' ').trim();
  const words=value=>normalize(value).split(' ').filter(Boolean);
  const patternWords=value=>String(value||'').toLocaleLowerCase('ru-RU').replace(/ё/g,'е').replace(/[^a-zа-я0-9\s*-]/gi,' ').replace(/\s+/g,' ').trim().split(' ').filter(Boolean);
  const tokenMatches=(token,pattern)=>pattern.endsWith('*')?token.startsWith(pattern.slice(0,-1)):token===pattern;
  const phraseMatches=(text,pattern)=>{
    const hay=words(text),needle=patternWords(pattern);
    for(let i=0;i<=hay.length-needle.length;i++) if(needle.every((part,j)=>tokenMatches(hay[i+j],part))) return true;
    return false;
  };
  const groups={
    red:{label:'Высокое содержание FODMAP',short:'Высокий',patterns:[
      'чеснок*','репчат* лук','красн* лук','бел* лук','луковиц*','лук','порей','артишок*','спарж*','гриб*','шампин*','сельдер*','цветн* капуст*','зелен* горош*',
      'яблок*','груш*','манго','вишн*','черешн*','персик*','нектарин*','слив*','арбуз*','сухофрукт*','финик*','инжир*',
      'пшеничн* хлеб','ржан* хлеб','пшеничн* паст*','пшеничн* макарон*','рожь','ячмен*','обычн* молок*','коров* молок*','йогурт*','мягк* сыр','морожен*',
      'нут','чечевиц*','фасол*','бобы','горох*','кешью','фисташ*','мед','фруктозн* сироп','сорбит*','маннит*','ксилит*','мальтит*'
    ]},
    yellow:{label:'Зависит от размера порции',short:'Умеренный',patterns:[
      'авокадо','брокколи','кабач*','цуккин*','тыкв*','батат*','белокочан* капуст*','овсян*','миндал*','кокосов* молок*','консервированн* нут','консервированн* чечевиц*'
    ]},
    green:{label:'Обычно низкое содержание FODMAP',short:'Низкий',patterns:[
      'безлактозн* молок*','тверд* сыр','фета','бри','камамбер','сливочн* масло','яйц*','куриц*','цыпл*','индейк*','говядин*','свинин*','баранин*','рыб*','лосос*','семг*','форел*','тунец','треск*','кревет*','миди*','кальмар*',
      'баклаж*','стручков* фасол*','бок чой','морков*','огур*','салат*','картоф*','зелен* перец','шпинат*','томат*','помидор*','редис*',
      'апельсин*','мандарин*','ананас*','киви','голубик*','черник*','клубник*','банан*','виноград*','лимон*','лайм*',
      'рис','рисов*','киноа','кукуруз*','овсян* хлоп*','тофу','темпе','арахис*','грецк* орех*','макадам*','тыквенн* семеч*','кунжут*','сахар','кленов* сироп','темн* шоколад','оливков* масло','растител* масло'
    ]}
  };
  const specificGreen=['безлактозн* молок*','тверд* сыр','фета','бри','камамбер','сливочн* масло'];
  const classify=value=>{
    const text=normalize(value);
    if(!text) return null;
    if(specificGreen.some(pattern=>phraseMatches(text,pattern))) return {level:'green',...groups.green};
    for(const level of ['red','yellow','green']) if(groups[level].patterns.some(pattern=>phraseMatches(text,pattern))) return {level,...groups[level]};
    return null;
  };
  window.TABLE_BOOK_FODMAP_REFERENCE={classify,groups,sourceName:'Monash University FODMAP',sourceUrl:'https://www.monashfodmap.com/about-fodmap-and-ibs/high-and-low-fodmap-foods/'};
})();
