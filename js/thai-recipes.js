(function(){
  'use strict';

  // Для каждого блюда оставлена одна основная карточка. Варианты с другим
  // составом или способом приготовления не входят в этот список.
  const duplicateGroups={
    'th-khai-jiao':['th-thai-omelet','th-extra-17'],
    'th-som-tam':['th-extra-07'],
    'th-larb':['th-larb-chicken','th-extra-08'],
    'th-satay':['th-extra-13'],
    'th-tom-kha':['th-extra-10'],
    'th-green-curry':['th-extra-06'],
    'th-yam-woon-sen':['th-extra-09'],
    'th-khao-tom':['th-extra-19'],
    'tb-more-th-morning-glory':['th-extra-16'],
    'th-mango-sticky-rice':['tb-more-th-mango-sticky-rice-more','th-extra-15'],
    'tb-more-th-kanom-krok':['th-extra-14']
  };

  const duplicateIds=new Set(Object.values(duplicateGroups).flat());

  function apply(recipes){
    for(let index=recipes.length-1;index>=0;index-=1){
      if(duplicateIds.has(recipes[index].id)) recipes.splice(index,1);
    }
  }

  window.TABLE_BOOK_THAI_RECIPES={apply,duplicateGroups,duplicateIds};
})();
