const recipes=Array.isArray(window.TABLE_BOOK_RECIPES)?window.TABLE_BOOK_RECIPES:[];
const cuisineThemes={"Италия":{emoji:"italy",accent:"#2f7d56",bg:"linear-gradient(135deg,#2f7d56,#bb5f45)",note:"Паста, сыр, томаты."},"Испания":{emoji:"spain",accent:"#c87535",bg:"linear-gradient(135deg,#c87535,#8f352f)",note:"Тапас, паэлья, оливки."},"Япония":{emoji:"japan",accent:"#596ca8",bg:"linear-gradient(135deg,#596ca8,#b76586)",note:"Баланс, рис, лапша."},"Корея":{emoji:"korea",accent:"#b74b4b",bg:"linear-gradient(135deg,#b74b4b,#71375c)",note:"Кимчи, рис, супы."},"Россия":{emoji:"russia",accent:"#4d79a8",bg:"linear-gradient(135deg,#4d79a8,#4d8b75)",note:"Супы, каши, выпечка."},"Средиземноморская":{emoji:"med",accent:"#4d8b62",bg:"linear-gradient(135deg,#4d8b62,#3d78a8)",note:"Италия, Испания и блюда Средиземноморья."},"Средиземноморская...":{emoji:"med",accent:"#4d8b62",bg:"linear-gradient(135deg,#4d8b62,#3d78a8)",note:"Овощи, рыба, травы."},"Китай":{emoji:"china",accent:"#9b473e",bg:"linear-gradient(135deg,#9b473e,#d38a58)",note:"Лапша, димсам, вок."},"Таиланд":{emoji:"thai",accent:"#4d8a5c",bg:"linear-gradient(135deg,#4d8a5c,#d38850)",note:"Карри, рис, свежесть."},"Кавказская":{emoji:"caucasus",accent:"#8c6a3e",bg:"linear-gradient(135deg,#8c6a3e,#4f7c5d)",note:"Хачапури, хинкали, зелень и специи."},"Мои рецепты":{emoji:"custom",accent:"#8d6b48",bg:"linear-gradient(135deg,#8d6b48,#b9975b)",note:"Ваши личные рецепты."}};
const typeVisuals={"Завтраки":{icon:"breakfast",bg:"linear-gradient(135deg,#d7ad58,#f0d18e)"},"Закуски":{icon:"snack",bg:"linear-gradient(135deg,#bc7048,#e8aa78)"},"Салаты":{icon:"salad",bg:"linear-gradient(135deg,#4f8d5f,#a5c985)"},"Супы":{icon:"soup",bg:"linear-gradient(135deg,#b8693d,#dfaa72)"},"Горячие блюда":{icon:"hot",bg:"linear-gradient(135deg,#6c5c8e,#b39ad5)"},"Су-вид":{icon:"hot",bg:"linear-gradient(135deg,#435f83,#9d7b53)"},"Гарниры":{icon:"side",bg:"linear-gradient(135deg,#778d4f,#c8d99a)"},"Выпечка":{icon:"bread",bg:"linear-gradient(135deg,#9d6b3b,#d3ad77)"},"Десерты":{icon:"dessert",bg:"linear-gradient(135deg,#ad6882,#edbed0)"},"Фрукты":{icon:"fruit",bg:"linear-gradient(135deg,#b56f70,#e7b76d)"},"Соусы":{icon:"sauce",bg:"linear-gradient(135deg,#8a6a4d,#c6ab83)"},"Морепродукты":{icon:"seafood",bg:"linear-gradient(135deg,#3e8da5,#95d4df)"}};
const categoryOrder=["Завтраки","Закуски","Салаты","Супы","Горячие блюда","Су-вид","Гарниры","Выпечка","Десерты","Фрукты","Морепродукты","Соусы"];
const ingredientGroupOrder=["Мясо","Птица","Рыба и морепродукты","Овощи и грибы","Крупы, бобовые и макароны","Яйца и молочные продукты","Тесто и выпечка","Фрукты и ягоды","Орехи и семена","Бульоны","Каши","Йогурт","Десерты","Другие продукты"];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

const iconPaths={
  book:'<path d="M7 5.5h7a3 3 0 0 1 3 3V22H9.5A2.5 2.5 0 0 0 7 24.5V5.5Z"/><path d="M17 5.5h7a3 3 0 0 1 3 3V22h-7.5A2.5 2.5 0 0 0 17 24.5V5.5Z"/><path d="M10 10h4M20 10h4M10 14h3M20 14h3"/>',
  heart:'<path d="M16 26S5 20 5 12.5c0-3.6 2.5-6 5.8-6 2.2 0 4 1.2 5.2 3 1.2-1.8 3-3 5.2-3 3.3 0 5.8 2.4 5.8 6C27 20 16 26 16 26Z"/>',
  share:'<circle cx="10" cy="16" r="2.5"/><circle cx="22" cy="9" r="2.5"/><circle cx="22" cy="23" r="2.5"/><path d="m12.2 14.8 7.6-4.5M12.2 17.2l7.6 4.5"/>',
  unlink:'<path d="M13.2 19.2 11 21.4a4 4 0 0 1-5.7-5.7l3.2-3.2a4 4 0 0 1 5.7 0"/><path d="m18.8 12.8 2.2-2.2a4 4 0 0 1 5.7 5.7l-3.2 3.2a4 4 0 0 1-5.7 0"/><path d="m12 20 8-8M6 6l20 20"/>',
  arrow:'<path d="m12 8.5 7.5 7.5-7.5 7.5"/>',
  arrowLeft:'<path d="m20 8.5-7.5 7.5 7.5 7.5"/>'
};
function iconSvg(name){return `<svg class="line-icon" viewBox="0 0 32 32" aria-hidden="true">${iconPaths[name]||iconPaths.book}</svg>`;}
function navBackButtonHtml(label='Назад'){
  return `<span class="nav-arrow-icon" aria-hidden="true">${iconSvg('arrowLeft')}</span><span>${label}</span>`;
}
function setNavBackButton(button,label='Назад'){
  if(button) button.innerHTML=navBackButtonHtml(label);
}
function initializeNavigationIcons(){
  ['backBtn','likedBackBtn','encyclopediaBackBtn','myBackBtn','mealBackBtn'].forEach(id=>setNavBackButton($('#'+id)));
  setNavBackButton($('#mealPickerBack'));
  const cue=$('#swipeCue');
  if(cue) cue.innerHTML=`<span class="nav-arrow-icon" aria-hidden="true">${iconSvg('arrowLeft')}</span><b>Назад</b>`;
}
const HOME_ACTION_ICON_VERSION='20260827-performance';
function homeActionIconVariant(){return state.theme==='dark'?'dark':'light';}
function homeActionIconSrc(name,variant=homeActionIconVariant()){return `./assets/icons/home-actions/${name}-${variant}.png?v=${HOME_ACTION_ICON_VERSION}`;}
function homeActionIconHtml(name,label){return `<img class="home-action-icon" data-home-action-name="${name}" src="${homeActionIconSrc(name)}" alt="${label}" loading="lazy" decoding="async">`;}
function setHomeActionIcon(id,name,label){const el=$('#'+id); if(el) el.innerHTML=homeActionIconHtml(name,label);}
function updateHomeActionIcons(){$$('.home-action-icon[data-home-action-name]').forEach(img=>{const name=img.dataset.homeActionName; const src=homeActionIconSrc(name); if(img.getAttribute('src')!==src) img.setAttribute('src',src);});}
function ambientThemeIcon(theme){
  const on=theme==='dark';
  return `<span class="room-switch ${on?'is-on':'is-off'}" aria-hidden="true"><span class="switch-plate"><span class="switch-rocker"></span><span class="switch-glow"></span></span></span>`;
}


const COUNTRY_IMAGE_VERSION='20260827-targeted-load';
function countryImageWithVersion(src){
  return String(src||'').startsWith('./assets/countries/') ? `${src}?v=${COUNTRY_IMAGE_VERSION}` : src;
}
function countryImageSrc(country){
  const key=String(country||'').trim();
  const m={
    "Россия":"./assets/countries/country-russia.webp",
    "Таиланд":"./assets/countries/country-thai.webp",
    "Кавказская":"./assets/countries/country-caucasus.webp",
    "Кавказ":"./assets/countries/country-caucasus.webp",
    "Грузия":"./assets/countries/country-caucasus.webp",
    "Армения":"./assets/countries/country-caucasus.webp",
    "Азербайджан":"./assets/countries/country-caucasus.webp",
    "Арцах":"./assets/countries/country-caucasus.webp",
    "Средиземноморская":"./assets/countries/country-mediterranean.webp",
    "Средиземноморская...":"./assets/countries/country-mediterranean.webp",
    "Средиземноморье":"./assets/countries/country-mediterranean.webp",
    "Италия":"./assets/countries/country-mediterranean.webp",
    "Испания":"./assets/countries/country-mediterranean.webp",
    "Греция":"./assets/countries/country-mediterranean.webp",
    "Греция / Левант":"./assets/countries/country-mediterranean.webp",
    "Левант":"./assets/countries/country-mediterranean.webp",
    "Ливан":"./assets/countries/country-mediterranean.webp",
    "Турция":"./assets/countries/country-mediterranean.webp",
    "Франция":"./assets/countries/country-mediterranean.webp",
    "Марокко":"./assets/countries/country-mediterranean.webp",
    "Северная Африка":"./assets/countries/country-mediterranean.webp",
    "Китай":"./assets/countries/country-chinese.webp",
    "Япония":"./assets/countries/country-japanese.webp",
    "Корея":"./assets/countries/country-korean.webp",
    "Мои рецепты":"./assets/icons/icon-512.png",
    "Каталог":"./assets/icons/icon-512.png"
  };
  return countryImageWithVersion(m[key]||"./assets/icons/icon-512.png");
}
function countryImageAlt(country){return `${country} — иллюстрация кухни`;}
function countryImageDarkSrc(country){
  const src=countryImageSrc(country);
  if(src.startsWith('./assets/countries/')) return src.replace('./assets/countries/','./assets/countries/dark/');
  return src;
}
function countryImageHtml(country,cls='country-art'){
  const alt=esc(countryImageAlt(country));
  const light=countryImageSrc(country), dark=countryImageDarkSrc(country);
  const src=state.theme==='dark'?dark:light;
  return `<img class="${cls} country-img-theme" src="${src}" data-country-light="${light}" data-country-dark="${dark}" data-country-theme="${state.theme==='dark'?'dark':'light'}" alt="${alt}" loading="lazy" decoding="async" fetchpriority="low">`;
}
const countryImageLoads=new Map();
function loadCountryImage(src){
  if(!src) return Promise.resolve(false);
  if(countryImageLoads.has(src)) return countryImageLoads.get(src);
  const task=new Promise(resolve=>{
    const preload=new Image();
    preload.decoding='async';
    preload.onload=()=>resolve(true);
    preload.onerror=()=>resolve(false);
    preload.src=src;
  });
  countryImageLoads.set(src,task);
  return task;
}
function updateCountryImages(){
  const theme=state.theme==='dark'?'dark':'light';
  const key=theme==='dark'?'countryDark':'countryLight';
  $$('.country-img-theme').forEach(img=>{
    const src=img.dataset[key];
    if(!src || (img.getAttribute('src')===src && img.dataset.countryTheme===theme)) return;
    const requestedTheme=theme;
    loadCountryImage(src).then(loaded=>{
      if(!loaded || !img.isConnected || state.theme!==requestedTheme) return;
      img.src=src;
      img.dataset.countryTheme=requestedTheme;
    });
  });
}

const STORAGE_STATE_KEY="tableBookState";
const STORAGE_RECIPES_KEY="tableBookUserRecipes";
const STORAGE_BACKUP_KEY="tableBookBackup";
const STORAGE_MEAL_LEGACY_KEY="tableBookLegacyMealPlan";
const STORAGE_PERSONAL_KEY_PREFIX="tableBookPersonalState:";
const SUPABASE_URL="https://qshwxcxhxkchpdjaecdk.supabase.co";
const SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzaHd4Y3hoeGtjaHBkamFlY2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MjM3NTYsImV4cCI6MjA5OTA5OTc1Nn0.aQM03By8cL4VkFsI4NiVugWtSKU1bcZkHfErK_4PMB4";
const CLOUD_TABLE="user_app_state";
const CLOUD_MEAL_TABLE="user_meal_days";
const CLOUD_RECIPE_OVERRIDE_TABLE="user_recipe_overrides";
const CLOUD_PRODUCT_PORTION_TABLE="product_portion_weights";
const CLOUD_FOOD_NUTRITION_TABLE="food_nutrition_reference";
const CLOUD_FOOD_STORAGE_TABLE="food_storage_reference";
const PRODUCT_PORTION_CACHE_KEY="tableBookProductPortions:v2";
const FOOD_NUTRITION_CACHE_KEY="tableBookFoodNutrition:v1";
const FOOD_STORAGE_CACHE_KEY="tableBookFoodStorage:v1";
const MEAL_MONTH_CACHE_LIMIT=3;
const CLOUD_SESSION_KEY="tableBookSupabaseSession";
const CLOUD_PROFILE_KEY_PREFIX="tableBookCloudProfile:";
const CLOUD_LAST_SYNC_KEY_PREFIX="tableBookCloudLastSync:";
const CLOUD_PENDING_CONFIRM_KEY="tableBookPendingConfirmEmail";
function getAuthRedirectUrl(){
  try{
    const isNative=!!(window.Capacitor && typeof window.Capacitor.isNativePlatform==='function' && window.Capacitor.isNativePlatform());
    if(isNative) return 'https://www.table-book.ru/';
    const u=new URL(window.location.href);
    u.hash='';
    u.search='';
    u.pathname=u.pathname.replace(/index\.html$/,'');
    let out=u.toString();
    if(!out.endsWith('/')) out+='/';
    return out;
  }catch(e){return window.location.origin+window.location.pathname.replace(/index\.html$/,'');}
}

function authUrlParams(){
  const hashRaw=(window.location.hash||'').replace(/^#/, '');
  const queryRaw=(window.location.search||'').replace(/^\?/, '');
  const hash=new URLSearchParams(hashRaw);
  const query=new URLSearchParams(queryRaw);
  return {hash,query,hasHash:!!hashRaw,hasQuery:!!queryRaw};
}
function hasAuthRedirectParams(){
  const {hash,query}=authUrlParams();
  return !!(hash.get('access_token')||hash.get('refresh_token')||hash.get('error')||hash.get('error_description')||hash.get('type')||query.get('code')||query.get('error')||query.get('error_description')||query.get('type')||query.get('token_hash'));
}
function cleanAuthUrl(){
  try{
    const u=new URL(window.location.href);
    u.hash='';
    ['code','error','error_description','error_code','type','token_hash'].forEach(k=>u.searchParams.delete(k));
    history.replaceState(null,document.title,u.toString());
  }catch(e){}
}
function authRedirectErrorMessage(){
  const {hash,query}=authUrlParams();
  const err=hash.get('error_description')||query.get('error_description')||hash.get('error')||query.get('error')||'';
  if(!err) return '';
  const low=err.toLowerCase();
  if(low.includes('expired')) return 'Ссылка подтверждения устарела. Нажмите «Отправить письмо ещё раз» и подтвердите новое письмо.';
  if(low.includes('invalid')) return 'Ссылка подтверждения недействительна. Запросите письмо подтверждения ещё раз.';
  return 'Ошибка подтверждения email: '+err;
}
async function processAuthRedirect(){
  if(!cloud || !hasAuthRedirectParams()) return false;
  const redirectError=authRedirectErrorMessage();
  if(redirectError){
    cloudStatus(redirectError);
    setAuthPlaque(redirectError,'error',{showResend:true});
    cleanAuthUrl();
    return false;
  }
  const {hash,query}=authUrlParams();
  const accessToken=hash.get('access_token')||query.get('access_token');
  const refreshToken=hash.get('refresh_token')||query.get('refresh_token');
  const code=query.get('code');
  try{
    if(accessToken && refreshToken && cloud.auth?.setSession){
      const {data,error}=await cloud.auth.setSession({access_token:accessToken,refresh_token:refreshToken});
      if(error) throw error;
      if(data?.user || data?.session?.user) setCloudUser(data.user||data.session.user);
      localStorage.removeItem(CLOUD_PENDING_CONFIRM_KEY);
      cleanAuthUrl();
      cloudStatus('Email подтверждён. Вход выполнен, профиль загружается.');
      return true;
    }
    if(code && cloud.auth?.exchangeCodeForSession){
      const {data,error}=await cloud.auth.exchangeCodeForSession(code);
      if(error) throw error;
      if(data?.user || data?.session?.user) setCloudUser(data.user||data.session.user);
      localStorage.removeItem(CLOUD_PENDING_CONFIRM_KEY);
      cleanAuthUrl();
      cloudStatus('Email подтверждён. Вход выполнен, профиль загружается.');
      return true;
    }
    if(accessToken && refreshToken){
      // REST fallback processes tokens inside getSession().
      cleanAuthUrl();
      return true;
    }
  }catch(error){
    console.warn('Auth redirect processing failed',error);
    cloudStatus('Email мог быть подтверждён, но сессия не сохранилась в браузере: '+cloudErrorMessage(error));
    cleanAuthUrl();
    return false;
  }
  return false;
}
const cloud=createCloudClient();
let cloudUser=null, cloudProfile={}, cloudSaveTimer=null, cloudBusy=false, cloudSyncApplying=false, cloudAutoSyncDoneForUser=null;
let cloudLibraryLoadedForUser=null;
let cloudLibraryLoad=null;
let productPortionWeights=normalizeProductPortionRows(window.TABLE_BOOK_PRODUCT_PORTION_FALLBACK||[]);
let foodNutritionReference=normalizeFoodNutritionRows(window.TABLE_BOOK_FOOD_NUTRITION_FALLBACK||[]);
let foodStorageReference=normalizeFoodStorageRows(window.TABLE_BOOK_FOOD_STORAGE_FALLBACK||[]);
function createCloudClient(){
  if(window.supabase && typeof window.supabase.createClient==='function'){
    try{return window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:window.localStorage,flowType:'implicit'}})}catch(e){console.warn('Supabase SDK init failed, using REST fallback',e)}
  }
  return createRestCloudClient();
}
function createRestCloudClient(){
  let session=safeJson(localStorage.getItem(CLOUD_SESSION_KEY),null);
  const base=SUPABASE_URL.replace(/\/+$/,'');
  function now(){return Math.floor(Date.now()/1000)}
  function saveSession(next){session=next||null; try{session?localStorage.setItem(CLOUD_SESSION_KEY,JSON.stringify(session)):localStorage.removeItem(CLOUD_SESSION_KEY)}catch(e){console.warn('Session save failed',e)}}
  function normalizeSession(payload){
    if(!payload) return null;
    const expiresAt=payload.expires_at || (payload.expires_in?now()+Number(payload.expires_in):null);
    return {access_token:payload.access_token,refresh_token:payload.refresh_token,expires_at:expiresAt,token_type:payload.token_type||'bearer',user:payload.user||payload};
  }
  function readUrlSession(){
    const {hash,query}=authUrlParams();
    const accessToken=hash.get('access_token')||query.get('access_token');
    const refreshToken=hash.get('refresh_token')||query.get('refresh_token');
    if(!accessToken || !refreshToken) return null;
    const payload={access_token:accessToken,refresh_token:refreshToken,token_type:hash.get('token_type')||query.get('token_type')||'bearer',expires_in:Number(hash.get('expires_in')||query.get('expires_in')||3600)};
    const next=normalizeSession(payload);
    saveSession(next);
    cleanAuthUrl();
    localStorage.removeItem(CLOUD_PENDING_CONFIRM_KEY);
    return next;
  }
  function headers(token=session?.access_token,extra={}){return Object.assign({'apikey':SUPABASE_ANON_KEY,'Authorization':'Bearer '+(token||SUPABASE_ANON_KEY),'Content-Type':'application/json'},extra)}
  async function request(path,options={}){
    const res=await fetch(base+path,Object.assign({},options,{headers:Object.assign(headers(options.token),options.headers||{})}));
    let body=null; const txt=await res.text(); if(txt){try{body=JSON.parse(txt)}catch(e){body=txt}}
    if(!res.ok){const err=new Error((body&&body.message)||body?.msg||body?.error_description||body?.error||res.statusText); err.status=res.status; err.details=body; throw err;}
    return body;
  }
  async function refreshSession(){
    if(!session?.refresh_token) return session;
    if(session.expires_at && session.expires_at-now()>45) return session;
    const payload=await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',token:SUPABASE_ANON_KEY,body:JSON.stringify({refresh_token:session.refresh_token})});
    const next=normalizeSession(payload); saveSession(next); return next;
  }
  function restFrom(table){
    const query={selectCols:null,head:false,count:null,filters:[],limitN:null,orderBy:null,action:'select'};
    const api={
      select(cols,opts={}){query.selectCols=cols||'*';query.head=!!opts.head;query.count=opts.count||null;return api;},
      eq(col,val){query.filters.push([col,'eq',val]);return api;},
      in(col,values){query.filters.push([col,'in',Array.isArray(values)?values:[]]);return api;},
      gte(col,val){query.filters.push([col,'gte',val]);return api;},
      lt(col,val){query.filters.push([col,'lt',val]);return api;},
      order(col,opts={}){query.orderBy=[col,opts.ascending!==false];return api;},
      delete(){query.action='delete';return api;},
      limit(n){query.limitN=n;return executeSelect();},
      maybeSingle(){return executeSelect(true);},
      async upsert(row,opts={}){await refreshSession(); const onConflict=opts.onConflict?`?on_conflict=${encodeURIComponent(opts.onConflict)}`:''; try{const data=await request(`/rest/v1/${encodeURIComponent(table)}${onConflict}`,{method:'POST',headers:Object.assign(headers(session?.access_token),{'Prefer':'resolution=merge-duplicates,return=representation'}),body:JSON.stringify(row)}); return {data,error:null}}catch(error){return {data:null,error}}},
      then(resolve,reject){return (query.action==='delete'?executeDelete():executeSelect()).then(resolve,reject);}
    };
    function queryParams(){
      const params=new URLSearchParams();
      if(query.action==='select') params.set('select',query.selectCols||'*');
      for(const [c,op,v] of query.filters){
        if(op==='in') params.append(c,`in.(${v.map(item=>`"${String(item).replace(/"/g,'\\"')}"`).join(',')})`);
        else params.append(c,`${op}.${v}`);
      }
      if(query.limitN!=null) params.set('limit',String(query.limitN));
      if(query.orderBy) params.set('order',`${query.orderBy[0]}.${query.orderBy[1]?'asc':'desc'}`);
      return params;
    }
    async function executeSelect(single=false){
      await refreshSession();
      const params=queryParams();
      const extra={}; if(query.head) extra['Prefer']=query.count?`count=${query.count}`:'';
      try{const data=await request(`/rest/v1/${encodeURIComponent(table)}?${params.toString()}`,{method:query.head?'HEAD':'GET',headers:Object.assign(headers(session?.access_token),extra)}); return {data:single?(Array.isArray(data)?(data[0]||null):data):data,error:null}}catch(error){return {data:null,error}}
    }
    async function executeDelete(){
      await refreshSession();
      const params=queryParams();
      try{const data=await request(`/rest/v1/${encodeURIComponent(table)}?${params.toString()}`,{method:'DELETE',headers:Object.assign(headers(session?.access_token),{'Prefer':'return=minimal'})}); return {data,error:null}}catch(error){return {data:null,error}}
    }
    return api;
  }
  async function restRpc(name,args={}){
    try{
      await refreshSession();
      const data=await request(`/rest/v1/rpc/${encodeURIComponent(name)}`,{
        method:'POST',
        token:session?.access_token||SUPABASE_ANON_KEY,
        body:JSON.stringify(args||{})
      });
      return {data,error:null};
    }catch(error){return {data:null,error};}
  }
  return {
    auth:{
      async getSession(){try{readUrlSession();await refreshSession();if(session?.access_token && (!session.user || !session.user.id)){try{const user=await request('/auth/v1/user',{method:'GET',token:session.access_token});session.user=user;saveSession(session);}catch(e){console.warn('REST user fetch failed',e)}}return {data:{session:session},error:null}}catch(error){saveSession(null);return {data:{session:null},error}}},
      async signInWithPassword({email,password}){try{const payload=await request('/auth/v1/token?grant_type=password',{method:'POST',token:SUPABASE_ANON_KEY,body:JSON.stringify({email,password})}); const next=normalizeSession(payload); saveSession(next); if(next?.access_token && (!next.user || !next.user.id)){try{next.user=await request('/auth/v1/user',{method:'GET',token:next.access_token});saveSession(next);}catch(e){console.warn('REST login user fetch failed',e)}} return {data:{session:next,user:next.user},error:null}}catch(error){return {data:{session:null,user:null},error}}},
      async signUp({email,password,options={}}){try{const redirect=options.emailRedirectTo||options.redirectTo||getAuthRedirectUrl(); const path='/auth/v1/signup?redirect_to='+encodeURIComponent(redirect); const payload=await request(path,{method:'POST',token:SUPABASE_ANON_KEY,body:JSON.stringify({email,password,data:options.data||{},options:{email_redirect_to:redirect}})}); const next=payload.access_token?normalizeSession(payload):null; if(next) saveSession(next); return {data:{session:next,user:next?.user||payload.user||payload},error:null}}catch(error){return {data:{session:null,user:null},error}}},
      async resend({type,email,options={}}){try{const redirect=options.emailRedirectTo||options.redirectTo||getAuthRedirectUrl(); const payload=await request('/auth/v1/resend',{method:'POST',token:SUPABASE_ANON_KEY,body:JSON.stringify({type,email,options:{email_redirect_to:redirect}})}); return {data:payload,error:null}}catch(error){return {data:null,error}}},
      async signOut({scope='local'}={}){try{if(session?.access_token) await request(`/auth/v1/logout?scope=${encodeURIComponent(scope)}`,{method:'POST',token:session.access_token,body:'{}'})}catch(e){} saveSession(null); return {error:null}},
      async updateUser(payload){try{await refreshSession(); const data=await request('/auth/v1/user',{method:'PUT',token:session?.access_token,body:JSON.stringify(payload)}); if(session){session.user=data; saveSession(session)} return {data:{user:data},error:null}}catch(error){return {data:{user:null},error}}},
      async setSession(tokens){try{const next=normalizeSession({access_token:tokens.access_token,refresh_token:tokens.refresh_token,expires_in:tokens.expires_in||3600,token_type:'bearer'}); saveSession(next); if(next?.access_token){try{next.user=await request('/auth/v1/user',{method:'GET',token:next.access_token});saveSession(next);}catch(e){console.warn('REST setSession user fetch failed',e)}} return {data:{session:next,user:next.user},error:null}}catch(error){return {data:{session:null,user:null},error}}},
      async exchangeCodeForSession(){return {data:{session:null,user:null},error:new Error('Для ссылки с code нужен Supabase SDK. Перезагрузите страницу с интернетом или запросите новое письмо подтверждения.')}} ,
      onAuthStateChange(){return {data:{subscription:{unsubscribe(){}}}}}
    },
    from:restFrom,
    rpc:restRpc
  };
}
function safeJson(value,fallback){try{return value?JSON.parse(value):fallback}catch(e){return fallback}}
const storedState=safeJson(localStorage.getItem(STORAGE_STATE_KEY)||localStorage.getItem("maisonState"),{});
const state=Object.assign({theme:"light",route:"home",country:null,filterCat:null,editingId:null,mealPlan:{},mealMonth:null,selectedMealDate:null,likedRecipes:[],encyTab:"Все",mealStorageVersion:2,mealDirtyDays:[],pantryTags:[],shoppingWeekStart:null},storedState);
// Personal data is intentionally not hydrated until Supabase confirms a user.
// This prevents recipes, likes and calendar history from a previous account
// appearing during a guest session on the same phone.
Object.assign(state,{route:"home",country:null,filterCat:null,editingId:null,mealPlan:{},mealMonth:null,selectedMealDate:null,likedRecipes:[],mealStorageVersion:2,mealDirtyDays:[]});
let myRecipes=[];
let recipeOverrides={};
const baseRecipeIndex=new Map(recipes.map(recipe=>[String(recipe.id),recipe]));
let catalogRecipeCache=null;
let catalogCountryCache=null;
const RECIPE_DETAILS_VERSION='20260827-targeted-load';
const recipeDetailCache=new Map();
const recipeDetailLoads=new Map();
async function loadBaseRecipeDetails(recipeId){
  const id=canonicalRecipeId(recipeId,'base');
  if(recipeDetailCache.has(id)) return recipeDetailCache.get(id);
  if(recipeDetailLoads.has(id)) return recipeDetailLoads.get(id);
  const task=(async()=>{
    const response=await fetch(`./data/recipes/${encodeURIComponent(id)}.json?v=${RECIPE_DETAILS_VERSION}`,{cache:'force-cache'});
    if(!response.ok) throw new Error(`Не удалось загрузить рецепт (${response.status})`);
    const detail=await response.json();
    if(String(detail?.id||'')!==id) throw new Error('Получена карточка другого рецепта');
    const merged=Object.assign({},baseRecipeIndex.get(id)||{},detail);
    baseRecipeIndex.set(id,merged);
    recipeDetailCache.set(id,merged);
    invalidateCatalogRecipeCache();
    return merged;
  })().finally(()=>recipeDetailLoads.delete(id));
  recipeDetailLoads.set(id,task);
  return task;
}
let legacyMealPlanPending={};
let localPersonalHydratedForUser=null;
const LEGACY_DUPLICATE_RECIPE_IDS=new Set([
  'week-20260824-lunch-turkey-container',
  'week-20260825-lunch-chicken-container',
  'week-20260819-breakfast-nordic',
  'week-snack-savushkin-grapefruit',
  'week-snack-savushkin-orange',
  'week-20260820-breakfast-nordic-egg',
  'week-breakfast-nordic-water-egg',
  'week-20260823-breakfast-last-nordic',
  'week-20260824-breakfast-oatmeal',
  'week-20260825-breakfast-oatmeal',
  'week-chip-san-carlo-tomato-25',
  'week-chip-san-carlo-tomato-20',
  'week-chip-san-carlo-classica-15',
  'week-chip-san-carlo-classica-25',
  'week-chip-san-carlo-lime-25',
  'week-chip-san-carlo-any-25',
  'week-fruit-grapefruit-small'
]);
const LEGACY_DUPLICATE_RECIPE_REFS={
  'week-20260824-lunch-turkey-container':'week-20260823-dinner-turkey-batch',
  'week-20260825-lunch-chicken-container':'week-20260824-dinner-chicken-bowl-batch',
  'week-20260819-breakfast-nordic':'week-breakfast-nordic-milk',
  'week-snack-savushkin-grapefruit':'week-snack-savushkin',
  'week-snack-savushkin-orange':'week-snack-savushkin',
  'week-20260820-breakfast-nordic-egg':'week-breakfast-nordic-milk',
  'week-breakfast-nordic-water-egg':'week-breakfast-nordic-water',
  'week-20260823-breakfast-last-nordic':'week-breakfast-nordic-water',
  'week-20260824-breakfast-oatmeal':'week-breakfast-oatmeal-coconut',
  'week-20260825-breakfast-oatmeal':'week-breakfast-oatmeal-coconut',
  'week-chip-san-carlo-tomato-25':'week-chip-san-carlo-tomato',
  'week-chip-san-carlo-tomato-20':'week-chip-san-carlo-tomato',
  'week-chip-san-carlo-classica-15':'week-chip-san-carlo-classic',
  'week-chip-san-carlo-classica-25':'week-chip-san-carlo-classic',
  'week-chip-san-carlo-lime-25':'week-chip-san-carlo-lime-pepper',
  'week-chip-san-carlo-any-25':'week-chip-san-carlo-classic',
  'week-fruit-grapefruit-small':'week-fruit-grapefruit-100'
};
function isLegacyDuplicateRecipe(recipe){
  return LEGACY_DUPLICATE_RECIPE_IDS.has(String(recipe?.id||''));
}
const duplicateCustomRecipeRefs=new Map();
function normalizedRecipeTitle(value){
  return String(value||'').normalize('NFKC').trim().toLocaleLowerCase('ru-RU').replace(/\s+/g,' ');
}
function rememberDuplicateCustomRecipeRef(fromId,toId){
  const from=String(fromId||''),to=String(toId||'');
  if(!from||!to||from===to) return;
  const target=canonicalCustomRecipeId(to);
  duplicateCustomRecipeRefs.set(from,target);
  duplicateCustomRecipeRefs.forEach((value,key)=>{if(value===from) duplicateCustomRecipeRefs.set(key,target);});
}
function canonicalCustomRecipeId(id){
  let value=String(id||''),guard=0;
  while(duplicateCustomRecipeRefs.has(value)&&guard<100){value=duplicateCustomRecipeRefs.get(value);guard+=1;}
  return value;
}
function withoutLegacyDuplicateRecipes(list){
  const unique=new Map();
  (Array.isArray(list)?list:[]).forEach(recipe=>{
    if(!recipe||isLegacyDuplicateRecipe(recipe)) return;
    const normalizedRecipe=reconcileCustomRecipeNutrition(recipe);
    const title=normalizedRecipeTitle(normalizedRecipe.title);
    const key=title?`title::${title}`:`id::${String(recipe.id||'')}`;
    const existing=unique.get(key);
    if(!existing){unique.set(key,normalizedRecipe);return;}
    if(recipeStamp(normalizedRecipe)>=recipeStamp(existing)){
      rememberDuplicateCustomRecipeRef(existing.id,normalizedRecipe.id);
      unique.set(key,normalizedRecipe);
    }else rememberDuplicateCustomRecipeRef(normalizedRecipe.id,existing.id);
  });
  return Array.from(unique.values());
}
function stateForStorage(){
  const s=Object.assign({},state);
  s.mealPlan=compactCachedMealPlan(s.mealPlan);
  s.mealStorageVersion=2;
  s.mealDirtyDays=[...new Set((Array.isArray(s.mealDirtyDays)?s.mealDirtyDays:[]).filter(key=>/^\d{4}-\d{2}-\d{2}$/.test(String(key))))];
  const selected=String(s.selectedMealDate||'');
  if(!selected || !s.mealPlan[selected]) s.selectedMealDate=null;
  s.mealEditorOpen=false;
  s.editingId=null;
  return s;
}
function tableBookSnapshot(){return {app:"Table book",version:2,savedAt:new Date().toISOString(),state:stateForStorage(),myRecipes:withoutLegacyDuplicateRecipes(myRecipes)};}
function publicStateForStorage(){
  return {
    theme:state.theme||"light",
    route:"home",
    country:null,
    filterCat:null,
    editingId:null,
    encyTab:state.encyTab||"Все",
    mealPlan:{},
    mealMonth:null,
    selectedMealDate:null,
    likedRecipes:[],
    pantryTags:normalizePantryTags(state.pantryTags),
    shoppingWeekStart:validDateKey(state.shoppingWeekStart)?state.shoppingWeekStart:null,
    mealStorageVersion:2,
    mealDirtyDays:[]
  };
}
function personalCacheKey(user=cloudUser){return user?.id?STORAGE_PERSONAL_KEY_PREFIX+user.id:null;}
function personalCacheSnapshot(){
  return {
    likedRecipes:normalizeLikedRecipes(state.likedRecipes),
    myRecipes:withoutLegacyDuplicateRecipes(myRecipes),
    recipeOverrides:recipeOverrides&&typeof recipeOverrides==='object'?recipeOverrides:{},
    mealPlan:compactCachedMealPlan(state.mealPlan),
    mealMonth:state.mealMonth||null,
    selectedMealDate:state.selectedMealDate||null,
    mealDirtyDays:Array.isArray(state.mealDirtyDays)?state.mealDirtyDays:[],
    savedAt:new Date().toISOString()
  };
}
function persistPersonalCache(){
  const key=personalCacheKey();
  if(!key) return false;
  try{localStorage.setItem(key,JSON.stringify(personalCacheSnapshot())); return true;}
  catch(e){console.warn('Personal cache save failed',e); return false;}
}
let personalCacheSaveTimer=null;
let backupSaveTimer=null;
function queuePersonalCacheSave(delay=180){
  if(!cloudUser) return;
  clearTimeout(personalCacheSaveTimer);
  personalCacheSaveTimer=setTimeout(()=>{personalCacheSaveTimer=null;persistPersonalCache();},delay);
}
function queueBackupSave(delay=650){
  if(!cloudUser) return;
  clearTimeout(backupSaveTimer);
  backupSaveTimer=setTimeout(()=>{backupSaveTimer=null;persistBackup();},delay);
}
function clearInMemoryPersonalData(){
  myRecipes=[];
  recipeOverrides={};
  invalidateCatalogRecipeCache();
  state.likedRecipes=[];
  state.mealPlan={};
  state.mealMonth=null;
  state.selectedMealDate=null;
  state.mealDirtyDays=[];
  legacyMealPlanPending={};
}
function hydratePersonalCacheForUser(user=cloudUser){
  if(!user?.id || localPersonalHydratedForUser===user.id) return false;
  clearInMemoryPersonalData();
  const cached=safeJson(localStorage.getItem(personalCacheKey(user)),{});
  myRecipes=withoutLegacyDuplicateRecipes(cached.myRecipes);
  recipeOverrides=cached.recipeOverrides&&typeof cached.recipeOverrides==='object'?cached.recipeOverrides:{};
  invalidateCatalogRecipeCache();
  state.likedRecipes=normalizeLikedRecipes(cached.likedRecipes);
  state.mealPlan=normalizeMealPlan(cached.mealPlan);
  state.mealMonth=cached.mealMonth||monthKeyFromDate(new Date());
  state.selectedMealDate=cached.selectedMealDate||null;
  state.mealDirtyDays=Array.isArray(cached.mealDirtyDays)?cached.mealDirtyDays:[];
  localPersonalHydratedForUser=user.id;
  return true;
}
function clearPersonalCacheForUser(userId){
  if(!userId) return;
  try{localStorage.removeItem(STORAGE_PERSONAL_KEY_PREFIX+userId);}catch(e){}
}
function persistBackup(){
  try{
    if(cloudUser) localStorage.setItem(STORAGE_BACKUP_KEY,JSON.stringify(tableBookSnapshot()));
    else localStorage.removeItem(STORAGE_BACKUP_KEY);
  }catch(e){console.warn("Backup save failed",e)}
}

function cloudQueueStateSignature(){
  return JSON.stringify({theme:state.theme||'light',likedRecipes:normalizeLikedRecipes(state.likedRecipes),encyTab:state.encyTab||'Все'});
}
function updateBackupStatus(text){const el=$("#backupStatus"); if(el) el.textContent=text;}
function saveState({sync=true,personal=false}={}){
  try{
    // The meal plan can be large. Normalize it only after a real personal-data
    // change instead of doing the work for every route, filter and carousel tap.
    if(personal) state.mealPlan=normalizeMealPlan(state.mealPlan);
    localStorage.setItem(STORAGE_STATE_KEY,JSON.stringify(publicStateForStorage()));
    if(personal){queuePersonalCacheSave();queueBackupSave();}
    if(sync && !cloudSyncApplying){
      const sig=cloudQueueStateSignature();
      if(sig!==lastCloudQueuedStateSignature){
        lastCloudQueuedStateSignature=sig;
        queueCloudSave();
      }
    }
  }catch(e){console.warn("State save failed",e)}
}
function saveMyRecipes(){try{myRecipes=withoutLegacyDuplicateRecipes(myRecipes);if(cloudUser){queuePersonalCacheSave();queueBackupSave();}updateBackupStatus(cloudUser?"Автосохранение выполнено.":"Войдите, чтобы рецепты сохранялись после закрытия приложения.");if(!cloudSyncApplying) queueCloudSave()}catch(e){updateBackupStatus("Не удалось сохранить данные.");console.warn("Recipe save failed",e)} updateHomeMeta();}
function defaultUserState(themeValue=state?.theme||"light"){
  return {theme:themeValue||"light",route:"home",country:null,filterCat:null,editingId:null,mealPlan:{},mealPlanUpdatedAt:null,mealMonth:monthKeyFromDate(new Date()),selectedMealDate:null,mealEditorOpen:false,myCat:null,likedRecipes:[],encyTab:"Все",mealStorageVersion:2,mealDirtyDays:[],pantryTags:[],shoppingWeekStart:null};
}
function resetLocalPersonalDataAfterLogout({silent=false}={}){
  const previousUserId=cloudUser?.id||localPersonalHydratedForUser;
  const keepTheme=state?.theme||"light";
  clearTimeout(cloudSaveTimer);
  clearTimeout(personalCacheSaveTimer);
  clearTimeout(backupSaveTimer);
  personalCacheSaveTimer=null;
  backupSaveTimer=null;
  cloudMealSaveTimers.forEach(timer=>clearTimeout(timer));
  cloudMealSaveTimers.clear();
  mealMonthLoads.clear();
  mealMonthCache.clear();
  legacyMealPlanPending={};
  cloudSyncApplying=true;
  try{
    clearInMemoryPersonalData();
    Object.keys(state).forEach(k=>delete state[k]);
    Object.assign(state,defaultUserState(keepTheme));
    mealDraftDate=null;
    mealDraft=null;
    mealEditorOpen=false;
    localStorage.removeItem(STORAGE_RECIPES_KEY);
    localStorage.removeItem(STORAGE_MEAL_LEGACY_KEY);
    localStorage.removeItem("maisonMyRecipes");
    localStorage.removeItem("maisonState");
    localStorage.removeItem(STORAGE_BACKUP_KEY);
    clearPersonalCacheForUser(previousUserId);
    localPersonalHydratedForUser=null;
    localStorage.setItem(STORAGE_STATE_KEY,JSON.stringify(publicStateForStorage()));
    persistBackup();
  }catch(e){console.warn('Local account data reset failed',e)}
  finally{cloudSyncApplying=false;}
  try{closeModalInstant?.();}catch(e){}
  try{resetMyForm?.();}catch(e){}
  try{renderMyRecipes?.();}catch(e){}
  try{renderMealCalendar?.();}catch(e){}
  try{updateStats?.();}catch(e){}
  try{updateHomeMeta?.();}catch(e){}
  try{showView?.('home');}catch(e){}
  if(!silent) cloudStatus('Вы вышли из аккаунта. Личные рецепты и календарь очищены на этом устройстве. При следующем входе данные загрузятся из облака.');
}
function vibe(ms=12){try{if(navigator.vibrate) navigator.vibrate(ms)}catch(e){}}
function theme(name){return cuisineThemes[name]||{emoji:"book",accent:"#b99a5d",bg:"linear-gradient(135deg,#8e714a,#b99a5d)",note:"Коллекция рецептов."}}
function visual(cat){return typeVisuals[cat]||{icon:"hot",bg:"linear-gradient(135deg,#8e714a,#d2b47d)"}}
function recipeOverrideFor(id){return recipeOverrides?.[canonicalRecipeId(id,'base')]||null;}
function invalidateCatalogRecipeCache(){catalogRecipeCache=null;catalogCountryCache=null;}
function effectiveBaseRecipe(id){
  const canonicalId=canonicalRecipeId(id,'base');
  const original=baseRecipeIndex.get(canonicalId);
  if(!original) return null;
  const edited=recipeOverrideFor(canonicalId);
  return edited?Object.assign({},original,edited,{id:original.id,country:original.country,source:'base',userEdited:true}):original;
}
function catalogRecipes(){
  if(!catalogRecipeCache) catalogRecipeCache=recipes.filter(r=>!r.weeklyMenuOnly).map(r=>effectiveBaseRecipe(r.id)||r);
  return catalogRecipeCache;
}
function catalogCountries(){
  if(!catalogCountryCache){
    catalogCountryCache=new Map();
    catalogRecipes().forEach(recipe=>{
      const list=catalogCountryCache.get(recipe.country)||[];
      list.push(recipe);
      catalogCountryCache.set(recipe.country,list);
    });
  }
  return catalogCountryCache;
}
function catalogRecipesForCountry(country){return catalogCountries().get(country)||[];}
function uniqueCountries(){return [...catalogCountries().keys()].sort((a,b)=>a.localeCompare(b,'ru'))}
function orderedCategories(list){const set=[...new Set(list.map(r=>r.category))]; return [...categoryOrder.filter(c=>set.includes(c)), ...set.filter(c=>!categoryOrder.includes(c)).sort((a,b)=>a.localeCompare(b,'ru'))]}
function orderedCountryCategories(list){
  const set=new Set(orderedCategories(list));
  set.add('Фрукты');
  return [...categoryOrder.filter(category=>set.has(category)),...Array.from(set).filter(category=>!categoryOrder.includes(category)).sort((a,b)=>a.localeCompare(b,'ru'))];
}
const ingredientGroupRules=[
  ['Птица',['куриц','курин','цыпл','индей','утк','гус','перепел']],
  ['Рыба и морепродукты',['рыб','лосос','сёмг','семг','форел','тунец','треск','судак','скумбр','сельд','кревет','кальмар','миди','осьмин','морепродукт','краб','угор','красная икра','лососевая икра','икра минтая','анчоус','сардин','шпрот','дорад','сибас','палтус','карп','хек','минтай','гребеш','суши','ролл']],
  ['Мясо',['говя','телят','свинин','порос','баранин','ягн','бекон','ветчин','колбас','мяс','стейк','беф','рёбр','ребр','корейк','карбонад','хаш','печёноч','печеноч','печень гов','фарш мяс','голубц']],
  ['Крупы, бобовые и макароны',['рис','греч','овся','овёс','пшен','перлов','киноа','булгур','кускус','макарон','паста','спагет','лапш','рамэн','рамен','нут','чечев','фасол','горох','боб','тофу','полент','кукурузн круп','каша','плов']],
  ['Фрукты и ягоды',['яблок','груш','персик','абрикос','слив','вишн','черешн','клубник','малин','черник','смород','ягод','виноград','апельсин','мандарин','лимон','лайм','манго','ананас','банан','гранат','инжир','финик','айв']],
  ['Овощи и грибы',['картоф','капуст','свёкл','свекл','морков','томат','помидор','огур','баклаж','кабач','цуккин','перец','тыкв','шпинат','брокколи','цветн','гриб','шампин','лук','чеснок','редис','реп','спарж','авокадо','овощ']],
  ['Яйца и молочные продукты',['яйц','омлет','сыр','творог','молок','йогурт','сливк','сметан','кефир','мацон','ряжен','брынз','сулугун']],
  ['Тесто и выпечка',['мук','тест','хлеб','лаваш','пирог','пирож','булоч','блин','олад','вафл','печень','кекс','торт','хачапур','пельмен','вареник','манты','самс','штруд','галет']],
  ['Орехи и семена',['орех','миндал','фисташ','арахис','кунжут','семеч','маков']]
];
function detectedIngredientGroup(text){const value=String(text||'').toLocaleLowerCase('ru-RU'); if(value.includes('кабачковая икра')||value.includes('баклажанная икра')) return 'Овощи и грибы'; return ingredientGroupRules.find(([,tokens])=>tokens.some(token=>value.includes(token)))?.[0]||'';}
function recipeIngredientGroup(recipe){
  if(recipe?.ingredientGroup) return recipe.ingredientGroup;
  const titleGroup=detectedIngredientGroup(recipe?.title);
  if(titleGroup) return titleGroup;
  const ingredientTexts=[...(Array.isArray(recipe?.ingredients)?recipe.ingredients:[]),...(Array.isArray(recipe?.ingredientNutrition)?recipe.ingredientNutrition.map(product=>product?.name||''):[])];
  for(const ingredient of ingredientTexts.slice(0,6)){
    const group=detectedIngredientGroup(ingredient);
    if(group) return group;
  }
  const fallback={"Выпечка":"Тесто и выпечка","Морепродукты":"Рыба и морепродукты","Десерты":"Яйца и молочные продукты","Фрукты":"Фрукты и ягоды","Завтраки":"Яйца и молочные продукты","Салаты":"Овощи и грибы","Супы":"Овощи и грибы","Гарниры":"Овощи и грибы","Соусы":"Овощи и грибы"};
  return fallback[recipe?.category]||'Другие продукты';
}
function recipesByIngredientGroup(items){
  const buckets=new Map();
  items.forEach(recipe=>{const group=recipeIngredientGroup(recipe); if(!buckets.has(group)) buckets.set(group,[]); buckets.get(group).push(recipe);});
  const order=[...ingredientGroupOrder.filter(group=>buckets.has(group)),...Array.from(buckets.keys()).filter(group=>!ingredientGroupOrder.includes(group)).sort((a,b)=>a.localeCompare(b,'ru'))];
  return order.map(group=>({group,recipes:buckets.get(group)}));
}
function originLabel(r){return r&&r.country==='Средиземноморская'&&r.origin?`Происхождение: ${r.origin}`:''}
function canonicalRecipeId(id,source='base'){
  const value=String(id||'');
  if(source==='custom') return canonicalCustomRecipeId(value);
  return String(window.TABLE_BOOK_RECIPE_ALIASES?.[value]||value);
}

const PUBLIC_APP_URL='https://www.table-book.ru/';
const SHARED_RECIPE_HASH_KEY='shared-recipe';
const SHARED_RECIPE_QUERY_KEY='s';
let activeSharedRecipe=null;
let activeRecipeModalKey=null;
function isNativeApp(){
  return !!(window.Capacitor && typeof window.Capacitor.isNativePlatform==='function' && window.Capacitor.isNativePlatform());
}
function recipeShareBaseUrl(){
  try{
    const url=new URL(isNativeApp()?PUBLIC_APP_URL:window.location.href);
    url.search='';
    url.hash='';
    if(isNativeApp()) url.pathname='/';
    return url;
  }catch(e){return new URL(PUBLIC_APP_URL);}
}
function sharedRecipePayload(recipe){
  const text=(value,max=800)=>String(value??'').slice(0,max);
  const list=value=>(Array.isArray(value)?value:[]).slice(0,120).map(item=>text(item,1200));
  return {
    v:1,
    title:text(recipe?.title,220)||'Рецепт',
    category:text(recipe?.category,80)||'Без категории',
    country:text(recipe?.country,100)||'Мои рецепты',
    origin:text(recipe?.origin,100),
    time:text(recipe?.time,80)||'—',
    servings:Math.max(1,Number(recipe?.servings)||1),
    difficulty:text(recipe?.difficulty,40)||'легко',
    ingredients:list(recipe?.ingredients),
    steps:list(recipe?.steps),
    tips:text(recipe?.tips,1800),
    healthy:!!recipe?.healthy,
    weight:Math.max(0,Number(recipe?.weight)||0),
    nutrition:recipe?.nutrition||null,
    nutrition100:recipe?.nutrition100||null
  };
}
function encodeSharedRecipe(recipe){
  const bytes=new TextEncoder().encode(JSON.stringify(sharedRecipePayload(recipe)));
  let binary='';
  bytes.forEach(byte=>{binary+=String.fromCharCode(byte);});
  return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function decodeSharedRecipe(value){
  try{
    if(!value || value.length>120000) return null;
    const padded=value.replace(/-/g,'+').replace(/_/g,'/')+'==='.slice((value.length+3)%4);
    const binary=atob(padded);
    const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));
    const parsed=JSON.parse(new TextDecoder().decode(bytes));
    if(parsed?.v!==1 || !parsed.title || !Array.isArray(parsed.ingredients) || !Array.isArray(parsed.steps)) return null;
    return Object.assign(sharedRecipePayload(parsed),{id:'shared-'+Date.now(),source:'shared'});
  }catch(e){return null;}
}
function normalizeRemoteSharedRecipe(value,shareCode=''){
  try{
    const parsed=typeof value==='string'?JSON.parse(value):value;
    if(parsed?.v!==1 || !parsed.title || !Array.isArray(parsed.ingredients) || !Array.isArray(parsed.steps)) return null;
    return Object.assign(sharedRecipePayload(parsed),{id:'shared-'+shareCode,source:'shared',shareCode});
  }catch(e){return null;}
}
function recipeShareCode(id){
  const value=canonicalRecipeId(id,'base');
  let hash=2166136261;
  for(let index=0;index<value.length;index++){
    hash^=value.charCodeAt(index);
    hash=Math.imul(hash,16777619);
  }
  return (hash>>>0).toString(36);
}
function recipeIdFromShareCode(value){
  const requested=String(value||'').trim();
  if(!requested) return '';
  const direct=canonicalRecipeId(requested,'base');
  if(recipes.some(recipe=>canonicalRecipeId(recipe.id,'base')===direct)) return direct;
  const matches=recipes.filter(recipe=>recipeShareCode(recipe.id)===requested);
  return matches.length===1?canonicalRecipeId(matches[0].id,'base'):direct;
}
function recipeShareUrl(recipe,source='base'){
  const url=recipeShareBaseUrl();
  if(source==='shared' && recipe?.shareCode){
    url.searchParams.set(SHARED_RECIPE_QUERY_KEY,recipe.shareCode);
  }else if(source==='custom' || source==='shared'){
    url.hash=`${SHARED_RECIPE_HASH_KEY}=${encodeURIComponent(encodeSharedRecipe(recipe))}`;
  }else{
    url.searchParams.set('r',recipeShareCode(recipe?.id));
  }
  return url.toString();
}
function recipeRequestFromUrl(){
  try{
    const url=new URL(window.location.href);
    const shareCode=String(url.searchParams.get(SHARED_RECIPE_QUERY_KEY)||'').trim();
    if(/^[A-Za-z0-9_-]{12}$/.test(shareCode)) return {id:'shared-'+shareCode,source:'shared',shareCode,recipe:null};
    const baseId=url.searchParams.get('r')||url.searchParams.get('recipe');
    if(baseId) return {id:recipeIdFromShareCode(baseId),source:'base',recipe:null};
    const hash=new URLSearchParams(url.hash.replace(/^#/,''));
    const shared=decodeSharedRecipe(hash.get(SHARED_RECIPE_HASH_KEY));
    return shared?{id:shared.id,source:'shared',recipe:shared}:null;
  }catch(e){return null;}
}
function shortSharedRecipeUrl(shareCode){
  const url=recipeShareBaseUrl();
  url.searchParams.set(SHARED_RECIPE_QUERY_KEY,String(shareCode||''));
  return url.toString();
}
async function createShortSharedRecipeLink(id,recipe){
  if(!cloud?.rpc || !cloudUser?.id) return '';
  const {data,error}=await cloud.rpc('create_shared_recipe',{p_recipe_id:String(id),p_recipe_data:sharedRecipePayload(recipe)});
  if(error) throw error;
  const code=String(data||'').trim();
  if(!/^[A-Za-z0-9_-]{12}$/.test(code)) throw new Error('Supabase returned an invalid share code');
  return shortSharedRecipeUrl(code);
}
async function copyText(value){
  try{
    if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value); return true;}
  }catch(e){}
  const field=document.createElement('textarea');
  field.value=value;
  field.setAttribute('readonly','');
  field.style.cssText='position:fixed;left:-9999px;top:0;opacity:0';
  document.body.appendChild(field);
  field.select();
  field.setSelectionRange(0,field.value.length);
  let copied=false;
  try{copied=document.execCommand('copy');}catch(e){}
  field.remove();
  return copied;
}
async function copyRecipeLink(id,source='base'){
  const normalized=source==='custom'?'custom':source==='shared'?'shared':'base';
  const recipe=normalized==='shared'?activeSharedRecipe:resolveRecipeRef({id,source:normalized});
  if(!recipe) return false;
  let shareUrl=recipeShareUrl(recipe,normalized);
  if(normalized==='custom'){
    try{shareUrl=await createShortSharedRecipeLink(id,recipe)||shareUrl;}
    catch(error){console.warn('Short recipe link creation failed; using legacy link',error);}
  }
  const copied=await copyText(shareUrl);
  if(copied && normalized==='custom') refreshShareLinkControls(document);
  if(copied) vibe(10);
  return copied;
}

function normalizeLikedRecipes(list){
  const arr=Array.isArray(list)?list:[];
  const seen=new Set();
  return arr.map(item=>{
    if(typeof item==='string'){
      const split=item.indexOf(':');
      const source=split>-1?item.slice(0,split):'base';
      const id=split>-1?item.slice(split+1):item;
      const normalizedSource=source==='custom'?'custom':'base';
      return {source:normalizedSource,id:canonicalRecipeId(id,normalizedSource)};
    }
    const source=item?.source==='custom'?'custom':'base';
    return {source,id:canonicalRecipeId(item?.id,source)};
  }).filter(item=>item.id && !seen.has(item.source+':'+item.id) && seen.add(item.source+':'+item.id));
}
function recipeKey(id,source='base'){const normalizedSource=source==='custom'?'custom':'base'; return normalizedSource+':'+canonicalRecipeId(id,normalizedSource)}
function isRecipeLiked(id,source='base'){
  const key=recipeKey(id,source);
  return normalizeLikedRecipes(state.likedRecipes).some(item=>recipeKey(item.id,item.source)===key);
}
function resolveRecipeRef(ref){
  if(!ref) return null;
  const source=ref.source==='custom'?'custom':'base';
  const recipe=source==='custom'
    ?myRecipes.find(item=>String(item.id)===canonicalRecipeId(ref.id,source))
    :effectiveBaseRecipe(ref.id);
  return recipe?Object.assign({source},recipe):null;
}
function refreshLikeButtons(root=document){
  root.querySelectorAll('[data-like-id]').forEach(btn=>{
    const active=isRecipeLiked(btn.dataset.likeId,btn.dataset.likeSource||'base');
    btn.classList.toggle('active',active);
    btn.setAttribute('aria-pressed',active?'true':'false');
    btn.setAttribute('aria-label',active?'Убрать из «Мне нравится»':'Добавить в «Мне нравится»');
  });
}
function persistLikedRecipes({sync=true}={}){
  state.likedRecipes=normalizeLikedRecipes(state.likedRecipes);
  saveState({sync,personal:true});
  updateStats();
  renderLikedRecipes(false);
  refreshLikeButtons();
  if(sync) queueCloudSave();
}
function toggleRecipeLike(id,source='base'){
  const key=recipeKey(id,source);
  const liked=isRecipeLiked(id,source);
  state.likedRecipes=normalizeLikedRecipes(state.likedRecipes).filter(item=>recipeKey(item.id,item.source)!==key);
  if(!liked) state.likedRecipes.push({source:source==='custom'?'custom':'base',id:String(id)});
  persistLikedRecipes({sync:true});
  vibe(liked?8:[10,22,10]);
}
function likeButtonHtml(id,source='base',label='Нравится'){
  const active=isRecipeLiked(id,source);
  return `<button class="like-btn ${active?'active':''}" type="button" data-like-id="${esc(id)}" data-like-source="${source==='custom'?'custom':'base'}" aria-pressed="${active?'true':'false'}" aria-label="${active?'Убрать из «Мне нравится»':'Добавить в «Мне нравится»'}">${iconSvg('heart')}<span>${label}</span></button>`;
}
function shareButtonHtml(id,source='base'){
  const normalized=source==='custom'?'custom':source==='shared'?'shared':'base';
  return `<button class="share-btn" type="button" data-share-id="${esc(id)}" data-share-source="${normalized}" aria-label="Скопировать ссылку на рецепт">${iconSvg('share')}<span>Поделиться</span></button>`;
}
function revokeShareButtonHtml(id,source='base'){
  if(source!=='custom') return '';
  return `<button class="share-btn revoke-share-btn" type="button" data-revoke-share-id="${esc(id)}" hidden aria-label="Отозвать публичную ссылку на рецепт">${iconSvg('unlink')}<span>Отозвать ссылку</span></button>`;
}
async function refreshShareLinkControls(root=document){
  const buttons=[...root.querySelectorAll('[data-revoke-share-id]')];
  if(!buttons.length) return;
  if(!cloud?.rpc || !cloudUser?.id){buttons.forEach(button=>button.hidden=true); return;}
  await Promise.all(buttons.map(async button=>{
    try{
      const {data,error}=await cloud.rpc('get_my_shared_recipe_code',{p_recipe_id:String(button.dataset.revokeShareId)});
      if(error) throw error;
      button.hidden=!/^[A-Za-z0-9_-]{12}$/.test(String(data||''));
    }catch(error){button.hidden=true; console.warn('Share link status check failed',error);}
  }));
}
async function revokeShortRecipeLink(id,button=null){
  if(!cloud?.rpc || !cloudUser?.id) return false;
  if(!confirm('Отозвать публичную ссылку на этот рецепт? У получателей она перестанет открываться.')) return false;
  try{
    if(button) button.disabled=true;
    const {data,error}=await cloud.rpc('revoke_shared_recipe',{p_recipe_id:String(id)});
    if(error) throw error;
    if(data){
      document.querySelectorAll('[data-revoke-share-id]').forEach(item=>{if(item.dataset.revokeShareId===String(id)) item.hidden=true;});
      vibe([10,18,10]);
      return true;
    }
    return false;
  }catch(error){console.warn('Share link revoke failed',error); return false;}
  finally{if(button) button.disabled=false;}
}
function renderRecipeInteractions(root=document){
  root.querySelectorAll('[data-open]').forEach(btn=>btn.onclick=()=>openRecipe(btn.dataset.open,btn.dataset.source||'base'));
  root.querySelectorAll('[data-like-id]').forEach(btn=>btn.onclick=event=>{event.preventDefault();event.stopPropagation();toggleRecipeLike(btn.dataset.likeId,btn.dataset.likeSource||'base');});
  root.querySelectorAll('[data-share-id]').forEach(btn=>btn.onclick=event=>{event.preventDefault();event.stopPropagation();copyRecipeLink(btn.dataset.shareId,btn.dataset.shareSource||'base');});
  root.querySelectorAll('[data-revoke-share-id]').forEach(btn=>btn.onclick=event=>{event.preventDefault();event.stopPropagation();revokeShortRecipeLink(btn.dataset.revokeShareId,btn);});
  root.querySelectorAll('[data-edit-base]').forEach(btn=>btn.onclick=event=>{event.preventDefault();event.stopPropagation();openBaseRecipeEditor(btn.dataset.editBase);});
  root.querySelectorAll('[data-reset-base]').forEach(btn=>btn.onclick=event=>{event.preventDefault();event.stopPropagation();resetBaseRecipeToOriginal(btn.dataset.resetBase);});
  refreshLikeButtons(root);
  refreshShareLinkControls(root);
}

const encyclopediaItems=[
  {type:'Посуда',name:'Кастрюля',text:'Глубокая посуда для супов, круп, пасты, бульонов и соусов. Толстое дно помогает прогревать продукты ровнее.'},
  {type:'Посуда',name:'Сотейник',text:'Посуда с высокими бортами для тушения, соусов и блюд с жидкостью. Удобен, когда нужно часто перемешивать.'},
  {type:'Посуда',name:'Сковорода',text:'Подходит для обжаривания, быстрого прогрева и получения румяной корочки. Важно хорошо разогревать поверхность.'},
  {type:'Посуда',name:'Форма для запекания',text:'Керамическая, стеклянная или металлическая форма для духовки. Материал влияет на скорость нагрева и румяность.'},
  {type:'Посуда',name:'Вок',text:'Глубокая сковорода с округлыми стенками для быстрого обжаривания небольших порций. Продукты постоянно перемещают от горячего центра к менее нагретым краям.'},
  {type:'Посуда',name:'Казан',text:'Толстостенная посуда с округлым дном для плова, тушения и длительного томления. Хорошо удерживает и равномерно распределяет тепло.'},
  {type:'Посуда',name:'Жаровня',text:'Тяжёлая глубокая посуда с крышкой для обжаривания и последующего запекания или тушения. Подходит для крупных кусков мяса и птицы.'},
  {type:'Посуда',name:'Гриль-сковорода',text:'Сковорода с рельефным дном, которое оставляет полосы и отводит часть жира. Для выраженной корочки поверхность предварительно хорошо разогревают.'},
  {type:'Посуда',name:'Паровая корзина',text:'Перфорированная вставка из металла или бамбука для приготовления над кипящей водой. Продукты не должны соприкасаться с жидкостью.'},
  {type:'Посуда',name:'Ступка с пестиком',text:'Инструмент для растирания специй, трав, чеснока и паст. Растирание раскрывает эфирные масла лучше, чем грубое измельчение ножом.'},
  {type:'Посуда',name:'Кокотница',text:'Небольшая порционная жаропрочная форма для жюльена, запечённых яиц, суфле и горячих закусок.'},
  {type:'Посуда',name:'Таджин',text:'Керамическая посуда с высокой конической крышкой. Пар конденсируется на стенках и возвращается к продуктам, сохраняя влагу.'},
  {type:'Посуда',name:'Утятница',text:'Продолговатая толстостенная жаровня для птицы, мяса и овощей. Плотная крышка поддерживает влажную среду при длительном приготовлении.'},
  {type:'Посуда',name:'Кондитерское кольцо',text:'Форма без дна для выпечки коржей, сборки муссовых тортов и аккуратной порционной подачи. Устанавливается на противень или подложку.'},
  {type:'Оборудование',name:'Духовой шкаф',text:'Даёт сухой равномерный жар для выпечки, запекания овощей, мяса и рыбы. Конвекция помогает выровнять температуру.'},
  {type:'Оборудование',name:'Мультиварка',text:'Поддерживает стабильный нагрев для круп, тушения и томления. Полезна для блюд, которым нужно время без постоянного контроля.'},
  {type:'Оборудование',name:'Блендер',text:'Измельчает, взбивает и делает пюре, супы-кремы, соусы и напитки. Для горячих смесей важна термостойкая чаша или погружная насадка.'},
  {type:'Оборудование',name:'Кухонные весы',text:'Нужны для точных граммовок, выпечки и расчёта КБЖУ. Функция тары позволяет взвешивать продукты прямо в миске.'},
  {type:'Оборудование',name:'Планетарный миксер',text:'Одновременно вращает насадку и ведёт её по окружности чаши. Равномерно замешивает тесто, взбивает белки, сливки и кремы.'},
  {type:'Оборудование',name:'Кухонный комбайн',text:'Нарезает, натирает, измельчает и замешивает с помощью сменных насадок. Размер чаши и допустимая нагрузка определяют объём одной партии.'},
  {type:'Оборудование',name:'Погружной блендер',text:'Измельчает продукт непосредственно в кастрюле или высоком стакане. Насадку держат погружённой, чтобы не разбрызгивать горячую смесь.'},
  {type:'Оборудование',name:'Кулинарный термометр',text:'Показывает температуру внутри продукта, масла, сиропа или крема. Щуп вводят в самую толстую часть, не касаясь кости и стенок посуды.'},
  {type:'Оборудование',name:'Скороварка',text:'Готовит под повышенным давлением, поэтому вода кипит при более высокой температуре. Сокращает время приготовления бобовых, бульонов и жёсткого мяса.'},
  {type:'Оборудование',name:'Су-вид',text:'Термостат поддерживает точную температуру водяной бани. Продукт готовят в герметичном пакете, а затем при необходимости быстро обжаривают.'},
  {type:'Оборудование',name:'Дегидратор',text:'Медленно удаляет влагу при невысокой температуре. Используется для фруктов, овощей, трав, пастилы и вяленых продуктов.'},
  {type:'Оборудование',name:'Мясорубка',text:'Измельчает мясо, рыбу и овощи через решётку выбранного диаметра. Для чистого среза продукты и металлические детали предварительно охлаждают.'},
  {type:'Оборудование',name:'Индукционная панель',text:'Нагревает совместимую посуду электромагнитным полем. Быстро меняет мощность и почти не нагревает свободную поверхность конфорки.'},
  {type:'Оборудование',name:'Вакууматор',text:'Удаляет воздух и герметично запаивает пакет. Используется для су-вида, порционного хранения и защиты продуктов от окисления.'},
  {type:'Техники',name:'Бланширование',text:'Короткое погружение продукта в кипящую воду с последующим охлаждением. Сохраняет цвет овощей и помогает снять кожицу.'},
  {type:'Техники',name:'Пассерование',text:'Мягкий прогрев овощей на умеренном огне без сильной корочки. Раскрывает вкус лука, моркови, специй и томатной основы.'},
  {type:'Техники',name:'Тушение',text:'Приготовление под крышкой с небольшим количеством жидкости. Продукты становятся мягкими и насыщаются соусом.'},
  {type:'Техники',name:'Деглазирование',text:'Добавление жидкости на горячую сковороду после жарки, чтобы растворить поджаристые соки и сделать основу соуса.'},
  {type:'Техники',name:'Поширование',text:'Бережное приготовление в жидкости при 70–85°C без активного кипения. Подходит для яиц, рыбы, птицы и фруктов.'},
  {type:'Техники',name:'Припускание',text:'Продукт готовят под крышкой в небольшом количестве жидкости или собственном соку. Способ сохраняет форму и даёт концентрированный отвар.'},
  {type:'Техники',name:'Обжаривание',text:'Быстрая обработка на хорошо разогретой поверхности с небольшим количеством жира. Между кусками оставляют пространство, чтобы они жарились, а не тушились.'},
  {type:'Техники',name:'Карамелизация',text:'Нагрев сахаров до появления золотистого цвета и сложного аромата. Процесс происходит в сахарном сиропе и на поверхности овощей, фруктов или мяса.'},
  {type:'Техники',name:'Темперирование',text:'Постепенное выравнивание температуры компонентов. Горячую жидкость вводят в яйца небольшими порциями, а шоколад нагревают и охлаждают по заданной схеме.'},
  {type:'Техники',name:'Ферментация',text:'Преобразование продукта микроорганизмами или ферментами. Требует чистой посуды, подходящей температуры, времени и контроля количества соли.'},
  {type:'Техники',name:'Конфи',text:'Медленное приготовление при невысокой температуре в жире или концентрированном сахарном сиропе. Продукт остаётся сочным и приобретает насыщенный вкус.'},
  {type:'Техники',name:'Су-вид',text:'Длительное приготовление герметично упакованного продукта в воде с точно заданной температурой. После обработки мясо или рыбу быстро подрумянивают.'},
  {type:'Техники',name:'Складывание смеси',text:'Деликатное соединение лёгкой и плотной масс движениями лопатки снизу вверх. Так сохраняют воздух во взбитых белках, сливках и муссах.'},
  {type:'Техники',name:'Шоковое охлаждение',text:'Быстрое снижение температуры продукта с помощью ледяной воды или интенсивного холода. Останавливает приготовление и сокращает время в опасном температурном диапазоне.'},
  {type:'Термины',name:'Al dente',text:'Степень готовности пасты или овощей, когда продукт уже мягкий, но сохраняет лёгкое сопротивление при укусе.'},
  {type:'Термины',name:'Редуцирование',text:'Уваривание жидкости для концентрации вкуса и густоты. Так получают плотные соусы, сиропы и насыщенные бульоны.'},
  {type:'Термины',name:'Расстойка',text:'Отдых дрожжевого теста перед выпечкой, во время которого оно увеличивается в объёме и становится воздушнее.'},
  {type:'Термины',name:'Эмульсия',text:'Смесь жидкости и жира, удержанная вместе перемешиванием или стабилизатором. Примеры: майонез, винегрет, голландез.'},
  {type:'Термины',name:'Mise en place',text:'Предварительная организация работы: все продукты отмерены, нарезаны и размещены рядом, а оборудование подготовлено до начала приготовления.'},
  {type:'Термины',name:'Брунуаз',text:'Очень мелкая кубическая нарезка овощей со стороной примерно 2–3 мм. Используется для гарниров, супов и аккуратных соусов.'},
  {type:'Термины',name:'Жюльен',text:'Тонкая нарезка продукта соломкой. Для овощей обычно ориентируются на длину 4–5 см и толщину около 2 мм.'},
  {type:'Термины',name:'Ру',text:'Смесь муки и жира, прогретая до нужного цвета. Используется для загущения бешамеля, велюте, подлив и супов.'},
  {type:'Термины',name:'Фонд',text:'Концентрированная основа из костей, мяса, рыбы или овощей. После варки её процеживают и используют для супов и соусов.'},
  {type:'Термины',name:'Букет гарни',text:'Связка ароматных трав, которую кладут в бульон или рагу и удаляют перед подачей. Часто включает тимьян, лавровый лист и петрушку.'},
  {type:'Термины',name:'Умами',text:'Один из основных вкусов, связанный с глутаматами и некоторыми нуклеотидами. Особенно выражен в выдержанном сыре, грибах, томатах, водорослях и ферментированных продуктах.'},
  {type:'Термины',name:'Наппе',text:'Консистенция соуса, при которой он покрывает ложку ровным слоем. Проведённая пальцем дорожка не должна сразу затягиваться.'},
  {type:'Термины',name:'Альбумин',text:'Белок, который может выступать белыми каплями на поверхности рыбы при сильном или длительном нагреве. Умеренная температура уменьшает его выделение.'},
  {type:'Термины',name:'Автолиз',text:'Отдых смеси муки и воды до активного замеса. За это время мука увлажняется, а тесто становится более растяжимым.'},
  {type:'Питание',name:'FODMAP (ФОДМАП)',text:'Группа короткоцепочечных углеводов, которые у некоторых людей усваиваются не полностью и могут усиливать симптомы синдрома раздражённого кишечника. Реакция индивидуальна: ограничение и возвращение продуктов лучше проводить вместе с врачом или диетологом.'},
  {type:'Питание',name:'Светофор FODMAP',text:'Зелёный означает обычно низкое содержание FODMAP, жёлтый — содержание зависит от размера порции, красный — обычно высокое. Оценка относится к порции, поэтому один и тот же продукт при другом количестве может перейти в другую группу.'},
  {type:'Питание',name:'Как пользоваться отметками FODMAP',text:'Цветные отметки рядом с ингредиентами служат ориентиром, а не диагнозом. Проверяйте индивидуальную переносимость и актуальные порции в лабораторно проверенном справочнике Monash University; не исключайте целые группы продуктов надолго без специалиста.'}
];
function setTheme(){
  const isDark=state.theme==='dark';
  document.body.classList.toggle('dark',isDark);
  document.documentElement.classList.toggle('dark',isDark);
  const tb=$('#themeBtn');
  if(tb){
    if(!tb.querySelector('.room-switch')) tb.innerHTML=ambientThemeIcon(state.theme);
    const switcher=tb.querySelector('.room-switch');
    if(switcher){
      switcher.classList.toggle('is-on',isDark);
      switcher.classList.toggle('is-off',!isDark);
    }
    tb.classList.toggle('is-dark',isDark);
    tb.setAttribute('aria-pressed',String(isDark));
    tb.setAttribute('aria-label', isDark?'Включить светлую тему':'Включить тёмную тему');
    tb.setAttribute('title', isDark?'Светлая тема':'Тёмная тема');
  }
  const themeMeta=document.querySelector('meta[name="theme-color"]');
  if(themeMeta) themeMeta.setAttribute('content', isDark?'#0c1a33':'#FAF4E6');
  const iconPng=document.querySelector('link[rel="icon"][type="image/png"]');
  if(iconPng) iconPng.setAttribute('href', isDark?'./assets/icons/favicon-dark-32.png':'./assets/icons/favicon-32.png');
  const appleIcon=document.querySelector('link[rel="apple-touch-icon"]');
  if(appleIcon) appleIcon.setAttribute('href', isDark?'./assets/icons/apple-touch-icon-dark.png':'./assets/icons/apple-touch-icon.png');
  const brandIcon=$('.brand-app-icon');
  if(brandIcon){
    const brandSrc=isDark?'./assets/icons/icon-dark-192.png':'./assets/icons/icon-192.png';
    if(brandIcon.getAttribute('src')!==brandSrc) brandIcon.setAttribute('src',brandSrc);
  }
  updateHomeActionIcons();
  updateCountryImages();
}
function catalogNutritionFromIngredients(recipe){
  const lines=Array.isArray(recipe?.ingredients)?recipe.ingredients:[];
  if(!lines.length) return null;
  const products=[];
  let measurable=0,matched=0;
  for(const line of lines){
    const parsed=parseIngredientAmount(line);
    if(!(parsed.amount>0)||parsed.unit==='text') continue;
    if(/деревянн(?:ые|ая)\s+шпажк|кулинарн(?:ая|ые)\s+нит|кости\s+и\s+каркас/iu.test(parsed.name)) continue;
    measurable+=1;
    const reference=foodNutritionEntry(parsed.name);
    if(!reference) continue;
    const resolved=productWeightFor(parsed.name,parsed.amount,parsed.unit);
    if(!(resolved.weight>0)) continue;
    matched+=1;
    products.push({
      name:parsed.name,amount:parsed.amount,unit:parsed.unit,weight:resolved.weight,gramsPerUnit:resolved.gramsPerUnit,
      kcal:reference.kcal,protein:reference.protein,fat:reference.fat,carbs:reference.carbs,
      fdcId:reference.fdc_id||null,nutritionSource:reference.source_name||'USDA FoodData Central',nutritionAuto:true,ingredientLinked:true
    });
  }
  if(!matched||matched<Math.min(2,measurable)||matched/Math.max(1,measurable)<.65) return null;
  const total=products.reduce((sum,product)=>{const value=nutritionForProduct(product);sum.kcal+=value.kcal;sum.protein+=value.protein;sum.fat+=value.fat;sum.carbs+=value.carbs;return sum;},{kcal:0,protein:0,fat:0,carbs:0});
  const servings=Math.max(1,Number(recipe.servings)||1);
  const rounded=value=>Number(value.toFixed(1));
  recipe.ingredientNutrition=products;
  recipe.ingredientWeight=rounded(products.reduce((sum,product)=>sum+Number(product.weight||0),0));
  recipe.nutritionTotal=Object.fromEntries(Object.entries(total).map(([key,value])=>[key,rounded(value)]));
  recipe.nutritionCalculated=true;
  return Object.fromEntries(Object.entries(total).map(([key,value])=>[key,rounded(value/servings)]));
}
function nutritionOf(r){
  if(r.nutrition) return r.nutrition;
  const calculated=catalogNutritionFromIngredients(r);
  if(calculated){r.nutrition=calculated;return calculated;}
  const defaults={"Завтраки":{kcal:290,protein:13,fat:12,carbs:31},"Закуски":{kcal:220,protein:8,fat:10,carbs:24},"Салаты":{kcal:180,protein:6,fat:10,carbs:16},"Супы":{kcal:210,protein:11,fat:7,carbs:24},"Горячие блюда":{kcal:430,protein:24,fat:17,carbs:39},"Выпечка":{kcal:340,protein:8,fat:12,carbs:48},"Десерты":{kcal:360,protein:6,fat:15,carbs:49},"Фрукты":{kcal:70,protein:1,fat:.3,carbs:17},"Морепродукты":{kcal:280,protein:25,fat:11,carbs:13},"Гарниры":{kcal:250,protein:5,fat:6,carbs:42},"Соусы":{kcal:95,protein:2,fat:7,carbs:6}};
  r.nutritionEstimated=true;
  r.nutrition=defaults[r.category]||{kcal:300,protein:10,fat:10,carbs:30};
  return r.nutrition;
}
function fmt(v){const x=Math.round(v*10)/10; return Number.isInteger(x)?String(x):x.toFixed(1).replace('.0','')}
function plural(n,a){n=Math.abs(n)%100; const n1=n%10; if(n>10&&n<20)return a[2]; if(n1>1&&n1<5)return a[1]; if(n1===1)return a[0]; return a[2];}
function updateHomeMeta(){
  const c=$('#myRecipesCount'); if(c) c.textContent=`${myRecipes.length} ${plural(myRecipes.length,['запись','записи','записей'])}`;
  const m=$('#myMetaCount'); if(m) m.textContent=`${myRecipes.length} ${plural(myRecipes.length,['рецепт','рецепта','рецептов'])}`;
  const mealDays=mealPlanDayCount(); const mc=$('#mealCalendarCount'); if(mc) mc.textContent=`${mealDays} ${plural(mealDays,['день','дня','дней'])}`;
  const mm=$('#mealMetaCount'); if(mm) mm.textContent=`${mealDays} ${plural(mealDays,['день','дня','дней'])}`;
  const liked=normalizeLikedRecipes(state.likedRecipes).map(resolveRecipeRef).filter(Boolean).length;
  const lc=$('#likedRecipesCount'); if(lc) lc.textContent=`${liked} ${plural(liked,['блюдо','блюда','блюд'])}`;
  const lm=$('#likedMetaCount'); if(lm) lm.textContent=`${liked} ${plural(liked,['блюдо','блюда','блюд'])}`;
}
function updateStats(){const catalogue=catalogRecipes(); const sr=$('#statRecipes'); if(sr) sr.textContent=catalogue.length+myRecipes.length; const sc=$('#statCountries'); if(sc) sc.textContent=uniqueCountries().length; const st=$('#statTypes'); if(st) st.textContent=categoryOrder.length; const sh=$('#statHealthy'); if(sh) sh.textContent=catalogue.filter(r=>r.healthy).length; updateHomeMeta();}
function flushMealDraftBeforeNavigation(){
  if(mealDraftDate&&mealDraft){
    try{persistMealDraft({sync:true,render:false,status:false});}catch(e){console.warn('Meal draft flush failed',e)}
  }
}
let routeHistory=[], navBackMode=false;
const ROUTE_IDS=['home','country','myview','mealview','likedview','encyclopediaview'];
function rememberRouteForBack(nextRoute){
  const current=state.route||'home';
  if(navBackMode || !current || current===nextRoute || !ROUTE_IDS.includes(current)) return;
  if(routeHistory[routeHistory.length-1]!==current) routeHistory.push(current);
  if(routeHistory.length>12) routeHistory=routeHistory.slice(-12);
}
function restoreRoute(route){
  if(route==='country'){showView('country','page'); renderCountry(state.country||uniqueCountries()[0]); return;}
  if(route==='myview'){showView('myview','page'); return;}
  if(route==='mealview'){showView('mealview','page'); return;}
  if(route==='likedview'){showView('likedview','page'); return;}
  if(route==='encyclopediaview'){showView('encyclopediaview','page'); return;}
  showView('home','page');
}
function goBackPage(){
  flushMealDraftBeforeNavigation();
  if($('#mealPickerModal') && !$('#mealPickerModal').hidden){closeMealDishPicker(); return;}
  if($('#modal')?.classList.contains('open')){closeModalInstant(); return;}
  const editor=$('#myRecipeEditor');
  if(state.route==='myview' && editor && !editor.hidden){showMyLibrary(); return;}
  const prev=routeHistory.pop() || 'home';
  navBackMode=true;
  try{restoreRoute(prev);}finally{navBackMode=false;}
  vibe(14);
}
function showView(id,anim='fade'){flushMealDraftBeforeNavigation();rememberRouteForBack(id);$$('.view').forEach(v=>{v.classList.remove('active','anim-in','page-enter','page-leave');v.style.display='';}); const target=$('#'+id); if(!target){console.warn('View not found',id);return;} target.style.display=''; target.classList.add('active'); if(anim==='page') target.classList.add('page-enter'); else target.classList.add('anim-in'); state.route=id; saveState(); if(id==='mealview') requestAnimationFrame(()=>renderMealCalendar()); else if(id==='home') requestAnimationFrame(()=>updateHomeMeta()); if(id==='myview') requestAnimationFrame(()=>renderMyRecipes()); if(id==='likedview') requestAnimationFrame(()=>renderLikedRecipes()); if(id==='encyclopediaview') requestAnimationFrame(()=>renderEncyclopedia()); if(cloudUser&&['myview','mealview','likedview'].includes(id)) ensureCloudLibraryLoaded({silent:true}).catch(error=>console.warn('Personal library load failed',error)); window.scrollTo({top:0,behavior:'smooth'});}
function renderCountries(){
  const g=$('#countryGrid'); if(!g) return;
  const previousCountry=g.dataset.activeCountry||'';
  g.innerHTML='';
  uniqueCountries().forEach(c=>{
    const th=theme(c), list=catalogRecipesForCountry(c), cats=orderedCategories(list).length;
    const b=document.createElement('button');
    b.className='country-card country-card-uniform country-slide';
    b.style.setProperty('--country-bg', th.bg);
    b.dataset.country=c;
    b.innerHTML=`<div class="country-main"><div class="country-art-frame">${countryImageHtml(c)}</div><div class="country-copy"><h3>${esc(c)}</h3><p>${esc(th.note)}</p></div></div><div class="country-bottom"><span>${list.length} рецептов • ${cats} категорий</span><span class="arrow country-open-arrow" aria-hidden="true">${iconSvg('arrow')}</span></div>`;
    b.onclick=()=>showCountry(c);
    g.appendChild(b);
  });
  setupCountryCarousel(previousCountry);
}
function setupCountryCarousel(previousCountry=''){
  const g=$('#countryGrid'); if(!g) return;
  const prev=$('#cuisinePrev'), next=$('#cuisineNext');
  const cards=[...g.querySelectorAll('.country-card')];
  const updateFocus=()=>{
    if(!cards.length) return;
    const viewport=g.getBoundingClientRect();
    const mid=viewport.left+viewport.width/2;
    let active=null;
    cards.forEach(card=>{
      const rect=card.getBoundingClientRect();
      const center=rect.left+rect.width/2;
      const distance=Math.abs(center-mid);
      const ratio=Math.min(1,distance/(Math.max(1,rect.width)*1.35));
      card.classList.toggle('is-near',ratio<.62);
      if(!active || distance<active.distance) active={card,distance};
    });
    cards.forEach(card=>card.classList.toggle('is-active',card===active?.card));
    if(active?.card) g.dataset.activeCountry=active.card.dataset.country||'';
  };
  const scrollByCard=dir=>{
    const card=g.querySelector('.country-card');
    const step=card?card.getBoundingClientRect().width+18:Math.max(260,g.clientWidth*.8);
    g.scrollBy({left:dir*step,behavior:'smooth'});
  };
  g._countryCarouselUpdateFocus=updateFocus;
  g._countryCarouselScrollByCard=scrollByCard;
  if(prev) prev.onclick=()=>g._countryCarouselScrollByCard?.(-1);
  if(next) next.onclick=()=>g._countryCarouselScrollByCard?.(1);
  if(g.dataset.bound!=='1'){
    g.dataset.bound='1';
    g.addEventListener('scroll',()=>{
      if(window.__countryScrollRaf) cancelAnimationFrame(window.__countryScrollRaf);
      window.__countryScrollRaf=requestAnimationFrame(()=>g._countryCarouselUpdateFocus?.());
    },{passive:true});
    window.addEventListener('resize',()=>{
      if(window.__countryResizeRaf) cancelAnimationFrame(window.__countryResizeRaf);
      window.__countryResizeRaf=requestAnimationFrame(()=>g._countryCarouselUpdateFocus?.());
    },{passive:true});
  }
  if(previousCountry) requestAnimationFrame(()=>{
    const escapeCss=window.CSS?.escape || (value=>String(value).replace(/["\\]/g,'\\$&'));
    g.querySelector(`[data-country="${escapeCss(previousCountry)}"]`)?.scrollIntoView({inline:'center',block:'nearest'});
    requestAnimationFrame(updateFocus);
  });
  requestAnimationFrame(updateFocus);
}
function refreshCountryCategory(country,anchorTop){renderCountry(country); const pinMenu=()=>{const choice=$('#categoryChoice'); if(!choice) return; const delta=choice.getBoundingClientRect().top-anchorTop; if(Math.abs(delta)>.5) window.scrollTo({top:Math.max(0,window.scrollY+delta),left:0,behavior:'auto'});}; pinMenu(); requestAnimationFrame(pinMenu);}
function renderCategoryTiles(country){const list=catalogRecipesForCountry(country), cats=orderedCountryCategories(list); const choice=$('#categoryChoice'); choice.innerHTML=''; cats.forEach(cat=>{const count=list.filter(r=>r.category===cat).length; const a=document.createElement('button'); a.className='cat-tile'+(state.filterCat===cat?' active':'')+(state.filterCat && state.filterCat!==cat?' dim':''); a.innerHTML=`<div><strong>${cat}</strong><span>${count} ${plural(count,['блюдо','блюда','блюд'])}</span></div>`; a.onclick=()=>{vibe(10); const anchorTop=choice.getBoundingClientRect().top; state.filterCat = state.filterCat===cat ? null : cat; saveState(); refreshCountryCategory(country,anchorTop);}; choice.appendChild(a);}); $('#catControl').hidden=!state.filterCat;}
function recipeCard(r){const badge=r.healthy?'<span class="recipe-badge">Полезный</span>':''; const origin=originLabel(r); const source=r.source==='custom'?'custom':'base'; return `<article class="recipe-card recipe-card-with-like">${badge}<button class="recipe-open-card" data-open="${esc(r.id)}" data-source="${source}" type="button"><h3>${esc(r.title)}</h3>${origin?`<div class="recipe-origin">${esc(origin)}</div>`:''}<div class="recipe-meta"><span>${esc(r.time||'—')}</span><span>${r.servings||1} порц.</span><span>${esc(r.difficulty||'легко')}</span></div></button>${likeButtonHtml(r.id,source,'')}</article>`}
const productTagSystem=window.TABLE_BOOK_PRODUCT_TAGS||null;
function normalizePantryTags(tags){return [...new Set((Array.isArray(tags)?tags:[]).flatMap(value=>String(value||'').split(/[,;\n]+/)).map(value=>productTagSystem?.resolve(value)||normalizePortionName(value)).filter(value=>value.length>1))].slice(0,12);}
function pantryRecipeScore(recipe,tags){
  if(productTagSystem){const result=productTagSystem.recipeMatches(recipe,tags); return {matched:result.matched.length,all:result.all,tags:result.tags};}
  const ingredients=[...(Array.isArray(recipe?.ingredients)?recipe.ingredients:[]),...(Array.isArray(recipe?.ingredientNutrition)?recipe.ingredientNutrition.map(item=>item?.name||''):[])].map(normalizePortionName);
  const matched=tags.filter(tag=>ingredients.some(name=>name===tag));
  return {matched:matched.length,all:tags.length>0&&matched.length===tags.length};
}
function addPantryTags(value){const next=normalizePantryTags([...(state.pantryTags||[]),value]); state.pantryTags=next; const input=$('#pantryInput'); if(input) input.value=''; saveState({sync:false}); renderPantryFinder();}
function renderPantryFinder(){const tagsBox=$('#pantryTags'),results=$('#pantryResults'),note=$('#pantryNote'); if(!tagsBox||!results) return; const tags=normalizePantryTags(state.pantryTags); state.pantryTags=tags; tagsBox.hidden=!tags.length; results.hidden=!tags.length; if(note) note.hidden=!tags.length; tagsBox.innerHTML=tags.map(tag=>`<button class="pantry-tag" type="button" data-remove-pantry="${esc(tag)}"><span>${esc(tag)}</span><b aria-hidden="true">×</b></button>`).join(''); tagsBox.querySelectorAll('[data-remove-pantry]').forEach(btn=>btn.onclick=()=>{state.pantryTags=tags.filter(tag=>tag!==btn.dataset.removePantry);saveState({sync:false});renderPantryFinder();}); if(!tags.length){results.innerHTML='';if(note) note.textContent='';return;} const ranked=allRecipeOptions().map(recipe=>({recipe,...pantryRecipeScore(recipe,tags)})).filter(item=>item.matched>0).sort((a,b)=>Number(b.all)-Number(a.all)||b.matched-a.matched||(a.recipe.title||'').localeCompare(b.recipe.title||'','ru')); const exact=ranked.filter(item=>item.all),shown=(exact.length?exact:ranked).slice(0,12); if(note) note.textContent=exact.length?`Найдено ${exact.length} ${plural(exact.length,['блюдо','блюда','блюд'])} со всеми выбранными продуктами.`:ranked.length?'Точного совпадения нет — показаны ближайшие варианты.':'По выбранным продуктам совпадений пока нет.'; results.innerHTML=shown.map(item=>recipeCard(item.recipe)).join(''); renderRecipeInteractions(results);}
function normalizePantryFinderMarkup(){let finder=$('#pantryFinder'); if(finder?.tagName==='DETAILS'){const section=document.createElement('section'),body=finder.querySelector('.pantry-finder-body'); section.className='pantry-finder'; section.id='pantryFinder'; section.setAttribute('aria-label','Что приготовить из продуктов'); ['.pantry-entry','#pantryTags','#pantryNote','#pantryResults'].forEach(selector=>{const node=body?.querySelector(selector);if(node)section.appendChild(node);}); finder.replaceWith(section); finder=section;} const input=$('#pantryInput'); if(input){input.removeAttribute('list');input.type='text';input.inputMode='search';input.autocomplete='off';input.setAttribute('aria-autocomplete','none');} $('#pantryProductTagOptions')?.remove(); return finder;}
function bindPantryFinder(){normalizePantryFinderMarkup(); const input=$('#pantryInput'),add=$('#pantryAdd'); if(add){add.textContent='Найти';add.onclick=()=>addPantryTags(input?.value||'');} if(input) input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();addPantryTags(input.value);}}; renderPantryFinder();}
function ingredientGroupedRecipeCards(items){return recipesByIngredientGroup(items).map(({group,recipes:groupRecipes})=>`<section class="ingredient-group-block"><div class="ingredient-group-head"><h3>${esc(group)}</h3><span>${groupRecipes.length} ${plural(groupRecipes.length,['блюдо','блюда','блюд'])}</span></div><div class="recipe-grid">${groupRecipes.map(recipeCard).join('')}</div></section>`).join('');}
let countryRecipeObserver=null;
function renderCountryRecipeSection(section){
  if(!section || section.dataset.rendered==='1') return;
  const category=section._category, items=section._items||[];
  section.dataset.rendered='1';
  section.style.minHeight='';
  section.innerHTML=items.length?`<div class="cat-line"><h2>${category}</h2></div>${ingredientGroupedRecipeCards(items)}`:`<div class="cat-line"><h2>${category}</h2></div><div class="empty-box">Фруктовые позиции можно добавить из «Моих рецептов» при составлении меню.</div>`;
  renderRecipeInteractions(section);
  section._category=null;
  section._items=null;
}
function observeCountryRecipeSection(section){
  if(!('IntersectionObserver' in window)){renderCountryRecipeSection(section);return;}
  if(!countryRecipeObserver) countryRecipeObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){countryRecipeObserver.unobserve(entry.target);renderCountryRecipeSection(entry.target);}}),{rootMargin:'180px 0px'});
  countryRecipeObserver.observe(section);
}
function renderCountry(country){
  state.country=country;
  saveState();
  const th=theme(country), list=catalogRecipesForCountry(country), cats=orderedCountryCategories(list);
  $('#countryHead').style.setProperty('--head-bg', th.bg);
  $('#countryTitle').textContent=country;
  $('#countryNote').textContent=th.note;
  $('#countryMeta').innerHTML=`<span class="pill">${list.length} рецептов</span><span class="pill">${cats.length} категорий</span>`;
  renderCategoryTiles(country);
  if(countryRecipeObserver){countryRecipeObserver.disconnect();countryRecipeObserver=null;}
  const wrap=$('#countryRecipes');
  wrap.innerHTML='';
  const showCats=state.filterCat?[state.filterCat]:cats;
  showCats.forEach((cat,index)=>{
    const items=list.filter(r=>r.category===cat), sec=document.createElement('section');
    sec.className='cat-section';
    sec.id='cat-'+slug(cat);
    sec._category=cat;
    sec._items=items;
    if(showCats.length===1 || index===0) renderCountryRecipeSection(sec);
    else{
      sec.classList.add('cat-section-lazy');
      sec.style.minHeight=`${Math.min(1400,Math.max(180,items.length*150+120))}px`;
      sec.innerHTML=`<div class="cat-line"><h2>${cat}</h2></div>`;
    }
    wrap.appendChild(sec);
    if(sec.dataset.rendered!=='1') observeCountryRecipeSection(sec);
  });
  const countryView=$('#country');
  if(state.route!=='country' || !countryView?.classList.contains('active')) showView('country');
}
function slug(s){return s.toLowerCase().replace(/[^a-zа-яё0-9]+/gi,'-').replace(/^-|-$/g,'')}
function showCountry(c){vibe(12); renderCountry(c);}
function goHomeWithFlip(){flushMealDraftBeforeNavigation(); routeHistory=[]; const current=$('#'+(state.route||'home'))||$('.view.active')||$('#home'); if(current.id==='home'){showView('home');return;} current.classList.remove('active'); current.style.display='block'; current.classList.add('page-leave'); const home=$('#home'); home.style.display='block'; home.classList.add('active','page-enter'); vibe(16); setTimeout(()=>{current.classList.remove('page-leave'); current.style.display='none'; home.classList.remove('page-enter'); showView('home');},560)}


const MEAL_SLOTS=[['breakfast','Завтрак'],['lunch','Обед'],['snack','Перекус'],['dinner','Ужин'],['extraSnack','Дополнительный снек']];
let mealDraftDate=null, mealDraft=null, mealDayEditMode=true, mealDraftDirty=false;
const MEAL_MY_RECIPES_CATEGORY='__my_recipes__';
let mealPickerDialog={slot:null,category:null,country:null,step:'category',query:''};
let mealPlanCleanedOnce=false;
const mealMonthCache=new Map();
const mealMonthLoads=new Map();
const cloudMealSaveTimers=new Map();
let lastCloudQueuedStateSignature=cloudQueueStateSignature();
function esc(value){return String(value??'').replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));}
function pad2(n){return String(n).padStart(2,'0')}
function localDateKey(d=new Date()){return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`}
function dateFromKey(key){const [y,m,d]=String(key||'').split('-').map(Number); return new Date(y||new Date().getFullYear(),(m||1)-1,d||1)}
function validDateKey(value){return /^\d{4}-\d{2}-\d{2}$/.test(String(value||''));}
function monthKeyFromDate(d){return `${d.getFullYear()}-${pad2(d.getMonth()+1)}`}
function validMonthKey(key){return /^\d{4}-\d{2}$/.test(String(key||''));}
function monthKeyFromDayKey(key){return /^\d{4}-\d{2}-\d{2}$/.test(String(key||''))?String(key).slice(0,7):null;}
function relevantMealMonthKey(){return state.route==='mealview'&&validMonthKey(state.mealMonth)?state.mealMonth:monthKeyFromDate(new Date());}
function mealMonthRange(monthKey){
  if(!validMonthKey(monthKey)) return null;
  const [year,month]=monthKey.split('-').map(Number);
  const next=new Date(year,month,1);
  return {start:`${monthKey}-01`,end:`${monthKeyFromDate(next)}-01`};
}
function normalizeMealItem(item){
  const incomingId=String(item?.id||'');
  const legacyReplacementId=LEGACY_DUPLICATE_RECIPE_REFS[incomingId]||'';
  const incomingSource=legacyReplacementId?'custom':(item?.source==='custom'?'custom':'base');
  const id=canonicalRecipeId(legacyReplacementId||incomingId,incomingSource);
  const replacementId=id!==incomingId?id:'';
  const source=incomingSource;
  const incomingBadge=String(item?.mealBadge||'').trim();
  const legacyWorkLunch=incomingId==='week-20260824-lunch-turkey-container'||incomingId==='week-20260825-lunch-chicken-container';
  return {
    id:canonicalRecipeId(id,source),source,title:replacementId?'':String(item?.title||'').trim(),
    servings:Math.max(1,Math.min(12,Math.round(Number(item?.servings)||1))),
    mealBadge:legacyWorkLunch||/контейнер\s+на\s+работу/iu.test(incomingBadge)?'Приготовлено с вечера · обед на работу':incomingBadge,
    workday:legacyWorkLunch||item?.workday===true,skipShopping:legacyWorkLunch||item?.skipShopping===true
  };
}
function mealDayIsWorkday(day){
  return MEAL_SLOTS.some(([slot])=>(day?.[slot]||[]).some(item=>item?.workday===true||/работ/.test(String(item?.mealBadge||'').toLowerCase())));
}
function normalizeMealDay(day){const out={}; MEAL_SLOTS.forEach(([slot])=>{out[slot]=Array.isArray(day?.[slot])?day[slot].map(normalizeMealItem).filter(x=>x.id):[];}); return out;}
function normalizeMealPlan(plan){
  const source=plan&&typeof plan==='object'&&!Array.isArray(plan)?plan:{};
  const out={};
  Object.keys(source).forEach(dateKey=>{
    if(!/^\d{4}-\d{2}-\d{2}$/.test(String(dateKey))) return;
    const day=normalizeMealDay(source[dateKey]);
    if(MEAL_SLOTS.some(([slot])=>day[slot].length)) out[dateKey]=day;
  });
  return out;
}
function mealPlanForMonth(plan,monthKey){
  const source=normalizeMealPlan(plan);
  const out={};
  Object.keys(source).forEach(dateKey=>{if(monthKeyFromDayKey(dateKey)===monthKey) out[dateKey]=source[dateKey];});
  return out;
}
function touchMealMonthCache(monthKey){
  if(!validMonthKey(monthKey)) return;
  if(mealMonthCache.has(monthKey)) mealMonthCache.delete(monthKey);
  mealMonthCache.set(monthKey,true);
}
function trimMealMonthCache(){
  const active=validMonthKey(state.mealMonth)?state.mealMonth:monthKeyFromDate(new Date());
  while(mealMonthCache.size>MEAL_MONTH_CACHE_LIMIT){
    const dirtyMonths=new Set((Array.isArray(state.mealDirtyDays)?state.mealDirtyDays:[]).map(monthKeyFromDayKey).filter(Boolean));
    const candidate=[...mealMonthCache.keys()].find(key=>key!==active&&!dirtyMonths.has(key));
    if(!candidate) break;
    mealMonthCache.delete(candidate);
    Object.keys(state.mealPlan||{}).forEach(dateKey=>{if(monthKeyFromDayKey(dateKey)===candidate) delete state.mealPlan[dateKey];});
  }
}
function initializeMealMonthCache(plan=state.mealPlan){
  const clean=normalizeMealPlan(plan);
  const active=validMonthKey(state.mealMonth)?state.mealMonth:monthKeyFromDate(new Date());
  const current=monthKeyFromDate(new Date());
  const months=[active,current,...Object.keys(clean).map(monthKeyFromDayKey).filter(Boolean).sort().reverse()];
  [...new Set(months)].slice(0,MEAL_MONTH_CACHE_LIMIT).forEach(touchMealMonthCache);
  const allowed=new Set(mealMonthCache.keys());
  state.mealPlan={};
  Object.keys(clean).forEach(dateKey=>{if(allowed.has(monthKeyFromDayKey(dateKey))) state.mealPlan[dateKey]=clean[dateKey];});
  trimMealMonthCache();
  return state.mealPlan;
}
function compactCachedMealPlan(plan=state.mealPlan){
  const clean=normalizeMealPlan(plan);
  if(!mealMonthCache.size) initializeMealMonthCache(clean);
  const allowed=new Set(mealMonthCache.keys());
  const out={};
  Object.keys(clean).forEach(dateKey=>{if(allowed.has(monthKeyFromDayKey(dateKey))) out[dateKey]=clean[dateKey];});
  return out;
}
function cacheMealMonth(monthKey,monthPlan,{persist=true}={}){
  if(!validMonthKey(monthKey)) return;
  const next=normalizeMealPlan(state.mealPlan);
  Object.keys(next).forEach(dateKey=>{if(monthKeyFromDayKey(dateKey)===monthKey) delete next[dateKey];});
  Object.assign(next,mealPlanForMonth(monthPlan,monthKey));
  state.mealPlan=next;
  touchMealMonthCache(monthKey);
  trimMealMonthCache();
  if(persist) saveState({sync:false,personal:true});
}
async function loadMealMonth(monthKey,{force=false,silent=true}={}){
  if(!validMonthKey(monthKey)) return false;
  if(!force && mealMonthCache.has(monthKey)){touchMealMonthCache(monthKey);return true;}
  if(mealMonthLoads.has(monthKey)) return mealMonthLoads.get(monthKey);
  const task=(async()=>{
    const cachedLocalMonth=mealPlanForMonth(mergeMealPlans(legacyMealPlanPending,state.mealPlan),monthKey);
    if(!cloud || !cloudUser){
      cacheMealMonth(monthKey,cachedLocalMonth);
      return true;
    }
    const dirtyDays=new Set(Array.isArray(state.mealDirtyDays)?state.mealDirtyDays:[]);
    const dirtyLocalMonth={};
    Object.keys(cachedLocalMonth).forEach(dateKey=>{
      if(dirtyDays.has(dateKey) || Object.prototype.hasOwnProperty.call(legacyMealPlanPending,dateKey)) dirtyLocalMonth[dateKey]=cachedLocalMonth[dateKey];
    });
    const range=mealMonthRange(monthKey);
    try{
      const {data,error}=await cloud.from(CLOUD_MEAL_TABLE)
        .select('meal_date,meal_day,updated_at')
        .eq('user_id',cloudUser.id)
        .gte('meal_date',range.start)
        .lt('meal_date',range.end)
        .order('meal_date',{ascending:true});
      if(error) throw error;
      const cloudMonth={};
      (Array.isArray(data)?data:[]).forEach(row=>{
        const dateKey=String(row?.meal_date||'').slice(0,10);
        const day=normalizeMealDay(row?.meal_day);
        if(/^\d{4}-\d{2}-\d{2}$/.test(dateKey) && mealPlanHasItems(day)) cloudMonth[dateKey]=day;
      });
      dirtyDays.forEach(dateKey=>{if(monthKeyFromDayKey(dateKey)===monthKey && !cachedLocalMonth[dateKey]) delete cloudMonth[dateKey];});
      cacheMealMonth(monthKey,mergeMealPlans(cloudMonth,dirtyLocalMonth));
      if(state.mealMonth===monthKey){renderMealCalendar();updateHomeMeta();}
      return true;
    }catch(error){
      console.warn('Meal month load failed',error);
      cacheMealMonth(monthKey,cachedLocalMonth);
      if(!silent) cloudStatus('Не удалось загрузить меню за выбранный месяц: '+cloudErrorMessage(error));
      return false;
    }
  })().finally(()=>mealMonthLoads.delete(monthKey));
  mealMonthLoads.set(monthKey,task);
  return task;
}
async function saveCloudMealDay(dateKey,day){
  if(!cloud || !cloudUser || !/^\d{4}-\d{2}-\d{2}$/.test(String(dateKey||''))) return false;
  const compact=normalizeMealDay(day);
  try{
    if(mealPlanHasItems(compact)){
      const {error}=await cloud.from(CLOUD_MEAL_TABLE).upsert({user_id:cloudUser.id,meal_date:dateKey,meal_day:compact,updated_at:new Date().toISOString()},{onConflict:'user_id,meal_date'});
      if(error) throw error;
    }else{
      const {error}=await cloud.from(CLOUD_MEAL_TABLE).delete().eq('user_id',cloudUser.id).eq('meal_date',dateKey);
      if(error) throw error;
    }
    state.mealDirtyDays=(Array.isArray(state.mealDirtyDays)?state.mealDirtyDays:[]).filter(key=>key!==dateKey);
    trimMealMonthCache();
    saveState({sync:false,personal:true});
    return true;
  }catch(error){console.warn('Meal day sync failed',error);return false;}
}
function queueCloudMealDaySave(dateKey,day){
  if(!cloud || !cloudUser) return;
  const snapshot=normalizeMealDay(day);
  clearTimeout(cloudMealSaveTimers.get(dateKey));
  cloudMealSaveTimers.set(dateKey,setTimeout(()=>{
    cloudMealSaveTimers.delete(dateKey);
    saveCloudMealDay(dateKey,snapshot);
  },650));
}
async function flushDirtyMealDays(){
  if(!cloud || !cloudUser) return false;
  const dates=[...new Set((Array.isArray(state.mealDirtyDays)?state.mealDirtyDays:[]).filter(key=>/^\d{4}-\d{2}-\d{2}$/.test(String(key))))];
  for(const dateKey of dates){
    const day=state.mealPlan?.[dateKey]||legacyMealPlanPending?.[dateKey]||normalizeMealDay(null);
    await saveCloudMealDay(dateKey,day);
  }
  return true;
}
async function migrateLegacyMealPlan(){
  const legacy=normalizeMealPlan(legacyMealPlanPending);
  const dates=Object.keys(legacy);
  if(!dates.length){try{localStorage.removeItem(STORAGE_MEAL_LEGACY_KEY);}catch(e){} return true;}
  try{localStorage.setItem(STORAGE_MEAL_LEGACY_KEY,JSON.stringify(legacy));}catch(e){}
  if(!cloud || !cloudUser) return false;
  try{
    for(let index=0;index<dates.length;index+=100){
      const rows=dates.slice(index,index+100).map(dateKey=>({user_id:cloudUser.id,meal_date:dateKey,meal_day:legacy[dateKey],updated_at:new Date().toISOString()}));
      const {error}=await cloud.from(CLOUD_MEAL_TABLE).upsert(rows,{onConflict:'user_id,meal_date'});
      if(error) throw error;
    }
    legacyMealPlanPending={};
    localStorage.removeItem(STORAGE_MEAL_LEGACY_KEY);
    state.mealStorageVersion=2;
    saveState({sync:false,personal:true});
    return true;
  }catch(error){console.warn('Legacy meal plan migration failed',error);return false;}
}
function touchMealPlan(){state.mealPlanUpdatedAt=new Date().toISOString();}
function mealPlanHasItems(day){const d=normalizeMealDay(day); return MEAL_SLOTS.some(([slot])=>d[slot].length);}
function pruneMealPlan(){
  state.mealPlan=normalizeMealPlan(state.mealPlan);
  if(Object.keys(legacyMealPlanPending).length){try{localStorage.setItem(STORAGE_MEAL_LEGACY_KEY,JSON.stringify(legacyMealPlanPending));}catch(e){}}
  initializeMealMonthCache(state.mealPlan);
  mealPlanCleanedOnce=true;
  return state.mealPlan;
}
function ensureMealPlan(){
  if(!state.mealPlan || typeof state.mealPlan!=='object' || Array.isArray(state.mealPlan)) state.mealPlan={};
  if(!mealPlanCleanedOnce) return pruneMealPlan();
  return state.mealPlan;
}
function mealPlanDayCount(){
  const plan=(state.mealPlan&&typeof state.mealPlan==='object'&&!Array.isArray(state.mealPlan))?state.mealPlan:{};
  return Object.keys(plan).length;
}
function mealPlanSignature(plan=state.mealPlan){const p=plan&&typeof plan==='object'?plan:{}; return JSON.stringify(Object.keys(p).sort().map(k=>[k,normalizeMealDay(p[k])]));}
function mergeMealPlans(localPlan,cloudPlan){
  const merged=Object.assign({},localPlan&&typeof localPlan==='object'?localPlan:{});
  const cloud=cloudPlan&&typeof cloudPlan==='object'?cloudPlan:{};
  Object.keys(cloud).forEach(dateKey=>{
    const localDay=normalizeMealDay(merged[dateKey]);
    const cloudDay=normalizeMealDay(cloud[dateKey]);
    const next={};
    MEAL_SLOTS.forEach(([slot])=>{
      const seen=new Set();
      next[slot]=[...localDay[slot],...cloudDay[slot]].filter(item=>{const key=item.source+':'+item.id; if(seen.has(key)) return false; seen.add(key); return true;});
    });
    if(MEAL_SLOTS.some(([slot])=>next[slot].length)) merged[dateKey]=next;
  });
  return merged;
}
function getRecipeByRef(ref){
  const source=ref?.source==='custom'?'custom':'base';
  const id=canonicalRecipeId(ref?.id,source);
  if(source==='custom') return myRecipes.find(recipe=>String(recipe.id)===id)||effectiveBaseRecipe(id);
  return effectiveBaseRecipe(id);
}
function recipeToMealRef(recipe){return {id:String(recipe.id),source:recipe.source==='custom'?'custom':'base',title:recipe.title||'Без названия',servings:1};}
function allRecipeOptions(){return catalogRecipes().map(r=>Object.assign({source:'base'},r)).concat(myRecipes.map(r=>Object.assign({source:'custom'},r))).sort((a,b)=>(a.category||'').localeCompare(b.category||'','ru') || (a.title||'').localeCompare(b.title||'','ru'));}
function mealCountryLabel(recipe){
  const source=recipe?.source==='custom'?'custom':'base';
  const origin=String(recipe?.origin||'').trim();
  const country=String(recipe?.country||'').trim();
  if(source==='custom') return country||origin||'Мои рецепты';
  if(country==='Средиземноморская' && origin) return origin;
  return origin||country||'Каталог';
}
function mealCountryList(slot,category){
  const selected=new Set((mealDraft?.[slot]||[]).map(item=>item.source+':'+item.id));
  const map=new Map();
  allRecipeOptions()
    .filter(r=>category==='Фрукты'||r.source!=='custom')
    .filter(r=>(r.category||'Без категории')===category)
    .filter(r=>!selected.has((r.source==='custom'?'custom':'base')+':'+r.id))
    .forEach(r=>{const c=mealCountryLabel(r); map.set(c,(map.get(c)||0)+1);});
  return Array.from(map.entries()).map(([country,count])=>({country,count})).sort((a,b)=>a.country.localeCompare(b.country,'ru'));
}

function currentMealMonthDate(){
  if(/^\d{4}-\d{2}$/.test(String(state.mealMonth||''))){const [y,m]=state.mealMonth.split('-').map(Number); return new Date(y,m-1,1);}
  const d=new Date(); state.mealMonth=monthKeyFromDate(d); return new Date(d.getFullYear(),d.getMonth(),1);
}
function setMealMonthOffset(delta){const d=currentMealMonthDate(); d.setMonth(d.getMonth()+delta); state.mealMonth=monthKeyFromDate(d); saveState({sync:false}); document.body.classList.add('meal-calendar-switching'); if(window.__mealCalendarRaf) cancelAnimationFrame(window.__mealCalendarRaf); window.__mealCalendarRaf=requestAnimationFrame(()=>{renderMealCalendar(); loadMealMonth(state.mealMonth).finally(()=>requestAnimationFrame(()=>document.body.classList.remove('meal-calendar-switching')));});}
function openMealCalendar(dateKey=null){
  ensureMealPlan();
  const targetKey=validDateKey(dateKey)?dateKey:localDateKey(new Date());
  state.selectedMealDate=targetKey;
  state.mealMonth=monthKeyFromDayKey(targetKey)||monthKeyFromDate(new Date());
  state.shoppingWeekStart=localDateKey(startOfMealWeek(targetKey));
  saveState({sync:false});
  showView('mealview');
  loadMealMonth(state.mealMonth).then(()=>openMealDay(targetKey,{scroll:!!dateKey}));
  vibe(12);
}
function mealRecipeNutrition(item){
  const recipe=getRecipeByRef(item);
  const value=recipe?nutritionOf(recipe):null;
  const servings=Math.max(1,Math.min(12,Math.round(Number(item?.servings)||1)));
  return {kcal:Math.max(0,Number(value?.kcal)||0)*servings,protein:Math.max(0,Number(value?.protein)||0)*servings,fat:Math.max(0,Number(value?.fat)||0)*servings,carbs:Math.max(0,Number(value?.carbs)||0)*servings};
}
function mealRecipeCalories(item){return mealRecipeNutrition(item).kcal;}
function mealDayNutrition(day){
  return MEAL_SLOTS.reduce((total,[slot])=>(Array.isArray(day?.[slot])?day[slot]:[]).reduce((sum,item)=>addNutrition(sum,mealRecipeNutrition(item)),total),{kcal:0,protein:0,fat:0,carbs:0});
}
function mealDayCalories(day){return mealDayNutrition(day).kcal;}
function mealDateSummary(dateKey,limit=3,plan=null){
  const sourcePlan=plan||ensureMealPlan();
  const raw=sourcePlan[dateKey];
  if(!raw) return '';
  const day=raw;
  const chips=[];
  MEAL_SLOTS.forEach(([slot,label])=>{
    const list=Array.isArray(day?.[slot])?day[slot]:[];
    list.forEach(item=>{
      const r=getRecipeByRef(item);
      chips.push(`${label[0]}: ${(r?.title||item.title||'Рецепт').trim()}`);
    });
  });
  const calories=mealDayCalories(day);
  const shown=chips.slice(0,limit).map(x=>`<span class="meal-chip">${esc(x)}</span>`).join('');
  return `${calories>0?`<span class="meal-calorie-chip">≈ ${fmt(calories)} ккал</span>`:''}${shown}${chips.length>limit?`<span class="meal-more">+${chips.length-limit}</span>`:''}`;
}
function mealCalendarMonthFirstDate(month){
  const start=new Date(month.getFullYear(),month.getMonth(),1);
  const offset=(start.getDay()+6)%7;
  const first=new Date(start); first.setDate(start.getDate()-offset);
  return first;
}

const mealMonthCellsCache=new Map();
function mealCalendarMonthCells(month){
  const key=monthKeyFromDate(month);
  const cached=mealMonthCellsCache.get(key);
  if(cached) return cached;
  const first=mealCalendarMonthFirstDate(month);
  const cells=[];
  for(let i=0;i<42;i++){
    const d=new Date(first); d.setDate(first.getDate()+i);
    const inMonth=d.getMonth()===month.getMonth();
    cells.push({date:d,key:localDateKey(d),day:d.getDate(),inMonth});
  }
  mealMonthCellsCache.clear();
  mealMonthCellsCache.set(key,cells);
  return cells;
}
function mealCalendarRenderSignature(month,{compact=false}={}){
  const plan=ensureMealPlan();
  const parts=[monthKeyFromDate(month),compact?'compact':'full',state.selectedMealDate||''];
  mealCalendarMonthCells(month).forEach(cell=>{
    if(!cell.inMonth) return;
    const day=plan[cell.key];
    if(!day) return;
    const ids=[];
    MEAL_SLOTS.forEach(([slot])=>{
      const list=Array.isArray(day?.[slot])?day[slot]:[];
      list.forEach(item=>ids.push(`${slot}:${item.source||'base'}:${item.id||item.title||''}:${fmt(mealRecipeCalories(item))}`));
    });
    if(ids.length) parts.push(cell.key+'='+ids.join(','));
  });
  return parts.join('|');
}
function buildMealCalendarHtml(month,{compact=false}={}){
  const todayKey=localDateKey(new Date());
  const plan=ensureMealPlan();
  return mealCalendarMonthCells(month).map(cell=>{
    if(!cell.inMonth) return '<span class="meal-day meal-day-empty" aria-hidden="true"></span>';
    const cls=['meal-day'];
    if(cell.key===todayKey) cls.push('today');
    if(cell.key===state.selectedMealDate) cls.push('selected');
    const summary=plan[cell.key]?mealDateSummary(cell.key,compact?1:3,plan):'';
    return `<button class="${cls.join(' ')}" data-meal-date="${cell.key}" type="button"><span class="meal-day-number">${cell.day}</span><span class="meal-day-dots">${summary}</span></button>`;
  }).join('');
}
function bindMealCalendarGrid(grid,mode){
  if(!grid || grid.dataset.boundMode===mode) return;
  grid.dataset.boundMode=mode;
  grid.onclick=e=>{
    const btn=e.target.closest('[data-meal-date]');
    if(!btn || !grid.contains(btn)) return;
    if(mode==='home') openMealCalendar(btn.dataset.mealDate);
    else openMealDay(btn.dataset.mealDate);
  };
}
function bindMealCalendarSwipe(target){
  if(!target || target.id==='homeMealCalendarCard' || target.closest?.('#homeMealCalendarCard') || target.dataset.swipeBound==='1') return;
  target.dataset.swipeBound='1';
  let sx=0, sy=0, active=false;
  target.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse' && e.button!==0) return;
    sx=e.clientX; sy=e.clientY; active=true;
  },{passive:true});
  target.addEventListener('pointerup',e=>{
    if(!active) return;
    const dx=e.clientX-sx;
    const dy=Math.abs(e.clientY-sy);
    active=false;
    if(Math.abs(dx)<58 || dy>48) return;
    setMealMonthOffset(dx<0?1:-1);
    vibe(10);
  },{passive:true});
  target.addEventListener('pointercancel',()=>{active=false;},{passive:true});
  target.addEventListener('lostpointercapture',()=>{active=false;},{passive:true});
}
function clearInactiveMealGrid(grid){
  if(!grid) return;
  if(grid.childElementCount){grid.replaceChildren();}
  delete grid.dataset.renderSig;
  delete grid.dataset.boundMode;
}
function renderMealCalendar(){
  ensureMealPlan();
  const homeActive=$('#home')?.classList.contains('active');
  const mealActive=$('#mealview')?.classList.contains('active');
  const now=new Date();
  const month=mealActive?currentMealMonthDate():new Date(now.getFullYear(),now.getMonth(),1);
  const monthTitle=month.toLocaleDateString('ru-RU',{month:'long',year:'numeric'}).replace(/^./,c=>c.toUpperCase());
  const fullTitle=$('#mealMonthTitle'), fullGrid=$('#mealCalendarGrid');
  const homeGrid=$('#homeMealCalendarGrid');
  if(fullTitle) fullTitle.textContent=monthTitle;
  if(mealActive && fullGrid){
    const sig=mealCalendarRenderSignature(month,{compact:false});
    if(fullGrid.dataset.renderSig!==sig){
      fullGrid.innerHTML=buildMealCalendarHtml(month,{compact:false});
      fullGrid.dataset.renderSig=sig;
    }
    bindMealCalendarGrid(fullGrid,'full');
    bindMealCalendarSwipe($('#mealCalendarPanel')||fullGrid);
    clearInactiveMealGrid(homeGrid);
  }else if(homeActive && homeGrid){
    const sig=mealCalendarRenderSignature(month,{compact:true});
    if(homeGrid.dataset.renderSig!==sig){
      homeGrid.innerHTML=buildMealCalendarHtml(month,{compact:true});
      homeGrid.dataset.renderSig=sig;
    }
    bindMealCalendarGrid(homeGrid,'home');
    // На главной календарь не перехватывает свайпы, чтобы не тормозить вертикальный скролл.
    clearInactiveMealGrid(fullGrid);
  }else{
    clearInactiveMealGrid(fullGrid);
    clearInactiveMealGrid(homeGrid);
  }
  updateHomeMeta();
}
function normalizeMealSearch(value){return String(value||'').normalize('NFKC').toLocaleLowerCase('ru-RU').replace(/ё/g,'е').replace(/[^a-zа-я0-9]+/gi,' ').trim();}
function mealRecipeMatches(recipe,q){
  const words=normalizeMealSearch(q).split(/\s+/).filter(Boolean);
  if(!words.length) return true;
  const hay=normalizeMealSearch([recipe.title,...(Array.isArray(recipe.ingredients)?recipe.ingredients:[])].join(' '));
  return words.every(word=>hay.includes(word));
}
function mealTypeList(slot){
  const selected=new Set((mealDraft?.[slot]||[]).map(item=>item.source+':'+item.id));
  const available=allRecipeOptions().filter(r=>r.source!=='custom'||r.category==='Фрукты').filter(r=>!selected.has((r.source==='custom'?'custom':'base')+':'+r.id));
  const cats=orderedCategories(available);
  return cats.map(cat=>({category:cat,count:available.filter(r=>(r.category||'Без категории')===cat).length})).filter(x=>x.count>0);
}
function mealPickerHtml(slot){
  const selected=new Set((mealDraft?.[slot]||[]).map(item=>item.source+':'+item.id));
  const count=allRecipeOptions().filter(r=>!selected.has((r.source==='custom'?'custom':'base')+':'+r.id)).length;
  return `<button class="meal-add-btn" type="button" data-add-meal="${slot}" aria-label="Добавить блюдо">+<span>Добавить</span></button><p class="meal-picker-note">${count?`Доступно ${count} ${plural(count,['блюдо','блюда','блюд'])}`:'Все блюда уже добавлены.'}</p>`;
}
function openMealDishPicker(slot,category=null){
  if(!MEAL_SLOTS.some(([s])=>s===slot)) return;
  mealPickerDialog={slot,category:category||null,country:null,step:category?'country':'category',query:''};
  const modal=$('#mealPickerModal');
  if(modal) modal.hidden=false;
  document.body.classList.add('meal-picker-open');
  const search=$('#mealPickerSearch');
  if(search){
    search.value='';
    search.oninput=()=>{mealPickerDialog.query=search.value;renderMealDishPicker();};
  }
  renderMealDishPicker();
  requestAnimationFrame(()=>search?.focus({preventScroll:true}));
  vibe(10);
}
function closeMealDishPicker(){
  const modal=$('#mealPickerModal');
  if(modal) modal.hidden=true;
  document.body.classList.remove('meal-picker-open');
  mealPickerDialog={slot:null,category:null,country:null,step:'category',query:''};
}
function mealPickerBackToCountries(){
  if(mealPickerDialog.step==='dish'){
    mealPickerDialog.step=mealPickerDialog.category===MEAL_MY_RECIPES_CATEGORY?'category':'country';
    if(mealPickerDialog.category===MEAL_MY_RECIPES_CATEGORY) mealPickerDialog.category=null;
    mealPickerDialog.country=null;
  }else if(mealPickerDialog.step==='country'){
    mealPickerDialog.step='category';
    mealPickerDialog.category=null;
    mealPickerDialog.country=null;
  }else{
    closeMealDishPicker();
    return;
  }
  renderMealDishPicker();
}
function renderMealDishPicker(){
  const {slot,category,country,step,query=''}=mealPickerDialog;
  const modal=$('#mealPickerModal'), grid=$('#mealPickerGrid'), title=$('#mealPickerTitle'), slotLabel=$('#mealPickerSlotLabel'), note=$('#mealPickerNote'), back=$('#mealPickerBack'), search=$('#mealPickerSearch');
  if(!modal||modal.hidden||!grid||!slot) return;
  const slotName=(MEAL_SLOTS.find(([s])=>s===slot)||[])[1]||'Приём пищи';
  const selected=new Set((mealDraft?.[slot]||[]).map(item=>item.source+':'+item.id));
  if(search&&search.value!==query) search.value=query;
  if(normalizeMealSearch(query)){
    const all=allRecipeOptions()
      .filter(r=>!selected.has((r.source==='custom'?'custom':'base')+':'+r.id))
      .filter(r=>mealRecipeMatches(r,query))
      .sort((a,b)=>Number(b.source==='custom')-Number(a.source==='custom')||String(a.title||'').localeCompare(String(b.title||''),'ru'));
    if(title) title.textContent='Поиск блюд';
    if(slotLabel) slotLabel.textContent=slotName;
    if(back) back.hidden=true;
    grid.className='meal-pick-grid meal-pick-grid-modal meal-search-results';
    grid.innerHTML=all.length?all.slice(0,80).map(r=>{
      const source=r.source==='custom'?'custom':'base';
      return `<button class="meal-pick-card" type="button" data-pick-slot="${slot}" data-pick-source="${source}" data-pick-id="${esc(r.id)}"><b>${esc(r.title)}</b><span>${esc((source==='custom'?'Мои рецепты':'Каталог')+' • '+mealCountryLabel(r))}</span></button>`;
    }).join(''):'<div class="meal-empty">По этому запросу блюда не найдены.</div>';
    if(note) note.textContent=all.length?`Найдено ${all.length} ${plural(all.length,['блюдо','блюда','блюд'])}`:'Попробуйте другое слово из названия или ингредиентов.';
    grid.querySelectorAll('[data-pick-slot]').forEach(btn=>btn.onclick=()=>addMealDish(btn.dataset.pickSlot,btn.dataset.pickSource,btn.dataset.pickId));
    return;
  }
  if(step==='category' || !category){
    const cats=mealTypeList(slot);
    const myCount=myRecipes.filter(r=>!selected.has('custom:'+r.id)).length;
    if(title) title.textContent='Выберите категорию';
    if(slotLabel) slotLabel.textContent=slotName;
    if(back) back.hidden=true;
    grid.className='meal-type-grid meal-type-grid-modal';
    const myRecipesCard=`<button class="meal-type-card meal-type-card-personal" type="button" data-pick-my-recipes><b>Мои рецепты</b><span>${myCount} ${plural(myCount,['блюдо','блюда','блюд'])}</span></button>`;
    const catalogCards=cats.map(x=>`<button class="meal-type-card" type="button" data-pick-category="${esc(x.category)}"><b>${esc(x.category)}</b><span>${x.count} ${plural(x.count,['блюдо','блюда','блюд'])}</span></button>`).join('');
    grid.innerHTML=myRecipesCard+catalogCards;
    if(note) note.textContent='';
    grid.querySelector('[data-pick-my-recipes]').onclick=()=>{mealPickerDialog.category=MEAL_MY_RECIPES_CATEGORY; mealPickerDialog.country='Мои рецепты'; mealPickerDialog.step='dish'; renderMealDishPicker();};
    grid.querySelectorAll('[data-pick-category]').forEach(btn=>btn.onclick=()=>{mealPickerDialog.category=btn.dataset.pickCategory; mealPickerDialog.step='country'; mealPickerDialog.country=null; renderMealDishPicker();});
    return;
  }
  if(step!=='dish'){
    if(title) title.textContent='Выберите кухню';
    if(slotLabel) slotLabel.textContent=`${slotName} • ${category}`;
    if(back){back.hidden=false; setNavBackButton(back,'К категориям');}
    const countries=mealCountryList(slot,category);
    grid.className='meal-country-grid';
    grid.innerHTML=countries.length?countries.map(x=>`<button class="meal-country-card meal-country-card-art" type="button" data-pick-country="${esc(x.country)}"><span class="meal-country-thumb">${countryImageHtml(x.country,'meal-country-img')}</span><b>${esc(x.country)}</b><span>${x.count} ${plural(x.count,['блюдо','блюда','блюд'])}</span></button>`).join(''):'<div class="meal-empty">В этой категории пока нет доступных блюд.</div>';
    if(note) note.textContent='';
    grid.querySelectorAll('[data-pick-country]').forEach(btn=>btn.onclick=()=>{mealPickerDialog.country=btn.dataset.pickCountry; mealPickerDialog.step='dish'; renderMealDishPicker();});
    return;
  }
  const myRecipesOnly=category===MEAL_MY_RECIPES_CATEGORY;
  if(title) title.textContent=myRecipesOnly?'Мои рецепты':country||category;
  if(slotLabel) slotLabel.textContent=`${slotName} • ${myRecipesOnly?'Мои рецепты':category}`;
  if(back){back.hidden=false; setNavBackButton(back,myRecipesOnly?'К категориям':'К кухням');}
  grid.className='meal-pick-grid meal-pick-grid-modal';
  const all=allRecipeOptions()
    .filter(r=>myRecipesOnly?r.source==='custom':(category==='Фрукты'||r.source!=='custom') && (r.category||'Без категории')===category && mealCountryLabel(r)===country)
    .filter(r=>!selected.has((r.source==='custom'?'custom':'base')+':'+r.id));
  const shown=all.slice(0,80);
  grid.innerHTML=shown.length?shown.map(r=>{
    const source=r.source==='custom'?'custom':'base';
    const origin=mealCountryLabel(r);
    return `<button class="meal-pick-card" type="button" data-pick-slot="${slot}" data-pick-source="${source}" data-pick-id="${esc(r.id)}"><b>${esc(r.title)}</b><span>${esc((source==='custom'?'Мои рецепты':'Каталог')+' • '+origin)}</span></button>`;
  }).join(''):`<div class="meal-empty">${myRecipesOnly?'Здесь пока нет доступных личных рецептов. Создайте рецепт в разделе «Мои рецепты».':'В этой кухне ничего не найдено.'}</div>`;
  if(note) note.textContent='';
  grid.querySelectorAll('[data-pick-slot]').forEach(btn=>btn.onclick=()=>addMealDish(btn.dataset.pickSlot,btn.dataset.pickSource,btn.dataset.pickId));
}
function updateMealDayModeUi(){
  const sub=$('#mealDaySub');
  if(sub) sub.textContent=mealDayIsWorkday(mealDraft)?'Рабочий день · обед приготовлен заранее для работы.':'Нажмите «+» сверху нужного приёма пищи, выберите категорию, кухню и блюдо.';
  const hasItems=mealDraft&&MEAL_SLOTS.some(([slot])=>(mealDraft[slot]||[]).length);
  const clearBtn=$('#clearMealDay'); if(clearBtn) clearBtn.disabled=!hasItems;
  const saveBtn=$('#saveMealDay');
  if(saveBtn){
    saveBtn.disabled=!mealDraftDate||!mealDraftDirty;
    saveBtn.textContent=mealDraftDirty?'Сохранить изменения':'Изменения сохранены';
  }
}
function mealDayStatus(text){const el=$('#mealDayStatus'); if(el) el.textContent=text||'';}
function renderMealDayEditor(){
  const box=$('#mealDayEditor'); if(!box||!mealDraftDate||!mealDraft) return;
  const dayNutrition=mealDayNutrition(mealDraft);
  const slots=MEAL_SLOTS.map(([slot,label])=>{
    const items=mealDraft[slot]||[];
    const list=items.length?items.map((item,index)=>{
      const r=getRecipeByRef(item);
      const title=r?.title||item.title||'Рецепт удалён';
      const calories=r?mealRecipeCalories(item):0;
      const servings=Math.max(1,Math.min(12,Math.round(Number(item?.servings)||1)));
      const meta=r?[mealCountryLabel(Object.assign({source:item.source},r)),r.category,calories>0?`≈ ${fmt(calories)} ккал · ${servings} ${plural(servings,['порция','порции','порций'])}`:null,item.mealBadge||r.mealBadge||r.batchLabel||null].filter(Boolean).join(' • '):'Рецепт недоступен';
      const options=Array.from({length:12},(_,optionIndex)=>{const value=optionIndex+1;return `<option value="${value}" ${value===servings?'selected':''}>${value}</option>`;}).join('');
      return `<div class="meal-dish-row"><button class="meal-dish-open${r?'':' missing'}" type="button" data-open-meal="${esc(item.source+':'+item.id)}" ${r?'':'disabled'}><span>${esc(title)}</span><small>${esc(meta)}</small></button><label class="meal-serving-control"><span>Порции</span><select data-meal-servings="${slot}:${index}" aria-label="Количество порций для ${esc(title)}">${options}</select></label><button class="meal-remove" type="button" data-remove-meal="${slot}:${index}" aria-label="Убрать блюдо">×</button></div>`;
    }).join(''):'<div class="meal-empty">Пока нет блюд</div>';
    return `<div class="meal-slot"><div class="meal-slot-head"><div class="meal-slot-title"><h4>${label}</h4><span>${items.length} ${plural(items.length,['блюдо','блюда','блюд'])}</span></div><button class="meal-add-btn" type="button" data-add-meal="${slot}" aria-label="Добавить блюдо в ${label}">+</button></div><div class="meal-dishes">${list}</div></div>`;
  }).join('');
  box.innerHTML=`${mealNutritionDashboardHtml(dayNutrition)}${slots}`;
  $$('[data-add-meal]').forEach(btn=>btn.onclick=()=>openMealDishPicker(btn.dataset.addMeal));
  $$('[data-remove-meal]').forEach(btn=>btn.onclick=()=>{const [slot,index]=btn.dataset.removeMeal.split(':'); removeMealDish(slot,Number(index));});
  $$('[data-meal-servings]').forEach(select=>select.onchange=()=>{const [slot,index]=select.dataset.mealServings.split(':'); setMealDishServings(slot,Number(index),Number(select.value));});
  $$('[data-open-meal]').forEach(btn=>btn.onclick=()=>{const [source,id]=btn.dataset.openMeal.split(':'); closeMealDishPicker(); openRecipe(id,source);});
  updateMealDayModeUi();
}
function openMealDay(dateKey,{scroll=true}={}){
  if(mealDraftDirty&&mealDraftDate&&mealDraftDate!==dateKey) persistMealDraft({render:false,status:false});
  ensureMealPlan();
  mealDayStatus('');
  state.selectedMealDate=dateKey; state.shoppingWeekStart=localDateKey(startOfMealWeek(dateKey)); saveState();
  mealDraftDate=dateKey;
  mealDraft=normalizeMealDay(state.mealPlan[dateKey]);
  mealDraftDirty=false;
  mealDayEditMode=true;
  closeMealDishPicker();
  const panel=$('#mealDayPanel'), title=$('#mealDayTitle');
  if(panel) panel.hidden=false;
  const d=dateFromKey(dateKey);
  if(title){
    const label=d.toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    title.textContent=label.replace(/^./,char=>char.toUpperCase())+(mealDayIsWorkday(mealDraft)?' · рабочий день':'');
  }
  renderMealCalendar();
  renderMealDayEditor();
  renderShoppingList();
  if(scroll) setTimeout(()=>panel?.scrollIntoView({behavior:'smooth',block:'start'}),70);
}
function persistMealDraft({sync=true,render=true,status=true}={}){
  if(!mealDraftDate||!mealDraft) return false;
  const plan=ensureMealPlan();
  const compact=normalizeMealDay(mealDraft);
  const before=mealPlanSignature(plan);
  if(mealPlanHasItems(compact)) plan[mealDraftDate]=compact;
  else delete plan[mealDraftDate];
  state.mealPlan=normalizeMealPlan(plan);
  touchMealMonthCache(monthKeyFromDayKey(mealDraftDate));
  trimMealMonthCache();
  const after=mealPlanSignature(state.mealPlan);
  const changed=before!==after;
  if(changed){
    touchMealPlan();
    state.mealDirtyDays=[...new Set([...(Array.isArray(state.mealDirtyDays)?state.mealDirtyDays:[]),mealDraftDate])];
    saveState({sync:false,personal:true});
  }
  else state.mealPlan=normalizeMealPlan(state.mealPlan);
  mealDraftDirty=false;
  if(render && changed){renderMealCalendar(); updateHomeMeta(); renderShoppingList();}
  if(sync && changed && cloudUser) queueCloudMealDaySave(mealDraftDate,state.mealPlan[mealDraftDate]||normalizeMealDay(null));
  return changed;
}
function addMealDish(slot,source,id){
  if(!mealDraft||!MEAL_SLOTS.some(([s])=>s===slot)) return;
  mealDayStatus('');
  const recipe=getRecipeByRef({source,id}); if(!recipe) return;
  const key=source+':'+id;
  if((mealDraft[slot]||[]).some(item=>item.source+':'+item.id===key)) return;
  mealDraft[slot].push(recipeToMealRef(Object.assign({},recipe,{source})));
  mealDraftDirty=true;
  renderMealDayEditor();
  closeMealDishPicker();
  mealDayStatus('Блюдо добавлено. Нажмите «Сохранить изменения».');
  vibe(8);
}
function removeMealDish(slot,index){
  if(!mealDraft||!Array.isArray(mealDraft[slot])) return;
  mealDayStatus('');
  mealDraft[slot].splice(index,1);
  mealDraftDirty=true;
  renderMealDayEditor();
  mealDayStatus('Блюдо удалено. Нажмите «Сохранить изменения».');
  vibe(8);
}
function editMealDay(){
  if(!mealDraftDate) return;
  mealDayEditMode=true;
  renderMealDayEditor();
  vibe(10);
}
function saveMealDay(){
  if(!mealDraftDate) return;
  persistMealDraft();
  renderMealDayEditor();
  const hasItems=mealDraft&&MEAL_SLOTS.some(([slot])=>(mealDraft[slot]||[]).length);
  mealDayStatus(hasItems?'Меню дня сохранено':'Пустой день не сохранён.');
  vibe([12,24,12]);
}
function clearMealDay(){
  if(!mealDraftDate) return;
  mealDraft=normalizeMealDay({});
  mealDraftDirty=true;
  closeMealDishPicker();
  renderMealDayEditor();
  mealDayStatus('Блюда дня удалены из черновика. Нажмите «Сохранить изменения».');
  vibe(10);
}
function setMealDishServings(slot,index,value){
  if(!mealDraft||!Array.isArray(mealDraft[slot])||!mealDraft[slot][index]) return;
  const servings=Math.max(1,Math.min(12,Math.round(Number(value)||1)));
  if(mealDraft[slot][index].servings===servings) return;
  mealDraft[slot][index].servings=servings;
  mealDraftDirty=true;
  renderMealDayEditor();
  mealDayStatus(`Количество изменено: ${servings} ${plural(servings,['порция','порции','порций'])}. Нажмите «Сохранить изменения».`);
}

function startOfMealWeek(value=new Date()){const date=value instanceof Date?new Date(value):dateFromKey(value); date.setHours(12,0,0,0); date.setDate(date.getDate()-((date.getDay()+6)%7)); return date;}
function addCalendarDays(value,days){const date=value instanceof Date?new Date(value):dateFromKey(value); date.setDate(date.getDate()+days); return date;}
function shoppingWeekStartDate(){if(validDateKey(state.shoppingWeekStart)) return startOfMealWeek(state.shoppingWeekStart); const basis=validDateKey(state.selectedMealDate)?dateFromKey(state.selectedMealDate):new Date(); const start=startOfMealWeek(basis); state.shoppingWeekStart=localDateKey(start); return start;}
function setShoppingWeek(offset=0,{today=false}={}){const start=today?startOfMealWeek(new Date()):addCalendarDays(shoppingWeekStartDate(),offset*7); state.shoppingWeekStart=localDateKey(start); saveState({sync:false}); renderShoppingList(); vibe(8);}
function ingredientNumber(value){const raw=String(value||'').replace(',','.').trim(); if(!raw) return 0; if(raw.includes('/')){const [a,b]=raw.split('/').map(Number); return b?a/b:0;} return Number(raw)||0;}
function cleanShoppingProductName(value){return String(value||'').normalize('NFKC').replace(/\([^)]*\)/g,' ').replace(/\b(свеж(?:ий|ая|ие|его)|спел(?:ый|ые|ая)|очищенн(?:ый|ая|ые)|нарезанн(?:ый|ая|ые)|мелк(?:ий|ая|ие)|крупн(?:ый|ая|ые)|оставш(?:ийся|аяся|ееся|иеся))\b/gi,' ').replace(/\s+(?:для\s+котлет|к\s+гарниру|для\s+гарнира|для\s+подачи|для\s+смазывания\s+поверхности)\b/gi,' ').replace(/[;,]+$/g,'').replace(/\s+/g,' ').trim();}
function canonicalShoppingName(name){const cleaned=cleanShoppingProductName(name); const nutrition=foodNutritionEntry(cleaned); if(nutrition) return nutrition.canonical_name; const portion=productPortionWeights.find(row=>referenceNameMatches(row,cleaned,{partial:true})); return portion?.canonical_name||cleaned;}
function parseIngredientAmount(line){
  const source=String(line||'').trim();
  const normalized=source.replace(/½/g,'1/2').replace(/¼/g,'1/4').replace(/¾/g,'3/4');
  const divided=normalized.match(/^(.*?)(?:\s*[—–]\s*|\s+-\s+)(.+)$/);
  const amountText=divided?.[2]||normalized;
  const embeddedWeight=amountText.match(/(?:около|весом|массой)\s*(\d+(?:[.,]\d+)?)(?:\s*[–—-]\s*(\d+(?:[.,]\d+)?))?\s*г(?:р|рамм(?:а|ов)?)?(?![а-яё])/i);
  if(embeddedWeight){
    const low=ingredientNumber(embeddedWeight[1]),high=ingredientNumber(embeddedWeight[2]||embeddedWeight[1]);
    const name=cleanShoppingProductName(divided?.[1]||normalized.slice(0,Math.max(0,embeddedWeight.index||0))||source);
    return {name,amount:(low+high)/2,unit:'g',explicit:true};
  }
  const match=amountText.match(/(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+)?)(?:\s*[–—-]\s*(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+)?))?\s*(кг|мг|г(?:р|рамм(?:а|ов)?)?\.?|мл\.?|луковиц(?:а|ы|у|е)?|шт\.?|штук(?:а|и)?|ст\.?\s*л\.?|столов(?:ая|ой|ую|ые)?\s+ложк(?:а|и|у|ой)?|ч\.?\s*л\.?|чайн(?:ая|ой|ую|ые)?\s+ложк(?:а|и|у|ой)?|зубчик(?:а|ов)?|ломтик(?:а|ов)?|дольк(?:а|и|ек)|пуч(?:ок|ка|ков)|лист(?:а|ов)?|стеб(?:ель|ля|лей)|пер(?:о|а|ьев)|палочк(?:а|и|ек)|полоск(?:а|и|ок)|банк(?:а|и)|упаковк(?:а|и)|л\.?)(?![а-яё])/i);
  const rawName=divided?.[1]||(match?normalized.slice(0,Math.max(0,match.index||0)):normalized);
  const name=cleanShoppingProductName(rawName||source);
  if(!match) return {name,amount:0,unit:'text',text:divided?.[2]||'по потребности',explicit:false};
  const amount=Math.max(ingredientNumber(match[1]),ingredientNumber(match[2]||match[1]));
  const rawUnit=match[3].toLowerCase().replace(/\s+/g,'').replace(/\.$/,'');
  let unit='piece';
  if(rawUnit==='кг') return {name,amount:amount*1000,unit:'g',explicit:true};
  if(rawUnit==='мг') return {name,amount:amount/1000,unit:'g',explicit:true};
  if(rawUnit==='г'||rawUnit==='гр'||rawUnit.startsWith('грамм')) unit='g';
  else if(rawUnit==='л') return {name,amount:amount*1000,unit:'milliliter',explicit:true};
  else if(rawUnit==='мл') unit='milliliter';
  else if(rawUnit.startsWith('ст.л')||rawUnit.startsWith('столов')) unit='tablespoon';
  else if(rawUnit.startsWith('ч.л')||rawUnit.startsWith('чайн')) unit='teaspoon';
  else if(rawUnit.startsWith('зубчик')) unit='clove';
  else if(rawUnit.startsWith('ломтик')) unit='slice';
  else if(rawUnit.startsWith('дольк')) unit='wedge';
  else if(rawUnit.startsWith('пуч')) unit='piece';
  return {name,amount,unit,explicit:true};
}
function shoppingIngredientRows(recipe,selectedServings=1){if(recipe?.skipShopping) return []; const recipeServings=Math.max(1,Number(recipe?.servings)||1),requested=Math.max(1,Math.min(12,Math.round(Number(selectedServings)||1))),scale=recipe?.preparedForNextDay?Math.max(1,requested/recipeServings):requested/recipeServings; const rows=[],calculatedNames=new Set(),skippedLines=new Set((Array.isArray(recipe?.skipShoppingLines)?recipe.skipShoppingLines:[]).map(line=>String(line).trim())); (Array.isArray(recipe?.ingredientNutrition)?recipe.ingredientNutrition:[]).forEach(product=>{const amount=Number(product?.amount??product?.quantity)||0,unit=product?.unit||'g',name=String(product?.name||'').trim(); const resolved=Number(product?.weight)||productWeightFor(name,amount,unit).weight; const key=normalizePortionName(canonicalShoppingName(name)); if(key) calculatedNames.add(key); if(resolved>0) rows.push({name,amount:resolved*scale,unit:'g'}); else if(amount>0) rows.push({name,amount:amount*scale,unit});}); if(recipe?.shoppingFromNutritionOnly) return rows; (Array.isArray(recipe?.ingredients)?recipe.ingredients:[]).forEach(line=>{if(skippedLines.has(String(line).trim())) return; const parsed=parseIngredientAmount(line); const key=normalizePortionName(canonicalShoppingName(parsed.name)); if(!key||!calculatedNames.has(key)) rows.push(parsed.amount>0?Object.assign({},parsed,{amount:parsed.amount*scale}):parsed);}); return rows;}
function aggregateWeekShopping(plan,weekStart){const items=new Map(); for(let dayIndex=0;dayIndex<7;dayIndex++){const date=addCalendarDays(weekStart,dayIndex),dateKey=localDateKey(date),day=normalizeMealDay(plan[dateKey]); MEAL_SLOTS.forEach(([slot])=>(day[slot]||[]).forEach(ref=>{if(ref?.skipShopping) return; const recipe=getRecipeByRef(ref); if(!recipe) return; shoppingIngredientRows(recipe,ref.servings).forEach(row=>{if(!row.name) return; const name=canonicalShoppingName(row.name),key=normalizePortionName(name); if(!key) return; const entry=items.get(key)||{name,quantities:{},texts:new Set(),earliestDay:dayIndex,uses:0,storage:foodStorageEntry(name)}; entry.earliestDay=Math.min(entry.earliestDay,dayIndex); entry.uses+=1; if(row.amount>0&&row.unit!=='text'){const resolved=productWeightFor(name,row.amount,row.unit); if(row.unit!=='g'&&resolved.weight>0) entry.quantities.g=(entry.quantities.g||0)+resolved.weight; else entry.quantities[row.unit]=(entry.quantities[row.unit]||0)+row.amount;} else if(row.text) entry.texts.add(row.text); items.set(key,entry);});}));} return [...items.values()].sort((a,b)=>a.name.localeCompare(b.name,'ru'));}
function shoppingQuantityText(item){const labels={g:'г',milliliter:'мл',piece:'шт.',tablespoon:'ст. л.',teaspoon:'ч. л.',slice:'ломт.',wedge:'дольк.',clove:'зубч.',bunch:'пуч.'}; const amounts=Object.entries(item.quantities).filter(([,value])=>value>0).map(([unit,value])=>`${fmt(value)} ${labels[unit]||unit}`); const texts=[...item.texts].filter(Boolean); return [...amounts,...texts].join(' + ')||'уточнить по рецепту';}
function shoppingPurchaseDate(item,weekStart){const max=Number(item.storage?.fridge_days_max)||0; if(!max||item.earliestDay<max) return weekStart; return addCalendarDays(weekStart,Math.max(0,item.earliestDay-Math.max(1,max-1)));}
function shoppingItemHtml(item,weekStart){const purchase=shoppingPurchaseDate(item,weekStart),later=localDateKey(purchase)!==localDateKey(weekStart); const storage=item.storage?`Холодильник: ${item.storage.fridge_days_min}–${item.storage.fridge_days_max} дн.`:''; return `<label class="shopping-item${later?' shopping-item-later':''}"><input type="checkbox"><span><b>${esc(item.name)}</b><small>${esc(shoppingQuantityText(item))}${storage?` · ${esc(storage)}`:''}</small></span>${later?`<em>${esc(purchase.toLocaleDateString('ru-RU',{weekday:'short',day:'numeric',month:'short'}))}</em>`:''}</label>`;}
let shoppingRenderSequence=0;
async function renderShoppingList(){const box=$('#shoppingList'),panel=$('#shoppingPanel'),title=$('#shoppingWeekTitle'),summary=$('#shoppingSummary'); if(!box||!title) return; const sequence=++shoppingRenderSequence; await ensureLocalFoodReferences(); if(sequence!==shoppingRenderSequence) return; const weekStart=shoppingWeekStartDate(),weekEnd=addCalendarDays(weekStart,6); title.textContent=`${weekStart.toLocaleDateString('ru-RU',{day:'numeric',month:'long'})} — ${weekEnd.toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}`; const monthKeys=[...new Set([monthKeyFromDate(weekStart),monthKeyFromDate(weekEnd)])]; if(cloudUser) await Promise.all(monthKeys.map(key=>loadMealMonth(key))); if(sequence!==shoppingRenderSequence) return; const items=aggregateWeekShopping(ensureMealPlan(),weekStart); const early=items.filter(item=>localDateKey(shoppingPurchaseDate(item,weekStart))===localDateKey(weekStart)),later=items.filter(item=>!early.includes(item)); const section=(heading,list)=>list.length?`<section class="shopping-group${list.length>4?' shopping-group-wide':''}"><h4>${heading}</h4><div class="shopping-group-items">${list.map(item=>shoppingItemHtml(item,weekStart)).join('')}</div></section>`:''; if(panel) panel.classList.toggle('shopping-panel-wide',items.length>4); box.classList.toggle('shopping-list-split',Boolean(early.length&&later.length)); box.innerHTML=items.length?section('Купить в начале недели',early)+section('Докупить ближе к приготовлению',later):'<div class="meal-empty">Добавьте блюда в календарь этой недели — продукты появятся здесь автоматически.</div>'; if(summary) summary.textContent=items.length?`${items.length} ${plural(items.length,['позиция','позиции','позиций'])} · ${later.length} ${plural(later.length,['позиция','позиции','позиций'])} лучше купить позже`:'Список пока пуст'; box.dataset.copyText=items.map(item=>`${localDateKey(shoppingPurchaseDate(item,weekStart))===localDateKey(weekStart)?'В начале недели':shoppingPurchaseDate(item,weekStart).toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'})}: ${item.name} — ${shoppingQuantityText(item)}`).join('\n');}
async function copyWeeklyShoppingList(){const box=$('#shoppingList'); const text=box?.dataset.copyText||''; if(!text){mealDayStatus('Список покупок пока пуст.');return;} const ok=await copyText(text); mealDayStatus(ok?'Список покупок скопирован.':'Не удалось скопировать список.'); vibe(8);}

function exportUserData(){
  const data=tableBookSnapshot();
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  const date=new Date().toISOString().slice(0,10);
  a.href=URL.createObjectURL(blob);
  a.download=`table-book-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),1200);
  updateBackupStatus(`Резервная копия создана: ${date}.`);
  vibe(12);
}
function importUserData(file){
  if(!file) return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const data=JSON.parse(reader.result);
      if(!data || !Array.isArray(data.myRecipes)) throw new Error('bad backup');
      const count=data.myRecipes.length;
      const ok=confirm(`Загрузить резервную копию? Текущие пользовательские рецепты будут заменены. В файле: ${count} ${plural(count,['рецепт','рецепта','рецептов'])}.`);
      if(!ok) return;
      myRecipes=withoutLegacyDuplicateRecipes(data.myRecipes);
      if(data.state && typeof data.state==='object'){
        Object.assign(state,data.state);
        state.route='myview';
        state.editingId=null;
      }
      saveState();
      saveMyRecipes();
      setTheme();
      updateStats();
      renderCountries();
      renderMyRecipes();
      resetMyForm();
      showView('myview');
      updateBackupStatus('Резервная копия загружена и сохранена в браузере.');
      alert('Данные восстановлены.');
      vibe(16);
    }catch(e){
      console.warn(e);
      updateBackupStatus('Не удалось загрузить файл резервной копии.');
      alert('Не удалось загрузить файл. Проверьте, что это JSON-резервная копия Table book.');
    }
  };
  reader.readAsText(file);
}

function cloudStatus(text){
  const el=$('#cloudStatus'); if(el) el.textContent=text;
}
function cloudProfileKey(user=cloudUser){return user?.id?CLOUD_PROFILE_KEY_PREFIX+user.id:null;}
function syncCloudProfileFromUser(){
  if(!cloudUser){cloudProfile={}; return;}
  const key=cloudProfileKey();
  const cached=safeJson(key?localStorage.getItem(key):null,{});
  const meta=cloudUser.user_metadata||{};
  cloudProfile=Object.assign({},cached,{email:cloudUser.email||cached.email||''});
  if(!Object.prototype.hasOwnProperty.call(cloudProfile,'nickname')){
    const metaNick=(meta.nickname||meta.name||'').trim();
    if(metaNick) cloudProfile.nickname=metaNick;
  }
  if(key){try{localStorage.setItem(key,JSON.stringify(cloudProfile));}catch(e){console.warn('Profile cache save failed',e)}}
}
function setCloudUser(user){
  const prevId=cloudUser?.id||null;
  cloudUser=user||null;
  if(prevId!==cloudUser?.id){
    cloudAutoSyncDoneForUser=null;
    cloudLibraryLoadedForUser=null;
    cloudLibraryLoad=null;
  }
  if(cloudUser?.id) hydratePersonalCacheForUser(cloudUser);
  syncCloudProfileFromUser();
}
function rememberCloudProfile(next={}){
  if(!cloudUser) return;
  cloudProfile=Object.assign({},cloudProfile,next,{email:cloudUser.email||next.email||cloudProfile.email||''});
  const key=cloudProfileKey();
  if(key){try{localStorage.setItem(key,JSON.stringify(cloudProfile));}catch(e){console.warn('Profile cache save failed',e)}}
}
function userNickname(){
  if(Object.prototype.hasOwnProperty.call(cloudProfile,'nickname')) return String(cloudProfile.nickname||'').trim();
  return (cloudUser?.user_metadata?.nickname||cloudUser?.user_metadata?.name||'').trim();
}
function userDisplayName(){return userNickname()||'Вы';}
const PROFILE_ACTIVITY=[
  {value:1,label:'Низкая',factor:1.2},
  {value:2,label:'Лёгкая',factor:1.375},
  {value:3,label:'Умеренная',factor:1.55},
  {value:4,label:'Повышенная',factor:1.725},
  {value:5,label:'Силовая',factor:1.9}
];
function normalizeHealthProfile(value=cloudProfile){
  const sex=value?.sex==='male'||value?.sex==='female'?value.sex:'';
  return {age:Math.max(0,Number(value?.age)||0),height:Math.max(0,Number(value?.height)||0),weight:Math.max(0,Number(value?.weight)||0),sex,activity:Math.min(5,Math.max(1,Number(value?.activity)||1))};
}
function estimateProfileEnergy(value=cloudProfile){
  const profile=normalizeHealthProfile(value);
  if(!profile.sex||profile.age<19||profile.height<120||profile.weight<30) return null;
  const resting=10*profile.weight+6.25*profile.height-5*profile.age+(profile.sex==='male'?5:-161);
  const activity=PROFILE_ACTIVITY.find(item=>item.value===profile.activity)||PROFILE_ACTIVITY[0];
  return {resting:Math.round(resting),daily:Math.round(resting*activity.factor),activity,profile};
}
function healthProfileFromInputs(){
  const checked=document.querySelector('input[name="settingsSex"]:checked');
  return normalizeHealthProfile({age:$('#settingsAge')?.value,height:$('#settingsHeight')?.value,weight:$('#settingsWeight')?.value,sex:checked?.value||'',activity:$('#settingsActivity')?.value});
}
function renderProfileEnergyEstimate(value=null){
  const profile=value||healthProfileFromInputs();
  const activity=PROFILE_ACTIVITY.find(item=>item.value===profile.activity)||PROFILE_ACTIVITY[0];
  const label=$('#settingsActivityLabel'); if(label) label.textContent=activity.label;
  const box=$('#settingsEnergyEstimate'); if(!box) return;
  const estimate=estimateProfileEnergy(profile);
  if(!estimate){box.innerHTML='<span>Заполните пол, возраст, рост и вес</span><small>После этого появится ориентировочная суточная потребность.</small>';return;}
  box.innerHTML=`<span>≈ ${estimate.daily.toLocaleString('ru-RU')} ккал в день</span><small>Обмен в покое ≈ ${estimate.resting.toLocaleString('ru-RU')} ккал. Данные носят информационный характер: фактический расход зависит от тренировок, бытовой и другой дополнительной активности.</small>`;
}
function dailyNutritionTargets(){
  const estimate=estimateProfileEnergy();
  if(!estimate) return null;
  const kcal=estimate.daily;
  return {kcal,protein:kcal*.20/4,fat:kcal*.30/9,carbs:kcal*.50/4};
}
function mealNutritionRing(label,value,target,unit,tone,{large=false}={}){
  const hasTarget=target>0;
  const percent=hasTarget?Math.round(value/target*100):0;
  const progress=Math.min(100,Math.max(0,percent));
  const roundedValue=fmt(value);
  const targetText=hasTarget?`из ${fmt(target)} ${unit}`:unit;
  const progressAttrs=hasTarget?`aria-valuemax="${Math.round(target)}" aria-valuenow="${Math.round(value)}"`:'';
  return `<div class="meal-ring-wrap ${tone}${large?' meal-ring-wrap-large':''}"><div class="meal-ring" role="progressbar" aria-label="${label}: ${roundedValue} ${unit}${hasTarget?` из ${fmt(target)} ${unit}`:''}" aria-valuemin="0" ${progressAttrs} style="--ring-progress:${progress*3.6}deg"><div class="meal-ring-center"><span>${label}</span><strong>${roundedValue}${large?'':` ${unit}`}</strong><small>${targetText}</small></div></div>${hasTarget?`<b class="meal-ring-percent">${percent}%</b>`:''}</div>`;
}
function mealNutritionDashboardHtml(nutrition){
  const n=nutrition||{kcal:0,protein:0,fat:0,carbs:0};
  const target=dailyNutritionTargets();
  const empty=n.kcal<=0&&n.protein<=0&&n.fat<=0&&n.carbs<=0;
  const title=empty?'Блюда пока не выбраны':'За день · выбранные порции';
  return `<div class="meal-day-energy"><div class="meal-energy-title"><span>${title}</span></div><div class="meal-ring-dashboard">${mealNutritionRing('Калории',n.kcal,target?.kcal||0,'ккал','calories',{large:true})}<div class="meal-macro-rings">${mealNutritionRing('Белки',n.protein,target?.protein||0,'г','protein')}${mealNutritionRing('Жиры',n.fat,target?.fat||0,'г','fat')}${mealNutritionRing('Углеводы',n.carbs,target?.carbs||0,'г','carbs')}</div></div><small>${target?'Ориентиры БЖУ: 20% / 30% / 50% суточной энергии. Значения информационные.':'Заполните пол, возраст, рост, вес и активность в профиле, чтобы видеть личную суточную норму.'}</small></div>`;
}
function updateCabinetInfo(){
  const display=userDisplayName();
  const email=cloudUser?.email||'—';
  const e=$('#cabinetUserEmail'); if(e){e.textContent=display; e.title='Открыть настройки аккаунта';}
  const dn=$('#cabinetDisplayName'); if(dn) dn.textContent=display;
  const em=$('#cabinetEmailMini'); if(em) em.textContent=email;
  const se=$('#settingsEmail'); if(se) se.textContent=email;
  const sn=$('#settingsNickname'); if(sn && document.activeElement!==sn) sn.value=userNickname();
  const profile=normalizeHealthProfile();
  [['settingsAge',profile.age||''],['settingsHeight',profile.height||''],['settingsWeight',profile.weight||''],['settingsActivity',profile.activity]].forEach(([id,value])=>{const input=$('#'+id);if(input&&document.activeElement!==input) input.value=value;});
  document.querySelectorAll('input[name="settingsSex"]').forEach(input=>{input.checked=input.value===profile.sex;});
  renderProfileEnergyEstimate(profile);
  const title=$('#topAuthTitle'); if(title && cloudUser) title.textContent=$('#accountSettings')?.hidden===false?'Настройки':'Личный кабинет';
}
function openCabinetHome(){
  const home=$('#cabinetHome'), settings=$('#accountSettings'), title=$('#topAuthTitle');
  if(home) home.hidden=false;
  if(settings) settings.hidden=true;
  if(title) title.textContent='Личный кабинет';
  updateCabinetInfo();
}
function openAccountSettings(){
  const panel=$('#topAuthPanel'); if(panel) panel.hidden=false;
  const form=$('#topAuthForm'), cabinet=$('#topCabinet'), home=$('#cabinetHome'), settings=$('#accountSettings'), title=$('#topAuthTitle');
  if(form) form.hidden=true;
  if(cabinet) cabinet.hidden=false;
  if(home) home.hidden=true;
  if(settings) settings.hidden=false;
  if(title) title.textContent='Настройки';
  updateCabinetInfo();
  setTimeout(()=>$('#settingsNickname')?.focus(),30);
}
function openTopAuth(mode='login'){
  const panel=$('#topAuthPanel'); if(!panel) return;
  panel.hidden=false;
  panel.dataset.mode=mode;
  const title=$('#topAuthTitle'), signIn=$('#topPanelSignIn'), signUp=$('#topPanelSignUp');
  const form=$('#topAuthForm'), cabinet=$('#topCabinet'), nick=$('#topCloudNickname'), email=$('#topCloudEmail'), pass=$('#topCloudPassword');
  const showCabinet=mode==='cabinet' || !!cloudUser;
  if(form) form.hidden=showCabinet;
  if(cabinet) cabinet.hidden=!showCabinet;
  if(showCabinet){
    openCabinetHome();
    cloudStatus(cloudUser?`Вход выполнен: ${userDisplayName()}.`:(cloud?'Войдите для синхронизации.':'Supabase SDK не загрузился.'));
    return;
  }
  const isRegister=mode==='register';
  if(title) title.textContent=isRegister?'Регистрация':'Вход';
  if(nick){nick.hidden=!isRegister; if(!isRegister) nick.value='';}
  if(email) email.placeholder='Email';
  if(pass){pass.placeholder='Пароль'; pass.setAttribute('autocomplete',isRegister?'new-password':'current-password');}
  if(signIn){signIn.hidden=isRegister; signIn.textContent='Войти';}
  if(signUp){signUp.hidden=!isRegister; signUp.textContent='Создать аккаунт';}
  clearAuthPlaque();
  setTimeout(()=>isRegister?$('#topCloudNickname')?.focus():$('#topCloudEmail')?.focus(),30);
}
async function saveNickname(){
  if(!cloud || !cloudUser){const st=$('#settingsStatus'); if(st) st.textContent='Сначала войдите в аккаунт.'; return;}
  const nickname=($('#settingsNickname')?.value||'').trim().slice(0,32);
  const health=healthProfileFromInputs();
  const st=$('#settingsStatus'); if(st) st.textContent='Сохраняю профиль...';
  rememberCloudProfile({nickname,...health});
  renderCloudUi();
  updateCabinetInfo();
  let authOk=false, cloudOk=false;
  try{
    const {data,error}=await cloud.auth.updateUser({data:{nickname}});
    if(error) throw error;
    if(data?.user) setCloudUser(data.user);
    rememberCloudProfile({nickname,...health});
    authOk=true;
  }catch(error){console.warn('Auth nickname update failed',error);}
  try{
    cloudOk=await saveCloudData({silent:true});
  }catch(error){console.warn('Cloud nickname save failed',error);}
  renderCloudUi();
  updateCabinetInfo();
  if(st){
    if(authOk || cloudOk) st.textContent='Профиль сохранён и будет синхронизирован между вашими устройствами.';
    else st.textContent='Профиль сохранён на устройстве. Облачная синхронизация повторится автоматически.';
  }
  cloudStatus((authOk||cloudOk)?'Настройки аккаунта обновлены.':'Профиль сохранён локально, облачная синхронизация не подтвердилась.');
  vibe(12);
}

function setResendConfirmVisible(show=true){const btn=$('#topResendConfirm'); if(btn) btn.hidden=!show;}
function setAuthPlaque(message,type='error',opts={}){
  const el=$('#topAuthMessage');
  if(!el) return;
  el.textContent=message||'';
  el.classList.toggle('success',type==='success');
  el.hidden=!message;
  setResendConfirmVisible(!!opts.showResend);
  if(message){el.animate?.([{opacity:0,transform:'translateY(-5px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:'ease-out'});}
}
function clearAuthPlaque(){setAuthPlaque('');}
async function resendConfirmationEmail(){
  if(!cloud){setAuthPlaque('Supabase не инициализирован. Проверьте интернет и перезагрузите страницу.'); return;}
  const email=normalizeEmailInput($('#topCloudEmail')?.value||$('#cloudEmail')?.value||localStorage.getItem(CLOUD_PENDING_CONFIRM_KEY)||'');
  if(!email){setAuthPlaque('Введите email, на который нужно отправить письмо подтверждения.', 'error', {showResend:true}); return;} if(!isEmailLikelyValid(email)){setAuthPlaque('Email выглядит некорректно. Проверьте, что нет пробелов или лишних символов.', 'error', {showResend:true}); return;}
  try{
    setCloudBusy(true,'Отправляю письмо подтверждения...');
    const redirectUrl=getAuthRedirectUrl();
    if(!cloud.auth?.resend) throw new Error('Метод повторной отправки недоступен. Обновите страницу.');
    const {error}=await cloud.auth.resend({type:'signup',email,options:{emailRedirectTo:redirectUrl,redirectTo:redirectUrl}});
    if(error) throw error;
    setAuthPlaque('Письмо подтверждения отправлено повторно. Проверьте «Входящие», «Спам» и «Промоакции».', 'success', {showResend:true});
    cloudStatus('Письмо подтверждения отправлено повторно. Если оно не приходит, проверьте SMTP и лимиты Supabase.');
    vibe([12,24,12]);
  }catch(error){
    console.warn(error);
    setAuthPlaque('Не удалось отправить письмо повторно: '+cloudErrorMessage(error), 'error', {showResend:true});
    cloudStatus('Повторная отправка письма не выполнена: '+cloudErrorMessage(error));
  }finally{setCloudBusy(false);}
}
function authErrorForMode(error,mode){
  const raw=(error?.message||String(error||'')).trim();
  const msg=raw.toLowerCase();
  if(mode==='register'){
    if(msg.includes('already') || msg.includes('registered') || msg.includes('exists') || msg.includes('duplicate')) return 'Эта почта уже зарегистрирована. Откройте «Вход» и войдите в аккаунт.';
    if(msg.includes('signup disabled')) return 'Регистрация отключена в Supabase. Включите Email Signups в Authentication → Providers.';
    if(msg.includes('password')) return 'Пароль должен быть не короче 6 символов.';
    if(msg.includes('invalid') && msg.includes('email')) return 'Supabase отклонил email. Поле уже очищает пробелы и невидимые символы; если email обычный, проверьте Authentication → Providers → Email и Auth Logs в Supabase.';
    if(msg.includes('email')) return 'Supabase вернул ошибку email: '+cloudErrorMessage(error);
    return 'Не удалось создать аккаунт: '+cloudErrorMessage(error);
  }
  if(msg.includes('invalid login') || msg.includes('invalid credentials') || msg.includes('not found') || msg.includes('user not found') || msg.includes('email not confirmed')){
    if(msg.includes('email not confirmed')) return 'Email ещё не подтверждён. Откройте письмо от Supabase и подтвердите регистрацию.';
    return 'Аккаунт с такой почтой не зарегистрирован или пароль введён неверно.';
  }
  if(msg.includes('failed to fetch') || msg.includes('network')) return cloudErrorMessage(error);
  return 'Не удалось войти: '+cloudErrorMessage(error);
}

function clearAuthPasswordFields(){const pass=$('#topCloudPassword'); if(pass) pass.value=''; const oldPass=$('#cloudPassword'); if(oldPass) oldPass.value='';}
function closeTopAuth(){const panel=$('#topAuthPanel'); if(panel) panel.hidden=true;}
async function topCloudSignIn(){await cloudSignIn(); if(cloudUser) openTopAuth('cabinet');}
async function topCloudSignUp(){await cloudSignUp(); if(cloudUser) openTopAuth('cabinet');}
function renderCloudUi(){
  const signed=!!cloudUser;
  const signIn=$('#cloudSignIn'), signUp=$('#cloudSignUp'), signOut=$('#cloudSignOut');
  const email=$('#cloudEmail'), pass=$('#cloudPassword');
  if(signIn) signIn.hidden=signed;
  if(signUp) signUp.hidden=signed;
  if(signOut) signOut.hidden=!signed;
  if(email) email.disabled=signed||cloudBusy;
  if(pass) pass.disabled=signed||cloudBusy;
  const topStatus=$('#topAuthStatus'), topLogin=$('#topLoginBtn'), topRegister=$('#topRegisterBtn'), topLogout=$('#topLogoutBtn'), topPanel=$('#topAuthPanel');
  if(topLogin) topLogin.hidden=signed;
  if(topRegister) topRegister.hidden=signed;
  if(topLogout) topLogout.hidden=true;
  if(topStatus){
    topStatus.hidden=!signed;
    topStatus.textContent=signed?userDisplayName():'Вы';
    topStatus.title=signed?'Открыть личный кабинет':'Вы';
  }
  updateCabinetInfo();
  if(signed && topPanel && !topPanel.hidden){
    const form=$('#topAuthForm'), settings=$('#accountSettings');
    if(form && !form.hidden) openTopAuth('cabinet');
    else updateCabinetInfo();
  }
  if(signed) cloudStatus(`Вход выполнен: ${userDisplayName()}. Синхронизация выполняется автоматически.`);
  else cloudStatus(cloud?'Войдите или зарегистрируйтесь, чтобы загрузить свои рецепты и календарь.':'Supabase SDK не загрузился. Проверьте интернет-соединение.');
}
function setCloudBusy(on,text){cloudBusy=on; renderCloudUi(); if(text) cloudStatus(text);}

function normalizeEmailInput(value){
  return String(value||'')
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g,'')
    .replace(/\u00A0/g,' ')
    .trim()
    .toLowerCase();
}
function isEmailLikelyValid(email){
  if(!email) return false;
  if(email.includes(' ') || email.includes('\n') || email.includes('\t')) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
}
function cloudCredentials(){
  const topPanel=$('#topAuthPanel');
  const topForm=$('#topAuthForm');
  const useTop=topPanel && !topPanel.hidden && topForm && !topForm.hidden;
  const emailEl=useTop?$('#topCloudEmail'):$('#cloudEmail');
  const passEl=useTop?$('#topCloudPassword'):$('#cloudPassword');
  const nickEl=useTop?$('#topCloudNickname'):null;
  const rawEmail=emailEl?.value||'';
  const email=normalizeEmailInput(rawEmail);
  if(emailEl && emailEl.value!==email) emailEl.value=email;
  const password=passEl?.value||'';
  const nickname=(nickEl?.value||'').trim().slice(0,32);
  if(!email || !password){setAuthPlaque('Введите email и пароль.'); return null;}
  if(!isEmailLikelyValid(email)){setAuthPlaque('Email выглядит некорректно. Проверьте, что нет пробелов или лишних символов.'); return null;}
  if(password.length<6){setAuthPlaque('Пароль должен быть не короче 6 символов.'); return null;}
  const otherEmail=useTop?$('#cloudEmail'):$('#topCloudEmail');
  const otherPass=useTop?$('#cloudPassword'):$('#topCloudPassword');
  if(otherEmail && !otherEmail.value) otherEmail.value=email;
  if(otherPass && !otherPass.value) otherPass.value=password;
  return {email,password,nickname};
}
function cloudErrorMessage(error){
  const raw=error?.message||String(error||'');
  const msg=raw.toLowerCase();
  if(msg.includes('failed to fetch') || msg.includes('network')) return 'Нет соединения с Supabase. Проверьте интернет, VPN/блокировки и что приложение открыто по обычной ссылке, а не из закрытого предпросмотра.';
  if(msg.includes('relation') || msg.includes('does not exist')) return 'Одна из таблиц Table book ещё не создана в Supabase. Выполните актуальный supabase_setup.sql.';
  if(msg.includes('row-level') || msg.includes('policy') || msg.includes('permission') || msg.includes('rls')) return 'Нет доступа к пользовательским данным. Проверьте RLS-политики Table book.';
  if(msg.includes('invalid login')) return 'Неверный email или пароль, либо email ещё не подтверждён.';
  if(msg.includes('email not confirmed')) return 'Email ещё не подтверждён. Откройте письмо от Supabase и подтвердите регистрацию.';
  if(msg.includes('signup disabled')) return 'Регистрация отключена в Supabase Authentication → Providers → Email.';
  if(msg.includes('rate') || msg.includes('too many') || msg.includes('over')) return 'Сработал лимит отправки писем Supabase. Подождите или подключите Custom SMTP.';
  if(msg.includes('smtp') || msg.includes('email provider')) return 'Проблема с отправкой email в Supabase. Проверьте SMTP-настройки и Auth Logs.';
  return raw||'Неизвестная ошибка Supabase.';
}
function cloudSnapshot(){
  const base=tableBookSnapshot();
  base.state={
    theme:state.theme||'light',
    route:'home',
    country:null,
    filterCat:null,
    editingId:null,
    selectedMealDate:null,
    mealEditorOpen:false,
    mealStorageVersion:2,
    profile:{email:cloudUser?.email||cloudProfile.email||'',nickname:userNickname(),...normalizeHealthProfile()},
    likedRecipes:normalizeLikedRecipes(state.likedRecipes),
    encyTab:state.encyTab||'Все'
  };
  return base;
}

function cloudLastSyncKey(user=cloudUser){return user?.id?CLOUD_LAST_SYNC_KEY_PREFIX+user.id:null;}
function rememberCloudSyncedAt(value,user=cloudUser){const k=cloudLastSyncKey(user); if(!k) return; try{value?localStorage.setItem(k,String(value)):localStorage.removeItem(k)}catch(e){}}
function recipeStamp(recipe){const t=Date.parse(recipe?.updatedAt||recipe?.savedAt||recipe?.createdAt||0); return Number.isFinite(t)?t:0;}
function normalizeRecipeForSync(recipe){return Object.assign({updatedAt:new Date().toISOString()},recipe||{});}
function mergeRecipeLists(localList,cloudList){
  const map=new Map();
  const local=withoutLegacyDuplicateRecipes(localList);
  const cloudRecipes=withoutLegacyDuplicateRecipes(cloudList);
  local.forEach(r=>{if(r&&r.id) map.set(r.id,r);});
  cloudRecipes.forEach(r=>{
    if(!r||!r.id) return;
    const existing=map.get(r.id);
    if(!existing){map.set(r.id,r); return;}
    const cloudTime=recipeStamp(r), localTime=recipeStamp(existing);
    if(cloudTime>=localTime) map.set(r.id,Object.assign({},existing,r));
  });
  return withoutLegacyDuplicateRecipes(Array.from(map.values())).sort((a,b)=>recipeStamp(b)-recipeStamp(a));
}
function recipeListsSignature(list){return JSON.stringify((Array.isArray(list)?list:[]).map(r=>[r.id,r.updatedAt||'',r.title||'']));}
const recipeOverrideCloudLoaded=new Set();
const recipeOverrideCloudLoads=new Map();
function recipeOverrideCloudKey(recipeId){return `${cloudUser?.id||'guest'}:${canonicalRecipeId(recipeId,'base')}`;}
async function loadRecipeOverrideFromCloud(recipeId,{silent=true}={}){
  if(!cloud||!cloudUser) return false;
  const id=canonicalRecipeId(recipeId,'base');
  if(!id||!baseRecipeIndex.has(id)) return false;
  const key=recipeOverrideCloudKey(id);
  if(recipeOverrideCloudLoaded.has(key)) return false;
  if(recipeOverrideCloudLoads.has(key)) return recipeOverrideCloudLoads.get(key);
  const task=(async()=>{
    try{
      const {data,error}=await cloud.from(CLOUD_RECIPE_OVERRIDE_TABLE)
        .select('recipe_id,recipe_data,updated_at')
        .eq('user_id',cloudUser.id)
        .eq('recipe_id',id)
        .maybeSingle();
      if(error) throw error;
      recipeOverrideCloudLoaded.add(key);
      if(!data?.recipe_data||typeof data.recipe_data!=='object') return false;
      const next=Object.assign({},data.recipe_data,{updatedAt:data.recipe_data.updatedAt||data.updated_at||null});
      const changed=JSON.stringify(recipeOverrides[id]||null)!==JSON.stringify(next);
      if(changed){
        recipeOverrides[id]=next;
        invalidateCatalogRecipeCache();
      }
      return changed;
    }catch(error){
      console.warn('Recipe override load failed',error);
      if(!silent) cloudStatus('Не удалось загрузить изменённый рецепт: '+cloudErrorMessage(error));
      return false;
    }finally{recipeOverrideCloudLoads.delete(key);}
  })();
  recipeOverrideCloudLoads.set(key,task);
  return task;
}
async function saveRecipeOverrideToCloud(recipeId,recipeData){
  if(!cloud||!cloudUser) return false;
  const id=canonicalRecipeId(recipeId,'base');
  try{
    const row={user_id:cloudUser.id,recipe_id:id,recipe_data:recipeData,updated_at:new Date().toISOString()};
    const {error}=await cloud.from(CLOUD_RECIPE_OVERRIDE_TABLE).upsert(row,{onConflict:'user_id,recipe_id'});
    if(error) throw error;
    recipeOverrides[id]=recipeData;
    recipeOverrideCloudLoaded.add(recipeOverrideCloudKey(id));
    invalidateCatalogRecipeCache();
    queuePersonalCacheSave();
    queueBackupSave();
    return true;
  }catch(error){console.warn('Recipe override save failed',error); cloudStatus('Не удалось сохранить изменённый рецепт: '+cloudErrorMessage(error)); return false;}
}
async function deleteRecipeOverrideFromCloud(recipeId){
  if(!cloud||!cloudUser) return false;
  const id=canonicalRecipeId(recipeId,'base');
  try{
    const {error}=await cloud.from(CLOUD_RECIPE_OVERRIDE_TABLE).delete().eq('user_id',cloudUser.id).eq('recipe_id',id);
    if(error) throw error;
    delete recipeOverrides[id];
    recipeOverrideCloudLoaded.add(recipeOverrideCloudKey(id));
    invalidateCatalogRecipeCache();
    queuePersonalCacheSave();
    queueBackupSave();
    return true;
  }catch(error){console.warn('Recipe override delete failed',error); cloudStatus('Не удалось сбросить рецепт: '+cloudErrorMessage(error)); return false;}
}
function applyCloudPayload(data,{replace=false,silent=true}={}){
  if(!data) return {changed:false,cloudCount:0,localCount:myRecipes.length};
  const beforeSig=recipeListsSignature(myRecipes);
  const beforeMealSig=mealPlanSignature();
  const cloudRecipes=withoutLegacyDuplicateRecipes(data.my_recipes);
  cloudSyncApplying=true;
  try{
    if(data.app_state && typeof data.app_state==='object'){
      if(data.app_state.profile && typeof data.app_state.profile==='object') rememberCloudProfile(data.app_state.profile);
      if(data.app_state.theme && data.app_state.theme!==state.theme){state.theme=data.app_state.theme; setTheme();}
      if(Array.isArray(data.app_state.likedRecipes)) state.likedRecipes=normalizeLikedRecipes(data.app_state.likedRecipes);
      if(data.app_state.encyTab) state.encyTab=data.app_state.encyTab;
      if(data.app_state.mealPlan && typeof data.app_state.mealPlan==='object'){
        legacyMealPlanPending=mergeMealPlans(legacyMealPlanPending,data.app_state.mealPlan);
      }
      if(data.app_state.mealMonth && !state.mealMonth) state.mealMonth=data.app_state.mealMonth;
    }
    myRecipes=withoutLegacyDuplicateRecipes(myRecipes);
    if(replace) myRecipes=cloudRecipes;
    else if(cloudRecipes.length) myRecipes=mergeRecipeLists(myRecipes,cloudRecipes);
    localStorage.setItem(STORAGE_STATE_KEY,JSON.stringify(publicStateForStorage()));
    queuePersonalCacheSave();
    queueBackupSave();
  }finally{cloudSyncApplying=false;}
  if(state.route==='myview') renderMyRecipes();
  if(state.route==='mealview') renderMealCalendar();
  if(state.route==='likedview') renderLikedRecipes(false);
  if(state.route==='encyclopediaview') renderEncyclopedia();
  if(mealDraftDate&&state.selectedMealDate===mealDraftDate){mealDraft=normalizeMealDay(state.mealPlan[mealDraftDate]); renderMealDayEditor();}
  updateStats();
  updateHomeMeta();
  updateCabinetInfo();
  const afterSig=recipeListsSignature(myRecipes);
  const afterMealSig=mealPlanSignature();
  const changed=beforeSig!==afterSig || beforeMealSig!==afterMealSig;
  if(data.updated_at) rememberCloudSyncedAt(data.updated_at);
  if(changed && !silent) cloudStatus(`Синхронизировано: ${cloudRecipes.length} ${plural(cloudRecipes.length,['рецепт','рецепта','рецептов'])} и календарь питания из облака.`);
  return {changed,cloudCount:cloudRecipes.length,localCount:myRecipes.length};
}
let cloudLoginSync=null;
async function syncCloudDataAfterLogin(options={}){
  if(!cloud || !cloudUser) return false;
  const userId=cloudUser.id;
  if(cloudLoginSync?.userId===userId) return cloudLoginSync.promise;
  const promise=runCloudDataAfterLogin(options).finally(()=>{if(cloudLoginSync?.promise===promise) cloudLoginSync=null;});
  cloudLoginSync={userId,promise};
  return promise;
}
async function ensureCloudLibraryLoaded({silent=true}={}){
  if(!cloud||!cloudUser) return false;
  if(cloudLibraryLoadedForUser===cloudUser.id) return true;
  if(cloudLibraryLoad?.userId===cloudUser.id) return cloudLibraryLoad.promise;
  const userId=cloudUser.id;
  const promise=syncCloudDataAfterLogin({silent,reason:'personal-view'}).then(result=>{
    if(cloudUser?.id===userId) cloudLibraryLoadedForUser=userId;
    return result;
  }).finally(()=>{if(cloudLibraryLoad?.promise===promise) cloudLibraryLoad=null;});
  cloudLibraryLoad={userId,promise};
  return promise;
}
let cloudShellSync=null;
async function syncCloudShellAfterLogin({silent=true}={}){
  if(!cloud||!cloudUser) return false;
  const userId=cloudUser.id;
  if(cloudShellSync?.userId===userId) return cloudShellSync.promise;
  const promise=(async()=>{
    try{
      const {data,error}=await cloud.from(CLOUD_TABLE).select('app_state,updated_at').eq('user_id',userId).maybeSingle();
      if(error) throw error;
      if(cloudUser?.id!==userId||!data?.app_state) return false;
      const shell=data.app_state;
      cloudSyncApplying=true;
      try{
        if(shell.profile&&typeof shell.profile==='object') rememberCloudProfile(shell.profile);
        if(shell.theme&&shell.theme!==state.theme){state.theme=shell.theme;setTheme();}
        if(Array.isArray(shell.likedRecipes)) state.likedRecipes=normalizeLikedRecipes(shell.likedRecipes);
        if(shell.encyTab) state.encyTab=shell.encyTab;
        localStorage.setItem(STORAGE_STATE_KEY,JSON.stringify(publicStateForStorage()));
      }finally{cloudSyncApplying=false;}
      if(data.updated_at) rememberCloudSyncedAt(data.updated_at);
      updateStats();
      updateHomeMeta();
      updateCabinetInfo();
      if(state.route==='likedview') renderLikedRecipes(false);
      if(state.route==='encyclopediaview') renderEncyclopedia();
      if(!silent) cloudStatus('Профиль и основные настройки синхронизированы.');
      return true;
    }catch(error){
      console.warn('Cloud shell sync failed',error);
      if(!silent) cloudStatus('Не удалось загрузить настройки профиля: '+cloudErrorMessage(error));
      return false;
    }
  })().finally(()=>{if(cloudShellSync?.promise===promise) cloudShellSync=null;});
  cloudShellSync={userId,promise};
  return promise;
}
async function runCloudDataAfterLogin({silent=true,reason='login'}={}){
  if(!cloud || !cloudUser) return false;
  try{
    const {data,error}=await cloud.from(CLOUD_TABLE).select('app_state,my_recipes,updated_at').eq('user_id',cloudUser.id).maybeSingle();
    if(error) throw error;
    if(!data){
      await saveCloudData({silent:true});
      await migrateLegacyMealPlan();
      await flushDirtyMealDays();
      mealMonthCache.clear();
      if(!silent) cloudStatus(myRecipes.length?'Локальные рецепты сохранены в облако для этого аккаунта.':'Облачных рецептов для этого аккаунта пока нет.');
      return false;
    }
    const result=applyCloudPayload(data,{replace:false,silent});
    await migrateLegacyMealPlan();
    await flushDirtyMealDays();
    mealMonthCache.clear();
    if(result.changed){
      if(!silent) cloudStatus(`Синхронизация выполнена: на устройстве ${result.localCount} ${plural(result.localCount,['рецепт','рецепта','рецептов'])}.`);
      saveCloudData({silent:true}).catch(e=>console.warn('Merged cloud save failed',e));
    }else if(!silent){
      cloudStatus(result.cloudCount?`Синхронизация проверена: ${result.cloudCount} ${plural(result.cloudCount,['рецепт','рецепта','рецептов'])} уже на устройстве.`:'В облаке пока нет сохранённых рецептов.');
    }
    return true;
  }catch(error){console.warn('Cloud sync failed',error); if(!silent) cloudStatus('Не удалось синхронизировать рецепты: '+cloudErrorMessage(error)); return false;}
}
async function fetchCloudProfile({silent=true}={}){
  if(!cloud || !cloudUser) return false;
  try{
    const {data,error}=await cloud.from(CLOUD_TABLE).select('app_state,updated_at').eq('user_id',cloudUser.id).maybeSingle();
    if(error) throw error;
    const profile=data?.app_state?.profile;
    if(profile && typeof profile==='object'){
      rememberCloudProfile({...profile,email:profile.email||cloudUser.email||'',nickname:profile.nickname||''});
      renderCloudUi();
      updateCabinetInfo();
      if(!silent) cloudStatus('Профиль и никнейм загружены из облака.');
      return true;
    }
    if(!silent) cloudStatus('Соединение есть. Облачный профиль пока пуст. Новые данные будут синхронизироваться автоматически.');
    return false;
  }catch(error){console.warn(error); if(!silent) cloudStatus('Не удалось загрузить профиль: '+cloudErrorMessage(error)); return false;}
}
async function ensureCloudRow(){
  if(!cloud || !cloudUser) return false;
  const snap=cloudSnapshot();
  const row={user_id:cloudUser.id,app_state:snap.state,my_recipes:snap.myRecipes,updated_at:new Date().toISOString()};
  const {error}=await cloud.from(CLOUD_TABLE).upsert(row,{onConflict:'user_id'});
  if(error) throw error;
  return true;
}
async function checkCloudConnection(){
  if(!cloud){cloudStatus('Supabase SDK или REST-клиент не инициализирован. Проверьте интернет-соединение.'); return false;}
  try{
    setCloudBusy(true,'Проверяю соединение с Supabase...');
    const {data:sessionData,error:sessionError}=await cloud.auth.getSession();
    if(sessionError) throw sessionError;
    const activeUser=sessionData?.session?.user||cloudUser||null;
    if(activeUser) setCloudUser(activeUser);
    const {error:tableError}=await cloud.from(CLOUD_TABLE).select('user_id',{head:true,count:'exact'}).limit(1);
    if(tableError) throw tableError;
    const {error:mealTableError}=await cloud.from(CLOUD_MEAL_TABLE).select('meal_date',{head:true,count:'exact'}).limit(1);
    if(mealTableError) throw mealTableError;
    const {error:overrideTableError}=await cloud.from(CLOUD_RECIPE_OVERRIDE_TABLE).select('recipe_id',{head:true,count:'exact'}).limit(1);
    if(overrideTableError) throw overrideTableError;
    if(activeUser) await syncCloudDataAfterLogin({silent:true,reason:'check'});
    cloudStatus(activeUser?'Соединение есть. Профиль, рецепты и помесячный архив меню доступны. Никнейм: '+userDisplayName()+'. Рецептов на устройстве: '+myRecipes.length+'.':'Соединение есть. Облачные таблицы доступны. Войдите, чтобы проверить пользовательскую запись.');
    renderCloudUi();
    return true;
  }catch(error){console.warn(error); cloudStatus('Проверка Supabase: '+cloudErrorMessage(error)); return false;}
  finally{setCloudBusy(false);}
}
async function saveCloudData({silent=false}={}){
  if(!cloud || !cloudUser){if(!silent) cloudStatus('Сначала войдите в аккаунт.'); return false;}
  try{
    if(!silent) setCloudBusy(true,'Сохраняю данные в облако...');
    const snap=cloudSnapshot();
    const {error}=await cloud.from(CLOUD_TABLE).upsert({user_id:cloudUser.id,app_state:snap.state,my_recipes:snap.myRecipes,updated_at:new Date().toISOString()},{onConflict:'user_id'});
    if(error) throw error;
    if(!silent) cloudStatus(`Сохранено в облако: ${new Date().toLocaleString('ru-RU')}.`);
    return true;
  }catch(error){console.warn(error); cloudStatus('Не удалось сохранить в облако: '+cloudErrorMessage(error)); return false;}
  finally{if(!silent) setCloudBusy(false); else renderCloudUi();}
}
async function loadCloudData({silent=false}={}){
  if(!cloud || !cloudUser){if(!silent) cloudStatus('Сначала войдите в аккаунт.'); return false;}
  try{
    if(!silent) setCloudBusy(true,'Загружаю данные из облака...');
    const {data,error}=await cloud.from(CLOUD_TABLE).select('app_state,my_recipes,updated_at').eq('user_id',cloudUser.id).maybeSingle();
    if(error) throw error;
    if(!data){cloudStatus('В облаке пока нет сохранённых данных. Новые данные будут синхронизироваться автоматически.'); return false;}
    const count=Array.isArray(data.my_recipes)?data.my_recipes.length:0;
    if(!silent){
      const when=data.updated_at?new Date(data.updated_at).toLocaleString('ru-RU'):'без даты';
      const ok=confirm(`Загрузить данные из облака? Текущие пользовательские рецепты на этом устройстве будут заменены. В облаке: ${count} ${plural(count,['рецепт','рецепта','рецептов'])}. Обновлено: ${when}.`);
      if(!ok){cloudStatus('Загрузка из облака отменена.'); return false;}
    }
    cloudSyncApplying=true;
    try{
      myRecipes=withoutLegacyDuplicateRecipes(data.my_recipes);
      if(data.app_state && typeof data.app_state==='object'){
        const incomingState=Object.assign({},data.app_state);
        if(incomingState.mealPlan && typeof incomingState.mealPlan==='object') legacyMealPlanPending=mergeMealPlans(legacyMealPlanPending,incomingState.mealPlan);
        delete incomingState.mealPlan;
        delete incomingState.mealPlanUpdatedAt;
        Object.assign(state,incomingState);
        state.mealStorageVersion=2;
        state.likedRecipes=normalizeLikedRecipes(data.app_state.likedRecipes);
        state.encyTab=data.app_state.encyTab||'Все';
        if(data.app_state.profile && typeof data.app_state.profile==='object') rememberCloudProfile(data.app_state.profile);
        if(state.country==='Италия'||state.country==='Испания') state.country='Средиземноморская';
        state.route='myview';
        state.editingId=null;
      }
      localStorage.setItem(STORAGE_STATE_KEY,JSON.stringify(publicStateForStorage()));
        queuePersonalCacheSave();
      persistBackup();
      if(data.updated_at) rememberCloudSyncedAt(data.updated_at);
    }finally{cloudSyncApplying=false;}
    await migrateLegacyMealPlan();
    await flushDirtyMealDays();
    mealMonthCache.clear();
    await loadMealMonth(relevantMealMonthKey(),{force:true,silent:true});
    setTheme(); updateStats(); renderCountries(); renderMyRecipes(); renderMealCalendar(); renderLikedRecipes(false); renderEncyclopedia(); resetMyForm(); showView('myview');
    cloudStatus('Данные загружены из облака и сохранены на этом устройстве.');
    vibe(16);
    return true;
  }catch(error){console.warn(error); cloudStatus('Не удалось загрузить из облака: '+cloudErrorMessage(error)); return false;}
  finally{if(!silent) setCloudBusy(false); else renderCloudUi();}
}
function queueCloudSave(){
  if(!cloudUser || !cloud || cloudSyncApplying) return;
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer=setTimeout(()=>saveCloudData({silent:true}),850);
}
async function cloudSignUp(){
  if(!cloud){cloudStatus('Supabase не инициализирован. Проверьте интернет и доступ к проекту.'); return;}
  const cred=cloudCredentials(); if(!cred) return;
  try{
    setCloudBusy(true,'Создаю аккаунт...');
    const redirectUrl=getAuthRedirectUrl();
    const options={data:{nickname:cred.nickname||''},emailRedirectTo:redirectUrl,redirectTo:redirectUrl};
    const {data,error}=await cloud.auth.signUp({email:cred.email,password:cred.password,options});
    if(error) throw error;
    const duplicateByIdentities=!data?.session && data?.user && Array.isArray(data.user.identities) && data.user.identities.length===0;
    if(duplicateByIdentities){
      setAuthPlaque('Эта почта уже зарегистрирована. Откройте «Вход» и войдите в аккаунт.');
      cloudStatus('Регистрация не выполнена: почта уже зарегистрирована.');
      return;
    }
    if(data.session?.user){
      setCloudUser(data.session.user);
      rememberCloudProfile({nickname:cred.nickname||'',email:cred.email});
      renderCloudUi();
      clearAuthPasswordFields();
      localStorage.removeItem(CLOUD_PENDING_CONFIRM_KEY);
      setAuthPlaque('Аккаунт создан. Вход выполнен.', 'success');
      cloudStatus(`Аккаунт создан${cred.nickname?' для '+cred.nickname:''}. Вход выполнен, данные можно сохранить в облако.`);
      saveCloudData({silent:true}).catch(e=>console.warn('Initial cloud save failed',e));
      cloudAutoSyncDoneForUser=cloudUser.id;
      syncCloudShellAfterLogin({silent:true}).catch(e=>console.warn('Initial settings sync failed',e));
    }else{
      localStorage.setItem(CLOUD_PENDING_CONFIRM_KEY,cred.email);
      setAuthPlaque('Аккаунт создан. Подтвердите email в письме — после подтверждения вас вернёт в приложение.', 'success', {showResend:true});
      cloudStatus('Аккаунт создан. Если включено подтверждение email, откройте письмо от Supabase и затем войдите. Если письма нет, нажмите «Отправить письмо ещё раз».');
    }
  }
  catch(error){console.warn(error); setAuthPlaque(authErrorForMode(error,'register')); cloudStatus('Не удалось зарегистрироваться: '+cloudErrorMessage(error));}
  finally{setCloudBusy(false);}
}
async function cloudSignIn(){
  if(!cloud){cloudStatus('Supabase не инициализирован. Проверьте интернет и доступ к проекту.'); return;}
  const cred=cloudCredentials(); if(!cred) return;
  try{
    setCloudBusy(true,'Выполняю вход...');
    const {data,error}=await cloud.auth.signInWithPassword({email:cred.email,password:cred.password});
    if(error) throw error;
    const nextUser=data.user||data.session?.user||null;
    if(!nextUser) throw new Error('Supabase не вернул данные пользователя. Проверьте настройки Email Auth.');
    setCloudUser(nextUser);
    rememberCloudProfile({email:nextUser.email||cred.email});
    renderCloudUi();
    setAuthPlaque('', 'success');
    cloudStatus('Вход выполнен. Профиль загружается сейчас, личная библиотека — при её открытии.');
    clearAuthPasswordFields();
    vibe([12,24,12]);
    cloudAutoSyncDoneForUser=cloudUser.id;
    syncCloudShellAfterLogin({silent:true}).catch(e=>console.warn('Cloud settings sync failed',e));
  }
  catch(error){console.warn(error); const msg=authErrorForMode(error,'login'); const raw=(error?.message||String(error||'')).toLowerCase(); setAuthPlaque(msg,'error',{showResend:raw.includes('email not confirmed')||raw.includes('confirm')}); cloudStatus('Не удалось войти: '+cloudErrorMessage(error));}
  finally{setCloudBusy(false);}
}
async function cloudSignOut(){
  if(!cloud){
    setCloudUser(null);
    resetLocalPersonalDataAfterLogout();
    renderCloudUi();
    closeTopAuth();
    return;
  }
  try{
    setCloudBusy(true,'Выхожу из аккаунта...');
    const {error}=await cloud.auth.signOut({scope:'local'});
    if(error) throw error;
    setCloudUser(null);
    resetLocalPersonalDataAfterLogout();
    renderCloudUi();
    closeTopAuth();
    cloudStatus('Вы вышли только на этом устройстве. Сессии на других устройствах сохранены.');
  }
  catch(error){console.warn(error); cloudStatus('Не удалось выйти: '+cloudErrorMessage(error));}
  finally{setCloudBusy(false);}
}
async function initCloudAuth(){
  if(!cloud){renderCloudUi(); return;}
  try{
    await processAuthRedirect();
    const {data,error}=await cloud.auth.getSession(); if(error) throw error;
    setCloudUser(data.session?.user||null);
    renderCloudUi();
    if(cloudUser){
      cloudStatus('Email подтверждён. Вы вошли в аккаунт: '+userDisplayName()+'.');
      cloudAutoSyncDoneForUser=cloudUser.id;
      syncCloudShellAfterLogin({silent:true}).catch(e=>console.warn('Initial settings sync failed',e));
    }else{
      resetLocalPersonalDataAfterLogout({silent:true});
      if(hasAuthRedirectParams()){
        cloudStatus('Подтверждение обработано, но сессия не сохранилась. Нажмите «Войти» и войдите с email и паролем.');
      }else{
        cloudStatus('Войдите в аккаунт, чтобы загрузить свои рецепты и календарь.');
      }
    }
    cloud.auth.onAuthStateChange((_event,session)=>{
      setCloudUser(session?.user||null);
      renderCloudUi();
      if(cloudUser && cloudAutoSyncDoneForUser!==cloudUser.id){
        cloudAutoSyncDoneForUser=cloudUser.id;
        syncCloudShellAfterLogin({silent:true}).catch(e=>console.warn('Profile settings sync failed',e));
      }else if(!cloudUser){
        resetLocalPersonalDataAfterLogout({silent:true});
      }
    });
  }
  catch(error){console.warn(error); cloudStatus('Не удалось проверить вход Supabase: '+cloudErrorMessage(error)); renderCloudUi();}
}

function myCategoryCounts(){const map={}; categoryOrder.forEach(c=>map[c]=0); myRecipes.forEach(r=>{const cat=r.category||'Горячие блюда'; map[cat]=(map[cat]||0)+1;}); return map;}
function fillMyCategory(){const sel=$('#myCategory'); if(sel) sel.innerHTML=categoryOrder.map(c=>`<option value="${c}">${c}</option>`).join('')}
function showMyLibrary(render=true){const lib=$('#myLibrary'), editor=$('#myRecipeEditor'); if(lib) lib.hidden=false; if(editor) editor.hidden=true; state.editingId=null; const title=$('#formTitle'); if(title) title.textContent='Создание рецепта'; saveState(); if(render) renderMyRecipes();}
function openMyEditor(category=null){const lib=$('#myLibrary'), editor=$('#myRecipeEditor'); if(lib) lib.hidden=true; if(editor) editor.hidden=false; resetMyForm(false); $('#formTitle').textContent='Создание рецепта'; const cat=category||state.myCat||'Горячие блюда'; const sel=$('#myCategory'); if(sel) sel.value=cat; updateKbjuPreview(); setTimeout(()=>$('#myTitle')?.focus(),40); window.scrollTo({top:0,behavior:'smooth'}); vibe(10);}
function resetMyForm(save=true){state.editingId=null; const title=$('#formTitle'); if(title) title.textContent='Создание рецепта'; const values={myTitle:'',myTime:'',myServings:'',myCountry:'',myWeight:'',myKcal100:'',myProtein100:'',myFat100:'',myCarbs100:'',myIngredients:'',mySteps:'',myTips:''}; Object.entries(values).forEach(([id,val])=>{const el=$('#'+id); if(el) el.value=val;}); const weight=$('#myWeight'); if(weight) weight.dataset.autoEstimate=''; const cat=$('#myCategory'); if(cat) cat.value=state.myCat||'Горячие блюда'; const diff=$('#myDifficulty'); if(diff) diff.value='легко'; renderProductRows([{name:'',amount:'',unit:'g',kcal:'',protein:'',fat:'',carbs:''}]); updateKbjuPreview(); if(save) saveState();}
function normalizePortionName(value){return String(value||'').toLocaleLowerCase('ru-RU').replace(/ё/g,'е').replace(/[^a-zа-я0-9\s-]/gi,' ').replace(/\s+/g,' ').trim();}
function normalizeProductPortionRows(rows){return (Array.isArray(rows)?rows:[]).map(row=>({canonical_name:String(row.canonical_name||'').trim(),aliases:Array.isArray(row.aliases)?row.aliases.map(String):[],unit_code:String(row.unit_code||'').trim(),unit_label:String(row.unit_label||'').trim(),grams:Number(row.grams)||0,note:String(row.note||'').trim()})).filter(row=>row.canonical_name&&row.unit_code&&row.grams>0);}
function normalizeFoodNutritionRows(rows){return (Array.isArray(rows)?rows:[]).map(row=>({canonical_name:String(row.canonical_name||'').trim(),aliases:Array.isArray(row.aliases)?row.aliases.map(String):[],kcal:Number(row.kcal)||0,protein:Number(row.protein)||0,fat:Number(row.fat)||0,carbs:Number(row.carbs)||0,fdc_id:Number(row.fdc_id)||null,data_type:String(row.data_type||'').trim(),dataset_release:String(row.dataset_release||'').slice(0,10),source_name:String(row.source_name||'USDA FoodData Central').trim(),source_url:String(row.source_url||'https://fdc.nal.usda.gov/').trim()})).filter(row=>row.canonical_name&&row.kcal>=0&&row.protein>=0&&row.fat>=0&&row.carbs>=0);}
function mergeFoodNutritionRows(primary,fallback=window.TABLE_BOOK_FOOD_NUTRITION_FALLBACK||[]){const merged=normalizeFoodNutritionRows(primary),known=new Set(merged.map(row=>normalizePortionName(row.canonical_name))); normalizeFoodNutritionRows(fallback).forEach(row=>{const key=normalizePortionName(row.canonical_name);if(key&&!known.has(key)){merged.push(row);known.add(key);}}); return merged;}
function normalizeFoodStorageRows(rows){return (Array.isArray(rows)?rows:[]).map(row=>({canonical_name:String(row.canonical_name||'').trim(),aliases:Array.isArray(row.aliases)?row.aliases.map(String):[],fridge_days_min:Math.max(0,Number(row.fridge_days_min)||0),fridge_days_max:Math.max(0,Number(row.fridge_days_max)||0),note:String(row.note||'').trim(),source_name:String(row.source_name||'USDA FoodKeeper').trim(),source_url:String(row.source_url||'https://www.foodsafety.gov/keep-food-safe/foodkeeper-app').trim()})).filter(row=>row.canonical_name&&row.fridge_days_max>0);}
function referenceNames(row){return [row?.canonical_name,...(Array.isArray(row?.aliases)?row.aliases:[])].map(normalizePortionName).filter(Boolean);}
function referenceNameMatches(row,name,{partial=true}={}){const key=normalizePortionName(name); if(!key) return false; return referenceNames(row).some(candidate=>candidate===key || (partial && candidate.length>3 && (key.includes(candidate)||(key.length>=7&&candidate.includes(key)))));}
function foodNutritionEntryExact(name){const key=normalizePortionName(name); return key?foodNutritionReference.find(row=>referenceNames(row).includes(key))||null:null;}
function foodNutritionEntry(name){return foodNutritionReference.find(row=>referenceNameMatches(row,name,{partial:false}))||foodNutritionReference.find(row=>referenceNameMatches(row,name,{partial:true}))||null;}
function foodStorageEntry(name){return foodStorageReference.find(row=>referenceNameMatches(row,name,{partial:false}))||foodStorageReference.find(row=>referenceNameMatches(row,name,{partial:true}))||null;}
function productIdentityKey(name){
  const nutrition=foodNutritionEntry(name);
  if(nutrition) return `nutrition:${normalizePortionName(nutrition.canonical_name)}`;
  const portion=productPortionWeights.find(row=>referenceNameMatches(row,name,{partial:false}))||productPortionWeights.find(row=>referenceNameMatches(row,name,{partial:true}));
  return `name:${normalizePortionName(portion?.canonical_name||cleanShoppingProductName(name))}`;
}
const referenceQueryLoaded={nutrition:new Set(),portions:new Set(),storage:new Set()};
const referenceQueryPending=new Map();
const localDataScriptLoads=new Map();
let localFoodReferenceReady=false;
function loadLocalDataScript(src){
  if(localDataScriptLoads.has(src)) return localDataScriptLoads.get(src);
  const task=new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src=src;
    script.async=true;
    script.onload=()=>resolve(true);
    script.onerror=()=>reject(new Error(`Не удалось загрузить ${src}`));
    document.head.appendChild(script);
  });
  localDataScriptLoads.set(src,task);
  return task;
}
async function ensureLocalFoodReferences(){
  if(localFoodReferenceReady) return true;
  try{
    await loadLocalDataScript('./js/food-reference.js?v=20260827-targeted-load');
    await loadLocalDataScript('./js/product-portions.js?v=20260827-targeted-load');
    await loadLocalDataScript('./js/chef-food-reference.js?v=20260827-targeted-load');
    foodNutritionReference=mergeFoodNutritionRows(foodNutritionReference,window.TABLE_BOOK_FOOD_NUTRITION_FALLBACK||[]);
    foodStorageReference=mergeReferenceSubset(foodStorageReference,normalizeFoodStorageRows(window.TABLE_BOOK_FOOD_STORAGE_FALLBACK||[]),row=>normalizePortionName(row.canonical_name));
    productPortionWeights=mergeReferenceSubset(productPortionWeights,normalizeProductPortionRows(window.TABLE_BOOK_PRODUCT_PORTION_FALLBACK||[]),row=>`${normalizePortionName(row.canonical_name)}:${row.unit_code}`);
    localFoodReferenceReady=true;
    return true;
  }catch(error){console.warn('Local food reference load failed',error);return false;}
}
function clearLegacyReferenceCaches(){
  try{
    localStorage.removeItem(PRODUCT_PORTION_CACHE_KEY);
    localStorage.removeItem(FOOD_NUTRITION_CACHE_KEY);
    localStorage.removeItem(FOOD_STORAGE_CACHE_KEY);
  }catch(e){}
}
function referenceCanonicalNames(names,rows){
  const result=new Set();
  (Array.isArray(names)?names:[]).forEach(value=>{
    const name=String(value||'').trim();
    if(!name) return;
    const match=(Array.isArray(rows)?rows:[]).find(row=>referenceNameMatches(row,name,{partial:false}))
      ||(Array.isArray(rows)?rows:[]).find(row=>referenceNameMatches(row,name,{partial:true}));
    const canonical=String(match?.canonical_name||cleanShoppingProductName(name)).trim();
    if(canonical) result.add(canonical);
  });
  return [...result].slice(0,40);
}
function mergeReferenceSubset(current,incoming,keyOf){
  const map=new Map((Array.isArray(current)?current:[]).map(row=>[keyOf(row),row]));
  (Array.isArray(incoming)?incoming:[]).forEach(row=>{const key=keyOf(row);if(key) map.set(key,row);});
  return [...map.values()];
}
async function fetchReferenceSubset(kind,names){
  if(!cloud?.from) return false;
  const config={
    nutrition:{table:CLOUD_FOOD_NUTRITION_TABLE,rows:foodNutritionReference,columns:'canonical_name,aliases,kcal,protein,fat,carbs,fdc_id,data_type,dataset_release,source_name,source_url',normalize:normalizeFoodNutritionRows},
    portions:{table:CLOUD_PRODUCT_PORTION_TABLE,rows:productPortionWeights,columns:'canonical_name,aliases,unit_code,unit_label,grams,note,sort_order',normalize:normalizeProductPortionRows},
    storage:{table:CLOUD_FOOD_STORAGE_TABLE,rows:foodStorageReference,columns:'canonical_name,aliases,fridge_days_min,fridge_days_max,note,source_name,source_url',normalize:normalizeFoodStorageRows}
  }[kind];
  if(!config) return false;
  const canonical=referenceCanonicalNames(names,config.rows).filter(name=>!referenceQueryLoaded[kind].has(normalizePortionName(name)));
  if(!canonical.length) return false;
  const pendingKey=`${kind}:${canonical.map(normalizePortionName).sort().join('|')}`;
  if(referenceQueryPending.has(pendingKey)) return referenceQueryPending.get(pendingKey);
  const task=(async()=>{
    try{
      const {data,error}=await cloud.from(config.table).select(config.columns).in('canonical_name',canonical);
      if(error) throw error;
      const next=config.normalize(data);
      canonical.forEach(name=>referenceQueryLoaded[kind].add(normalizePortionName(name)));
      if(!next.length) return false;
      if(kind==='nutrition') foodNutritionReference=mergeReferenceSubset(foodNutritionReference,next,row=>normalizePortionName(row.canonical_name));
      else if(kind==='portions') productPortionWeights=mergeReferenceSubset(productPortionWeights,next,row=>`${normalizePortionName(row.canonical_name)}:${row.unit_code}`);
      else foodStorageReference=mergeReferenceSubset(foodStorageReference,next,row=>normalizePortionName(row.canonical_name));
      return true;
    }catch(error){
      console.warn(`Visible ${kind} reference load failed; using local fallback`,error);
      return false;
    }finally{referenceQueryPending.delete(pendingKey);}
  })();
  referenceQueryPending.set(pendingKey,task);
  return task;
}
async function loadReferenceDataForNames(names,{nutrition=true,portions=true,storage=false}={}){
  const tasks=[];
  if(nutrition) tasks.push(fetchReferenceSubset('nutrition',names));
  if(portions) tasks.push(fetchReferenceSubset('portions',names));
  if(storage) tasks.push(fetchReferenceSubset('storage',names));
  if(!tasks.length) return false;
  const results=await Promise.all(tasks);
  return results.some(Boolean);
}
function updateProductPortionSuggestions(){const list=$('#productPortionNames'); if(!list) return; const names=[...new Set([...productPortionWeights.map(row=>row.canonical_name),...foodNutritionReference.map(row=>row.canonical_name)])].sort((a,b)=>a.localeCompare(b,'ru')); list.innerHTML=names.map(name=>`<option value="${esc(name)}"></option>`).join('');}
const productUnits=[['g','г'],['milliliter','мл'],['piece','шт.'],['tablespoon','ст. л.'],['teaspoon','ч. л.'],['slice','ломтик'],['wedge','долька'],['clove','зубчик']];
function productUnitLabel(unit){return productUnits.find(([value])=>value===unit)?.[1]||'г';}
function productUnitOptions(selected='g'){return productUnits.map(([value,label])=>`<option value="${value}" ${value===selected?'selected':''}>${label}</option>`).join('');}
function productPortionEntry(name,unit){const key=normalizePortionName(name); if(!key||unit==='g') return null; const candidates=productPortionWeights.filter(row=>row.unit_code===unit); return candidates.find(row=>referenceNameMatches(row,name,{partial:false}))||candidates.find(row=>referenceNameMatches(row,name,{partial:true}))||null;}
function productWeightFor(name,amount,unit){if(!(amount>0)) return {weight:0,gramsPerUnit:0,entry:null}; if(unit==='g') return {weight:amount,gramsPerUnit:1,entry:null}; const entry=productPortionEntry(name,unit); return entry?{weight:amount*entry.grams,gramsPerUnit:entry.grams,entry}:{weight:0,gramsPerUnit:0,entry:null};}
function nutritionForProduct(product,mult=1){const k=(Number(product?.weight)||0)/100*mult; return {kcal:(Number(product?.kcal)||0)*k,protein:(Number(product?.protein)||0)*k,fat:(Number(product?.fat)||0)*k,carbs:(Number(product?.carbs)||0)*k};}
function addNutrition(target,value){target.kcal+=value.kcal;target.protein+=value.protein;target.fat+=value.fat;target.carbs+=value.carbs;return target;}
function productMeasureText(product,mult=1){const unit=product?.unit||'g'; const baseAmount=Number(product?.amount??product?.quantity??(unit==='g'?product?.weight:0))||0; const amount=baseAmount*mult; const storedWeight=Number(product?.weight)||0; const resolvedWeight=storedWeight||productWeightFor(product?.name||'',baseAmount,unit).weight; const weight=resolvedWeight*mult; if(unit==='g') return `${fmt(weight||amount)} г`; return `${fmt(amount)} ${productUnitLabel(unit)} ≈ ${fmt(weight)} г`;}
function productRowHtml(row={}){const unit=row.unit||'g'; const amount=row.amount??row.quantity??(unit==='g'?(row.weight??''):''); return `<div class="product-row" data-product-row data-fdc-id="${esc(row.fdcId||row.fdc_id||'')}" data-auto-nutrition="${row.nutritionAuto?'1':'0'}" data-ingredient-linked="${row.ingredientLinked?'1':'0'}"><div class="product-main"><div class="product-name-cell"><label>Продукт</label><input class="input" data-prod="name" autocomplete="off" placeholder="Введите название ингредиента" value="${esc(row.name||'')}"><small data-product-source></small></div><div class="product-quantity"><label>Количество</label><div><input class="input" data-prod="amount" type="number" min="0" step="0.1" inputmode="decimal" placeholder="100" value="${esc(amount)}"><select class="select" data-prod="unit" aria-label="Единица измерения">${productUnitOptions(unit)}</select></div><small data-product-grams></small></div></div><div class="product-macros"><span>Пищевая ценность на 100 г</span><label><b>Ккал</b><input class="input" data-prod="kcal" type="number" min="0" step="0.1" placeholder="—" value="${esc(row.kcal??'')}"></label><label><b>Белки</b><input class="input" data-prod="protein" type="number" min="0" step="0.01" placeholder="—" value="${esc(row.protein??'')}"></label><label><b>Жиры</b><input class="input" data-prod="fat" type="number" min="0" step="0.01" placeholder="—" value="${esc(row.fat??'')}"></label><label><b>Углеводы</b><input class="input" data-prod="carbs" type="number" min="0" step="0.01" placeholder="—" value="${esc(row.carbs??'')}"></label></div><button class="product-remove" type="button" data-remove-product aria-label="Удалить продукт">×</button></div>`;}
function productNutritionScore(row){return ['kcal','protein','fat','carbs'].reduce((sum,key)=>sum+Math.abs(Number(row?.[key])||0),0);}
function dedupeNutritionProductRows(rows=[]){
  const result=[],indexes=new Map();
  (Array.isArray(rows)?rows:[]).forEach((source,index)=>{
    const row=Object.assign({},source||{});
    const name=String(row.name||'').trim();
    if(!name){result.push(row);return;}
    const key=productIdentityKey(name)||`row:${index}`;
    if(!indexes.has(key)){indexes.set(key,result.length);result.push(row);return;}
    const target=result[indexes.get(key)];
    const targetWeight=Number(target.weight)||productWeightFor(target.name,Number(target.amount)||0,target.unit||'g').weight;
    const rowWeight=Number(row.weight)||productWeightFor(row.name,Number(row.amount)||0,row.unit||'g').weight;
    const identicalIngredientLine=Boolean(
      target.ingredientLinked&&row.ingredientLinked&&
      (target.unit||'g')===(row.unit||'g')&&
      Math.abs((Number(target.amount)||0)-(Number(row.amount)||0))<.001
    );
    if(identicalIngredientLine){
      // Повтор одной и той же строки ингредиента не должен удваивать массу и КБЖУ.
      // Разные количества одного продукта ниже по-прежнему складываются в одну строку.
    }else if(target.unit===row.unit && Number(target.amount)>=0 && Number(row.amount)>=0){
      target.amount=(Number(target.amount)||0)+(Number(row.amount)||0);
      const resolved=productWeightFor(target.name,target.amount,target.unit||'g');
      target.weight=resolved.weight;
      target.gramsPerUnit=resolved.gramsPerUnit;
    }else if(targetWeight>0||rowWeight>0){
      target.amount=targetWeight+rowWeight;
      target.unit='g'; target.weight=target.amount; target.gramsPerUnit=1;
    }
    const targetManual=target.nutritionAuto===false&&productNutritionScore(target)>0;
    const rowManual=row.nutritionAuto===false&&productNutritionScore(row)>0;
    if((rowManual&&!targetManual)||(!productNutritionScore(target)&&productNutritionScore(row))){
      ['kcal','protein','fat','carbs','fdcId','nutritionSource','nutritionAuto'].forEach(prop=>{target[prop]=row[prop];});
    }
    target.ingredientLinked=Boolean(target.ingredientLinked||row.ingredientLinked);
  });
  return result;
}
function updateProductNutritionSource(row,entry=null){const source=row?.querySelector('[data-product-source]'); if(!source) return; const name=row.querySelector('[data-prod="name"]')?.value||''; const match=entry||foodNutritionEntry(name); const fields=['kcal','protein','fat','carbs'].map(key=>row.querySelector(`[data-prod="${key}"]`)); const hasValues=fields.some(input=>String(input?.value||'').trim()!==''); const sameFdc=Boolean(row.dataset.fdcId&&match?.fdc_id)&&Number(row.dataset.fdcId)===Number(match.fdc_id); if(match && (row.dataset.autoNutrition==='1'||sameFdc)){source.textContent='Справочник · можно изменить по этикетке'; source.title=`${match.source_name}, ${match.dataset_release}; значения на 100 г`; source.hidden=false;} else if(name&&hasValues){source.textContent='Данные на 100 г изменены вручную';source.title='Используются введённые вами значения с этикетки';source.hidden=false;} else {source.textContent='';source.title='';source.hidden=true;}}
function applyProductNutritionReference(row,{force=false,entry=null}={}){if(!row) return false; const name=row.querySelector('[data-prod="name"]')?.value||''; const match=entry||foodNutritionEntry(name); const fields=['kcal','protein','fat','carbs'].map(key=>row.querySelector(`[data-prod="${key}"]`)); const hasManual=fields.some(input=>String(input?.value||'').trim()!=='') && row.dataset.autoNutrition!=='1'; if(!match||(!force&&hasManual)){updateProductNutritionSource(row,match); return false;} ['kcal','protein','fat','carbs'].forEach(key=>{const input=row.querySelector(`[data-prod="${key}"]`); if(input) input.value=fmt(match[key]);}); const amount=row.querySelector('[data-prod="amount"]'),unit=row.querySelector('[data-prod="unit"]'); if(amount&&!String(amount.value||'').trim()){amount.value='100';if(unit) unit.value='g';} row.dataset.autoNutrition='1'; row.dataset.fdcId=String(match.fdc_id||''); row.dataset.referenceName=normalizePortionName(name); updateProductNutritionSource(row,match); return true;}
let productReferenceObserver=null;
const productReferenceTimers=new WeakMap();
async function refreshVisibleProductReference(row){
  if(!row?.isConnected||row.dataset.referenceVisible!=='1') return false;
  const nameInput=row.querySelector('[data-prod="name"]');
  const requestedName=String(nameInput?.value||'').trim();
  if(!requestedName) return false;
  await ensureLocalFoodReferences();
  const changed=await loadReferenceDataForNames([requestedName],{nutrition:true,portions:true});
  if(!changed||!row.isConnected||row.dataset.referenceVisible!=='1'||String(nameInput?.value||'').trim()!==requestedName) return false;
  const hasManual=['kcal','protein','fat','carbs'].some(key=>String(row.querySelector(`[data-prod="${key}"]`)?.value||'').trim()!=='')&&row.dataset.autoNutrition!=='1';
  if(!hasManual) applyProductNutritionReference(row,{force:true});
  updateProductWeightHints();
  updateKbjuPreview();
  return true;
}
function queueVisibleProductReference(row,delay=480){
  if(!row||row.dataset.referenceVisible!=='1') return;
  const existing=productReferenceTimers.get(row);
  if(existing) clearTimeout(existing);
  const timer=setTimeout(()=>{productReferenceTimers.delete(row);refreshVisibleProductReference(row);},delay);
  productReferenceTimers.set(row,timer);
}
function observeProductReferenceRow(row){
  if(!row) return;
  if(!('IntersectionObserver' in window)){
    row.dataset.referenceVisible='1';
    queueVisibleProductReference(row,0);
    return;
  }
  if(!productReferenceObserver) productReferenceObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    entry.target.dataset.referenceVisible=entry.isIntersecting?'1':'0';
    if(entry.isIntersecting) queueVisibleProductReference(entry.target,40);
  }),{rootMargin:'0px'});
  productReferenceObserver.observe(row);
}
function renderProductRows(rows=[{}]){
  const box=$('#productRows'); if(!box) return;
  if(productReferenceObserver){productReferenceObserver.disconnect();productReferenceObserver=null;}
  const list=rows.length?rows:[{}];
  box.innerHTML=list.map(productRowHtml).join('');
  box.querySelectorAll('[data-product-row]').forEach(row=>{
    const name=row.querySelector('[data-prod="name"]');
    if(row.dataset.fdcId||row.dataset.autoNutrition==='1'){row.dataset.autoNutrition='1';row.dataset.referenceName=normalizePortionName(name?.value||'');}
    else if(name?.value) applyProductNutritionReference(row);
    updateProductNutritionSource(row);
    if(name){
      name.addEventListener('input',()=>{
        const current=normalizePortionName(name.value);
        if(current!==row.dataset.referenceName){
          const wasAuto=row.dataset.autoNutrition==='1';
          row.dataset.autoNutrition=''; row.dataset.fdcId='';
          const exact=foodNutritionEntryExact(name.value);
          if(exact) applyProductNutritionReference(row,{force:true,entry:exact});
          else{
            if(wasAuto) ['kcal','protein','fat','carbs'].forEach(key=>{const input=row.querySelector(`[data-prod="${key}"]`);if(input) input.value='';});
            updateProductNutritionSource(row);
          }
        }
        queueVisibleProductReference(row);
        updateProductWeightHints(); updateKbjuPreview();
      });
      name.addEventListener('change',()=>{applyProductNutritionReference(row);queueVisibleProductReference(row,0);collapseDuplicateProductRows();updateProductWeightHints();updateKbjuPreview();});
      name.addEventListener('blur',()=>{applyProductNutritionReference(row);queueVisibleProductReference(row,0);collapseDuplicateProductRows();updateProductWeightHints();updateKbjuPreview();});
    }
    observeProductReferenceRow(row);
  });
  box.querySelectorAll('input,select').forEach(control=>{
    control.addEventListener('input',()=>{
      if(['kcal','protein','fat','carbs'].includes(control.dataset.prod||'')){
        const row=control.closest('[data-product-row]'); row.dataset.autoNutrition=''; row.dataset.fdcId=''; updateProductNutritionSource(row);
      }
      updateProductWeightHints(); updateKbjuPreview();
    });
    control.addEventListener('change',()=>{updateProductWeightHints();updateKbjuPreview();});
  });
  box.querySelectorAll('[data-remove-product]').forEach(btn=>btn.onclick=()=>{
    const rows=getProductRows({includeEmpty:true,dedupe:false});
    const idx=[...box.querySelectorAll('[data-remove-product]')].indexOf(btn);
    rows.splice(idx,1); renderProductRows(rows.length?rows:[{}]); updateKbjuPreview();
  });
  updateProductWeightHints();
}
function addProductRow(row={}){const rows=getProductRows({includeEmpty:true}); rows.push(row); renderProductRows(rows); updateKbjuPreview(); setTimeout(()=>$('#productRows [data-product-row]:last-child input')?.focus(),20);}
function getProductRows({includeEmpty=false,dedupe=true}={}){const rows=$$('#productRows [data-product-row]').map(row=>{const get=n=>row.querySelector(`[data-prod="${n}"]`)?.value?.trim()||''; const name=get('name'),amount=Number(get('amount'))||0,unit=get('unit')||'g'; const resolved=productWeightFor(name,amount,unit); const ref=foodNutritionEntry(name); const nutritionAuto=row.dataset.autoNutrition==='1'; const item={name,amount,unit,weight:resolved.weight,gramsPerUnit:resolved.gramsPerUnit,kcal:Number(get('kcal'))||0,protein:Number(get('protein'))||0,fat:Number(get('fat'))||0,carbs:Number(get('carbs'))||0,fdcId:Number(row.dataset.fdcId)||null,nutritionSource:nutritionAuto?ref?.source_name||'USDA FoodData Central':'',nutritionAuto,ingredientLinked:row.dataset.ingredientLinked==='1'}; return item;}).filter(item=>includeEmpty || item.name || item.amount || item.kcal || item.protein || item.fat || item.carbs); return dedupe?dedupeNutritionProductRows(rows):rows;}
function collapseDuplicateProductRows(){
  const raw=getProductRows({includeEmpty:true,dedupe:false});
  const compact=dedupeNutritionProductRows(raw);
  const rawNamed=raw.filter(row=>row.name).length,compactNamed=compact.filter(row=>row.name).length;
  if(compactNamed>=rawNamed) return false;
  renderProductRows(compact.length?compact:[{}]);
  return true;
}
function defaultProductMeasure(name){
  const portion=productPortionWeights.find(row=>referenceNameMatches(row,name,{partial:false}));
  return portion?{amount:1,unit:portion.unit_code}:{amount:100,unit:'g'};
}
function calculatorRowFromIngredient(line,existing=null){
  const parsed=parseIngredientAmount(line);
  const name=String(parsed.name||line||'').trim();
  const hasMeasure=parsed.amount>0&&parsed.unit!=='text';
  const measure=hasMeasure?{amount:parsed.amount,unit:parsed.unit}:{amount:0,unit:'g'};
  const reference=foodNutritionEntry(name);
  const row=Object.assign({},existing||{},{
    name,
    amount:hasMeasure?measure.amount:0,
    unit:hasMeasure?measure.unit:'g',
    ingredientLinked:true
  });
  const hasNutrition=['kcal','protein','fat','carbs'].some(key=>Number(existing?.[key])>0);
  const preserveManual=existing?.nutritionAuto===false&&hasNutrition;
  if(reference&&!preserveManual){
    row.kcal=reference.kcal; row.protein=reference.protein; row.fat=reference.fat; row.carbs=reference.carbs;
    row.fdcId=reference.fdc_id||null; row.nutritionSource=reference.source_name||'USDA FoodData Central'; row.nutritionAuto=true;
  }
  return row;
}
let ingredientProductSyncTimer=null;
function synchronizeProductsFromIngredients({force=false}={}){
  const field=$('#myIngredients'),box=$('#productRows'); if(!field||!box) return;
  const lines=field.value.split('\n').map(line=>line.trim()).filter(Boolean);
  const existing=getProductRows({includeEmpty:true});
  if(!lines.length){const manual=existing.filter(row=>!row.ingredientLinked&&(row.name||row.amount||row.kcal||row.protein||row.fat||row.carbs));renderProductRows(manual.length?manual:[{}]);updateKbjuPreview();return;}
  const buckets=new Map();
  existing.forEach((row,index)=>{const key=productIdentityKey(row.name); if(!key)return; const list=buckets.get(key)||[]; list.push({row,index}); buckets.set(key,list);});
  const used=new Set();
  const next=lines.map(line=>{
    const parsed=parseIngredientAmount(line);
    const key=productIdentityKey(parsed.name||line);
    const candidate=(buckets.get(key)||[]).find(item=>!used.has(item.index));
    if(candidate) used.add(candidate.index);
    return calculatorRowFromIngredient(line,candidate?.row||null);
  });
  existing.forEach((row,index)=>{if(!used.has(index)&&!row.ingredientLinked&&(row.name||row.amount||row.kcal||row.protein||row.fat||row.carbs)) next.push(row);});
  const compact=dedupeNutritionProductRows(next);
  renderProductRows(compact.length?compact:[{}]);
  updateKbjuPreview();
}
function queueIngredientProductSync(){
  if(ingredientProductSyncTimer) clearTimeout(ingredientProductSyncTimer);
  ingredientProductSyncTimer=setTimeout(()=>{ingredientProductSyncTimer=null;synchronizeProductsFromIngredients();},280);
}
function productIngredientLine(product){
  const amount=Number(product?.amount)||0;
  return `${String(product?.name||'').trim()} — ${fmt(amount)} ${productUnitLabel(product?.unit||'g')}`;
}
function updateProductWeightHints(){const rows=$$('#productRows [data-product-row]'); rows.forEach(row=>{const value=n=>row.querySelector(`[data-prod="${n}"]`)?.value||''; const name=value('name'),amount=Number(value('amount'))||0,unit=value('unit')||'g',hint=row.querySelector('[data-product-grams]'); if(!hint) return; const resolved=productWeightFor(name,amount,unit); const hasNutrition=['kcal','protein','fat','carbs'].some(key=>String(value(key)).trim()!==''); if(!amount){hint.textContent=name?'Количество не задано — строка не участвует в расчёте':'';hint.title='';hint.classList.toggle('missing',Boolean(name));return;} if(!(resolved.weight>0)){hint.textContent='Нет такой меры для этого продукта — выберите граммы';hint.title='';hint.classList.add('missing');return;} const product={weight:resolved.weight,kcal:Number(value('kcal'))||0,protein:Number(value('protein'))||0,fat:Number(value('fat'))||0,carbs:Number(value('carbs'))||0}; const contribution=nutritionForProduct(product); const weightText=unit==='g'?`${fmt(resolved.weight)} г`:`≈ ${fmt(resolved.weight)} г`; const nutritionText=hasNutrition?` · ${fmt(contribution.kcal)} ккал · Б ${fmt(contribution.protein)} · Ж ${fmt(contribution.fat)} · У ${fmt(contribution.carbs)}`:''; const note=resolved.entry?.note||''; hint.textContent=`${weightText}${nutritionText}${!hasNutrition&&note?` · ${note}`:''}`; hint.title=note; hint.classList.remove('missing');});}
const COOKING_YIELD_RULES=[
  {id:'rice',label:'рис',factor:3,pattern:/(?:^|\s)рис(?:\s|$)|рисов(?:ая|ые)\s+крупа/i,exclude:/лапш/i},
  {id:'pasta',label:'макароны',factor:2.37,pattern:/макарон|спагет|лапш|паст(?:а|ы)(?:\s|$)/i},
  {id:'porridge',label:'каша',factor:2.5,pattern:/овсян|геркулес|манн(?:ая|ой)\s+круп/i},
  {id:'grain',label:'крупа',factor:2.5,pattern:/греч|киноа|кускус|булгур|перлов/i},
  {id:'legume',label:'бобовые',factor:2.4,pattern:/чечев|(?:^|\s)нут(?:\s|$)|фасол|горох\s+сух/i},
  {id:'raw-meat',label:'мясо',factor:.75,pattern:/фарш|говядин|свинин|баранин|телятин|индейк|куриц|курин|окорок|мясо/i,exclude:/яйц|готов|варен|варён|копчен|копчён|консерв|ветчин|колбас/},
  {id:'raw-fish',label:'рыба',factor:.8,pattern:/минтай|форел|лосос|семг|сёмг|треск|дорад|скумбр|рыбн(?:ое|ый)\s+(?:филе|фарш)|филе\s+рыб/i,exclude:/готов|копчен|копчён|консерв|унаги/}
];
function cookingYieldRule(name){const key=normalizePortionName(foodNutritionEntry(name)?.canonical_name||name);return COOKING_YIELD_RULES.find(rule=>rule.pattern.test(key)&&!(rule.exclude&&rule.exclude.test(key)))||null;}
function cookingLiquidWeight(product){const key=normalizePortionName(foodNutritionEntry(product?.name)?.canonical_name||product?.name);return /^(вода|питьевая вода|молоко|молоко цельное|кокосовое молоко|бульон)/.test(key)?Number(product?.weight)||0:0;}
function estimateCookedWeight(products=[]){
  let cooked=0,potentialGain=0,liquids=0,input=0;
  const rules=new Set();
  (Array.isArray(products)?products:[]).forEach(product=>{
    const weight=Number(product?.weight)||0;
    if(!(weight>0)) return;
    input+=weight;
    const liquid=cookingLiquidWeight(product);
    if(liquid>0){liquids+=liquid;return;}
    const rule=cookingYieldRule(product.name);
    const factor=rule?.factor||1;
    if(factor>1){cooked+=weight;potentialGain+=weight*(factor-1);}
    else cooked+=weight*factor;
    if(rule) rules.add(rule.label);
  });
  cooked+=liquids>0?liquids:potentialGain;
  if(!(cooked>0)) return null;
  return {weight:Math.max(1,Math.round(cooked)),inputWeight:Math.round(input),rules:[...rules]};
}
function updateEstimatedFinishedWeight(){
  const input=$('#myWeight'),host=input?.closest('.finished-weight-field')?.querySelector('span');
  if(!input||!host) return null;
  let note=$('#estimatedFinishedWeight');
  if(!note){note=document.createElement('small');note.id='estimatedFinishedWeight';note.className='finished-weight-estimate';host.appendChild(note);}
  const estimate=estimateCookedWeight(getProductRows());
  if(!estimate){note.textContent='Оценка появится после ввода количества продуктов.';return null;}
  const current=Number(input.value)||0;
  if(!current||input.dataset.autoEstimate==='1'){
    input.value=String(estimate.weight);
    input.dataset.autoEstimate='1';
  }
  const factors=estimate.rules.length?` Учтены: ${estimate.rules.join(', ')}.`:'';
  note.textContent=input.dataset.autoEstimate==='1'?`Расчётный вес ≈ ${estimate.weight} г.${factors}`:`Расчётный ориентир ≈ ${estimate.weight} г; используется введённый вес ${fmt(Number(input.value)||0)} г.${factors}`;
  return estimate;
}
function recipeIngredientLines(recipe){
  const source=Array.isArray(recipe?.ingredients)&&recipe.ingredients.length?recipe.ingredients:(Array.isArray(recipe?.extraIngredients)?recipe.extraIngredients:[]);
  const seen=new Set();
  return source.map(line=>String(line||'').trim()).filter(line=>{const key=normalizePortionName(line);if(!key||seen.has(key)) return false;seen.add(key);return true;});
}
function preferredExistingNutritionRow(rows=[]){
  return [...rows].sort((a,b)=>{
    const manualA=a?.nutritionAuto===false&&productNutritionScore(a)>0?1:0;
    const manualB=b?.nutritionAuto===false&&productNutritionScore(b)>0?1:0;
    return manualB-manualA||productNutritionScore(b)-productNutritionScore(a);
  })[0]||null;
}
function reconcileCustomRecipeNutrition(recipe){
  if(!recipe||typeof recipe!=='object') return recipe;
  const lines=recipeIngredientLines(recipe);
  const existing=Array.isArray(recipe.ingredientNutrition)?recipe.ingredientNutrition:[];
  const existingByKey=new Map();
  existing.forEach(row=>{const key=productIdentityKey(row?.name);if(!key)return;const bucket=existingByKey.get(key)||[];bucket.push(row);existingByKey.set(key,bucket);});
  const groups=new Map();
  lines.forEach(line=>{
    const parsed=parseIngredientAmount(line);
    const key=productIdentityKey(parsed.name||line);
    if(!key) return;
    const bucket=groups.get(key)||[];
    bucket.push({line,parsed});
    groups.set(key,bucket);
  });
  let rows=[];
  groups.forEach((items,key)=>{
    const explicit=items.filter(item=>item.parsed.amount>0&&item.parsed.unit!=='text');
    const source=explicit.length?explicit:[items[0]];
    const uniqueMeasures=new Map();
    source.forEach(item=>{
      const measure=item.parsed.amount>0?`${item.parsed.unit}:${item.parsed.amount}`:'unspecified';
      if(!uniqueMeasures.has(measure)) uniqueMeasures.set(measure,item);
    });
    const preferred=preferredExistingNutritionRow(existingByKey.get(key)||[]);
    let index=0;
    uniqueMeasures.forEach(item=>{rows.push(calculatorRowFromIngredient(item.line,index===0?preferred:null));index+=1;});
  });
  if(!lines.length) rows=existing.map(row=>Object.assign({},row,{amount:Number(row?.amount)>0?Number(row.amount):Number(row?.weight)||0,unit:row?.unit||'g'}));
  rows=dedupeNutritionProductRows(rows).filter(row=>row?.name&&Number(row.amount)>0);
  rows.forEach(row=>{
    const resolved=productWeightFor(row.name,Number(row.amount)||0,row.unit||'g');
    row.weight=resolved.weight;
    row.gramsPerUnit=resolved.gramsPerUnit;
  });
  const used=rows.filter(row=>row.weight>0);
  const ingredientWeight=used.reduce((sum,row)=>sum+row.weight,0);
  const total=used.reduce((sum,row)=>addNutrition(sum,nutritionForProduct(row)),{kcal:0,protein:0,fat:0,carbs:0});
  const hasNutrition=used.length>0&&Object.values(total).some(value=>value>0);
  const estimate=estimateCookedWeight(used);
  const storedWeight=Number(recipe.weight)||0;
  const useEstimate=Boolean(estimate&&(recipe.weightEstimated||!(storedWeight>0)));
  const weight=useEstimate?estimate.weight:storedWeight;
  const servings=Math.max(1,Number(recipe.servings)||1);
  const nutrition100=hasNutrition&&weight>0?{kcal:total.kcal/weight*100,protein:total.protein/weight*100,fat:total.fat/weight*100,carbs:total.carbs/weight*100}:recipe.nutrition100||null;
  const nutrition=hasNutrition?{kcal:total.kcal/servings,protein:total.protein/servings,fat:total.fat/servings,carbs:total.carbs/servings}:recipe.nutrition||null;
  return Object.assign({},recipe,{
    ingredientNutrition:rows,
    ingredientWeight,
    estimatedWeight:estimate?.weight||0,
    weight:weight||0,
    weightEstimated:useEstimate,
    nutritionTotal:hasNutrition?total:recipe.nutritionTotal||null,
    nutrition100,
    nutrition
  });
}
function calcFromProducts(){const products=getProductRows(); const used=products.filter(p=>p.name && p.weight>0).map(product=>({...product,total:nutritionForProduct(product)})); if(!used.length) return null; const inputWeight=used.reduce((sum,product)=>sum+product.weight,0); if(inputWeight<=0) return null; const total=used.reduce((sum,product)=>addNutrition(sum,product.total),{kcal:0,protein:0,fat:0,carbs:0}); return {inputWeight,total,products:used};}
function scrollToMyRecipeListStart(){
  requestAnimationFrame(()=>{
    const target=$('#myRecipesList') || $('#myEmpty');
    if(!target) return;
    const topbar=$('.topbar');
    const offset=(topbar?.offsetHeight||0)+14;
    const y=Math.max(0,target.getBoundingClientRect().top+window.pageYOffset-offset);
    window.scrollTo({top:y,behavior:'smooth'});
  });
}

function renderMyCategoryTiles(){
  const wrap=$('#myCategoryChoice'); if(!wrap) return;
  const counts=myCategoryCounts();
  wrap.innerHTML=categoryOrder.map(cat=>{
    const active=state.myCat===cat?' active':'';
    return `<button class="cat-tile my-cat-tile${active}" data-my-cat="${esc(cat)}" type="button"><div><strong>${cat}</strong><span>${counts[cat]||0} ${plural(counts[cat]||0,['блюдо','блюда','блюд'])}</span></div></button>`;
  }).join('');
  $$('[data-my-cat]').forEach(btn=>btn.onclick=()=>{
    state.myCat=btn.dataset.myCat;
    saveState();
    renderMyRecipes();
    scrollToMyRecipeListStart();
    vibe(10);
  });
}
function myRecipeCard(r){
  const n=r.nutrition100;
  const productCount=(r.ingredientNutrition||[]).length;
  const kbju=n?`<div class="mini-kbju compact-kbju"><span><b>${fmt(n.kcal)}</b><em>ккал / 100 г</em></span><span><b>${fmt(n.protein)} г</b><em>Б</em></span><span><b>${fmt(n.fat)} г</b><em>Ж</em></span><span><b>${fmt(n.carbs)} г</b><em>У</em></span></div>`:'';
  const weightLabel=r.weight?`${r.weightEstimated?'≈ ':''}${fmt(r.weight)} г готового`:'';
  const estimateLabel=!r.weightEstimated&&r.estimatedWeight&&Math.abs(r.estimatedWeight-(Number(r.weight)||0))>Math.max(10,(Number(r.weight)||0)*.05)?`<span>ориентир ≈ ${fmt(r.estimatedWeight)} г</span>`:'';
  return `<article class="my-item my-item-compact"><div class="my-item-top"><div class="my-item-main"><h4>${esc(r.title)}</h4><div class="mini-meta"><span>${esc(r.time||'—')}</span><span>${r.servings||1} порц.</span>${weightLabel?`<span>${weightLabel}</span>`:''}${estimateLabel}${productCount?`<span>${productCount} прод.</span>`:''}</div>${kbju}</div><div class="row-actions compact-actions"><button class="btn" data-open-custom="${r.id}">Открыть</button><button class="btn ghost" data-edit-custom="${r.id}">Изменить</button><button class="btn ghost danger-btn" data-del-custom="${r.id}">Удалить</button></div></div></article>`;
}
function renderMyRecipes(){
  const box=$('#myRecipesList'), empty=$('#myEmpty');
  renderMyCategoryTiles();
  if(!box||!empty){updateHomeMeta(); return;}
  box.innerHTML='';
  const selected=state.myCat||'';
  if(!selected){
    empty.textContent=myRecipes.length?'Выберите папку с типом блюда, чтобы открыть сохранённые рецепты.':'Папки пока пустые. Нажмите «+ Создание», выберите тип блюда и сохраните первый рецепт.';
    empty.hidden=false;
    updateHomeMeta();
    return;
  }
  const list=myRecipes.filter(r=>(r.category||'Горячие блюда')===selected);
  if(!list.length){
    empty.textContent=`Папка «${selected}» пока пустая. Нажмите «+ Создание», чтобы добавить сюда блюдо.`;
    empty.hidden=false;
    updateHomeMeta();
    return;
  }
  empty.hidden=true;
  const groups=recipesByIngredientGroup(list).map(({group,recipes:groupRecipes})=>`<section class="ingredient-group-block my-ingredient-group"><div class="ingredient-group-head"><h3>${esc(group)}</h3><span>${groupRecipes.length} ${plural(groupRecipes.length,['блюдо','блюда','блюд'])}</span></div><div class="my-list-grid my-ingredient-grid">${groupRecipes.map(myRecipeCard).join('')}</div></section>`).join('');
  box.innerHTML=`<div class="my-folder-title"><h3>${esc(selected)}</h3><span>${list.length} ${plural(list.length,['рецепт','рецепта','рецептов'])}</span></div>${groups}`;
  $$('[data-open-custom]').forEach(b=>b.onclick=()=>openRecipe(b.dataset.openCustom,'custom'));
  $$('[data-edit-custom]').forEach(b=>b.onclick=()=>editMyRecipe(b.dataset.editCustom));
  $$('[data-del-custom]').forEach(b=>b.onclick=()=>deleteMyRecipe(b.dataset.delCustom));
  updateHomeMeta();
}
function editMyRecipe(id){const r=myRecipes.find(x=>x.id===id); if(!r) return; const lib=$('#myLibrary'), editor=$('#myRecipeEditor'); if(lib) lib.hidden=true; if(editor) editor.hidden=false; state.editingId=id; state.myCat=r.category||state.myCat||'Горячие блюда'; saveState(); $('#formTitle').textContent='Редактировать'; $('#myTitle').value=r.title||''; $('#myCategory').value=r.category||'Горячие блюда'; $('#myTime').value=r.time||''; $('#myServings').value=r.servings||''; $('#myCountry').value=r.country||''; $('#myDifficulty').value=r.difficulty||'легко'; const weightInput=$('#myWeight'); weightInput.value=r.weight||''; weightInput.dataset.autoEstimate=r.weightEstimated?'1':'0'; $('#myKcal100').value=r.nutrition100?.kcal??''; $('#myProtein100').value=r.nutrition100?.protein??''; $('#myFat100').value=r.nutrition100?.fat??''; $('#myCarbs100').value=r.nutrition100?.carbs??''; renderProductRows((r.ingredientNutrition&&r.ingredientNutrition.length)?r.ingredientNutrition:[{}]); $('#myIngredients').value=(r.ingredients||r.extraIngredients||[]).join('\n'); synchronizeProductsFromIngredients({force:true}); $('#mySteps').value=(r.steps||[]).join('\n'); $('#myTips').value=r.tips||''; updateKbjuPreview(); window.scrollTo({top:0,behavior:'smooth'}); vibe(10);}
function deleteMyRecipe(id){myRecipes=myRecipes.filter(x=>x.id!==id); state.likedRecipes=normalizeLikedRecipes(state.likedRecipes).filter(item=>recipeKey(item.id,item.source)!==recipeKey(id,'custom')); saveMyRecipes(); persistLikedRecipes({sync:false}); if(cloudUser) saveCloudData({silent:true}).catch(e=>console.warn('Immediate delete sync failed',e)); renderMyRecipes(); if(state.editingId===id) resetMyForm(); vibe(10);}
function getCustomNutrition(){const servings=Math.max(1,Number($('#myServings').value)||1); const weight=Number($('#myWeight').value)||0; const productCalc=calcFromProducts(); if(productCalc){if(weight<=0) return {...productCalc,weight:0,nutrition100:null,nutrition:null,source:'products',requiresWeight:true}; const n100={kcal:productCalc.total.kcal/weight*100,protein:productCalc.total.protein/weight*100,fat:productCalc.total.fat/weight*100,carbs:productCalc.total.carbs/weight*100}; return {...productCalc,weight,nutrition100:n100,nutrition:{kcal:productCalc.total.kcal/servings,protein:productCalc.total.protein/servings,fat:productCalc.total.fat/servings,carbs:productCalc.total.carbs/servings},source:'products',requiresWeight:false};} const n100={kcal:Number($('#myKcal100').value)||0,protein:Number($('#myProtein100').value)||0,fat:Number($('#myFat100').value)||0,carbs:Number($('#myCarbs100').value)||0}; const hasManual=Object.values(n100).some(v=>v>0); if(!hasManual) return {weight:0,inputWeight:0,nutrition100:null,nutrition:null,total:null,products:[],source:null,requiresWeight:false}; if(weight<=0) return {weight:0,inputWeight:0,nutrition100:n100,nutrition:null,total:null,products:[],source:'manual',requiresWeight:true}; const total={kcal:n100.kcal*weight/100,protein:n100.protein*weight/100,fat:n100.fat*weight/100,carbs:n100.carbs*weight/100}; return {weight,inputWeight:0,nutrition100:n100,total,nutrition:{kcal:total.kcal/servings,protein:total.protein/servings,fat:total.fat/servings,carbs:total.carbs/servings},products:[],source:'manual',requiresWeight:false};}
function nutritionLine(label,n){return `<div class="kbju-summary-section"><strong>${label}</strong><span><b>${fmt(n.kcal)} ккал</b> • Б ${fmt(n.protein)} г • Ж ${fmt(n.fat)} г • У ${fmt(n.carbs)} г</span></div>`;}
function compactNutritionText(value){return `${fmt(value.kcal)} ккал · Б ${fmt(value.protein)} · Ж ${fmt(value.fat)} · У ${fmt(value.carbs)}`;}
function productNutritionListHtml(products,{mult=1,servings=1}={}){const rows=Array.isArray(products)?products:[]; if(!rows.length) return ''; const portions=Math.max(1,Number(servings)||1); return `<div class="product-breakdown-list">${rows.map(product=>{const whole=nutritionForProduct(product,mult); const perServing={kcal:whole.kcal/portions,protein:whole.protein/portions,fat:whole.fat/portions,carbs:whole.carbs/portions}; return `<div class="product-breakdown-row"><div class="product-breakdown-name"><b>${esc(product.name||'Продукт')}</b><span>${esc(productMeasureText(product,mult))}</span></div><div class="product-breakdown-values"><span>В блюде: ${compactNutritionText(whole)}</span><small>На порцию: ${compactNutritionText(perServing)}</small></div></div>`;}).join('')}</div>`;}
function productNutritionDetailsHtml(products,options={}){const list=productNutritionListHtml(products,options); return list?`<details class="product-breakdown" open><summary>Расчёт КБЖУ по продуктам</summary>${list}<p>Значения с упаковки пересчитаны по фактической массе каждой строки. Бытовые меры переведены в граммы по справочнику.</p></details>`:'';}
function updateKbjuPreview(){const el=$('#myKbjuPreview'); if(!el) return; updateEstimatedFinishedWeight(); const data=getCustomNutrition(); const servings=Math.max(1,Number($('#myServings').value)||1); const breakdown=data.source==='products'?productNutritionDetailsHtml(data.products,{servings}):''; if(data.requiresWeight){const total=data.total?nutritionLine('Во всём блюде',data.total):''; const input=data.inputWeight?` Масса продуктов до приготовления: ${fmt(data.inputWeight)} г.`:''; el.innerHTML=`<div class="kbju-source">Расчёт почти готов</div>${total}<span class="kbju-muted">Укажите вес готового блюда, чтобы получить КБЖУ на 100 г и на порцию.${input}</span>${breakdown}`; return;} if(!data.nutrition){el.innerHTML='<span class="kbju-muted">КБЖУ рассчитается после ввода продуктов или итоговых значений на 100 г.</span>'; return;} const estimated=$('#myWeight')?.dataset.autoEstimate==='1'?' · вес рассчитан ориентировочно':''; const src=data.source==='products'?`По продуктам${data.inputWeight?` · до приготовления ${fmt(data.inputWeight)} г`:''}`:'По готовым значениям на 100 г'; el.innerHTML=`<div class="kbju-source">${src} · готовое блюдо ${fmt(data.weight)} г${estimated}</div><div class="kbju-summary-grid">${nutritionLine('В готовом блюде',data.total)}${nutritionLine('На 100 г',data.nutrition100)}${nutritionLine('На порцию',data.nutrition)}</div>${breakdown}`;}
function saveCustomRecipe(){
  const title=$('#myTitle')?.value.trim()||'';
  const category=$('#myCategory')?.value || state.myCat || 'Горячие блюда';
  const extraIngredients=($('#myIngredients')?.value||'').split('\n').map(x=>x.trim()).filter(Boolean);
  const steps=($('#mySteps')?.value||'').split('\n').map(x=>x.trim()).filter(Boolean);
  synchronizeProductsFromIngredients();
  const calculatorRows=getProductRows();
  const calc=getCustomNutrition();
  const ingredients=[...extraIngredients];
  const ingredientKeys=new Set(ingredients.map(line=>normalizePortionName(parseIngredientAmount(line).name||line)).filter(Boolean));
  calculatorRows.forEach(product=>{const key=normalizePortionName(product.name); if(key&&!ingredientKeys.has(key)){ingredients.push(productIngredientLine(product));ingredientKeys.add(key);}});
  if(!title){alert('Введите название рецепта.'); return;}
  const incompleteProduct=calculatorRows.find(product=>!product.name || (!(product.amount>0)&&!/^((питьевая\s+)?вода|соль|специи?|перец|зелень)/i.test(normalizePortionName(product.name))));
  if(incompleteProduct){alert(`Укажите количество продукта «${incompleteProduct.name||'без названия'}» или удалите строку. Ингредиенты без количества не участвуют в расчёте.`); return;}
  const unresolvedProduct=calculatorRows.find(product=>product.amount>0 && !(product.weight>0));
  if(unresolvedProduct){alert(`Для продукта «${unresolvedProduct.name}» нет перевода выбранной меры в граммы. Выберите граммы или другое доступное измерение.`); return;}
  if(!ingredients.length){alert('Добавьте ингредиенты рецепта — каждый продукт с новой строки.'); return;}
  if(!steps.length){alert('Добавьте шаги приготовления. Каждый шаг — с новой строки.'); return;}
  if(calc.requiresWeight){alert('Укажите вес готового блюда, чтобы рассчитать КБЖУ на 100 г и на порцию.'); $('#myWeight')?.focus(); return;}
  if(!Array.isArray(myRecipes)) myRecipes=[];
  const fallback=nutritionOf({category,title});
  const nowIso=new Date().toISOString();
  const editingId=state.editingId||null;
  const oldRecipe=editingId?myRecipes.find(x=>x.id===editingId):null;
  const rec={
    id:editingId||('my-'+Date.now()),
    createdAt:oldRecipe?.createdAt||nowIso,
    updatedAt:nowIso,
    title,
    category,
    time:($('#myTime')?.value||'').trim()||'—',
    servings:Number($('#myServings')?.value)||1,
    difficulty:$('#myDifficulty')?.value||'легко',
    country:($('#myCountry')?.value||'').trim()||'Мои рецепты',
    ingredients,
    extraIngredients:ingredients,
    steps,
    tips:($('#myTips')?.value||'').trim(),
    healthy:false,
    source:'custom',
    weight:calc.weight||0,
    weightEstimated:$('#myWeight')?.dataset.autoEstimate==='1',
    nutrition100:calc.nutrition100,
    nutritionTotal:calc.total,
    ingredientNutrition:calc.products||[],
    ingredientWeight:calc.inputWeight||0,
    estimatedWeight:updateEstimatedFinishedWeight()?.weight||0,
    nutrition:calc.nutrition||fallback
  };
  const idx=myRecipes.findIndex(x=>x.id===rec.id);
  if(idx>-1) myRecipes[idx]=rec; else myRecipes.unshift(rec);
  state.myCat=category;
  state.editingId=null;
  saveState();
  saveMyRecipes();
  if(cloudUser) saveCloudData({silent:true}).catch(e=>console.warn('Immediate recipe sync failed',e));
  resetMyForm(false);
  showMyLibrary();
  renderMyRecipes();
  vibe(14);
}
function qtyNumber(v){
  if(String(v).includes('/')){const [a,b]=String(v).split('/').map(x=>Number(x.trim()));return b? a/b : Number(v)}
  return Number(String(v).replace(',','.'));
}
function fmtQty(v){
  let n=Number(v);
  if(!Number.isFinite(n)) return v;
  if(n>=100) n=Math.round(n);
  else if(n>=10) n=Math.round(n*10)/10;
  else n=Math.round(n*10)/10;
  return (Number.isInteger(n)?String(n):String(n).replace(/\.0$/,'')).replace('.',',');
}
function scaledIngredientText(line,mult){
  if(!mult || Math.abs(mult-1)<.0001) return line;
  const re=/(\d+\s*\/\s*\d+|\d+(?:[,.]\d+)?)(\s*[–-]\s*(\d+(?:[,.]\d+)?))?/g;
  return String(line).replace(re,(match,a,range,b)=>{
    const first=qtyNumber(a);
    if(!Number.isFinite(first)) return match;
    if(range && b){
      const second=qtyNumber(b);
      if(!Number.isFinite(second)) return match;
      return `${fmtQty(first*mult)}–${fmtQty(second*mult)}`;
    }
    return fmtQty(first*mult);
  });
}
function extractStepTimerSeconds(text){
  const raw=String(text||'').toLowerCase();
  const s=raw
    .replace(/(^|[^а-яёa-z0-9])ч\s*\.?\s*л\s*\.?/gi,'$1чайная ложка')
    .replace(/(^|[^а-яёa-z0-9])ст\s*\.?\s*л\s*\.?/gi,'$1столовая ложка');
  const re=/([0-9]+(?:[,.][0-9]+)?)(?:\s*[–-]\s*([0-9]+(?:[,.][0-9]+)?))?\s*(сек(?:унд(?:ы|у|)?|\.)?|мин(?:ут(?:ы|у|)?|\.)?|час(?:а|ов)?|ч\.?)(?![а-яё])/gi;
  let best=0, m;
  while((m=re.exec(s))){
    const unit=m[3];
    const after=s.slice(re.lastIndex);
    if(unit.startsWith('ч') && /^\s*л\.?\b/.test(after)) continue;
    const a=Number(m[1].replace(',','.'));
    const b=m[2]?Number(m[2].replace(',','.')):a;
    const value=Math.max(a,b);
    let sec=value;
    if(unit.startsWith('мин')) sec=value*60;
    else if(unit.startsWith('час')||unit.startsWith('ч')) sec=value*3600;
    best=Math.max(best,Math.round(sec));
  }
  return best>=5?best:0;
}
function timerLabel(seconds){
  seconds=Math.max(0,Math.round(seconds));
  const h=Math.floor(seconds/3600), m=Math.floor((seconds%3600)/60), s=seconds%60;
  if(h) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
let activeRecipeTimerIds=[];
function clearRecipeStepTimers(){activeRecipeTimerIds.forEach(id=>clearInterval(id));activeRecipeTimerIds=[];}
function registerRecipeTimer(id){activeRecipeTimerIds.push(id);return id;}
function unregisterRecipeTimer(id){activeRecipeTimerIds=activeRecipeTimerIds.filter(x=>x!==id);}
function timerSignal(){
  try{if(navigator.vibrate) navigator.vibrate([55,70,55]);}catch(e){}
  try{
    const Ctx=window.AudioContext||window.webkitAudioContext;
    if(!Ctx) return;
    const ctx=window._recipeAudioCtx||(window._recipeAudioCtx=new Ctx());
    if(ctx.state==='suspended') ctx.resume();
    const beep=(delay=0,freq=840)=>{
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.type='sine'; o.frequency.value=freq;
      o.connect(g); g.connect(ctx.destination);
      const t=ctx.currentTime+delay;
      g.gain.setValueAtTime(0.001,t);
      g.gain.exponentialRampToValueAtTime(0.13,t+.025);
      g.gain.exponentialRampToValueAtTime(0.001,t+.34);
      o.start(t); o.stop(t+.36);
    };
    beep(0,820); beep(.42,1040);
  }catch(e){}
}
function timerHtml(seconds){return `<button class="step-timer timer-chip" type="button" data-timer="${seconds}" title="Открыть таймер"><span class="timer-clock" aria-hidden="true">◷</span><strong data-time>${timerLabel(seconds)}</strong></button>`;}
let recipeTimers=[];
let floatingTimerCurrent=null;
function registerRecipeTimer(id){activeRecipeTimerIds.push(id);return id;}
function unregisterRecipeTimer(id){activeRecipeTimerIds=activeRecipeTimerIds.filter(x=>x!==id);}
function clearRecipeStepTimers(){
  recipeTimers.forEach(t=>{try{t.clear()}catch(e){}});
  recipeTimers=[];
  activeRecipeTimerIds.forEach(id=>clearInterval(id));
  activeRecipeTimerIds=[];
  floatingTimerCurrent=null;
  const box=$('#floatingTimer');
  if(box) box.hidden=true;
}
function ensureFloatingTimer(){
  let box=$('#floatingTimer');
  if(box) return box;
  box=document.createElement('div');
  box.id='floatingTimer';
  box.className='floating-timer';
  box.hidden=true;
  box.innerHTML=`<div class="float-timer-top"><div><span class="float-kicker">Таймер шага</span><strong data-float-title>Шаг</strong></div><button class="float-close" type="button" data-float-close aria-label="Закрыть таймер" title="Закрыть">×</button></div><div class="float-timer-body"><div class="float-time" data-float-time>00:00</div><div class="float-note" data-float-note>Таймер запущен автоматически</div><div class="float-actions"><button type="button" data-float-pause>Пауза</button><button type="button" data-float-reset>Сброс</button><button type="button" data-float-close>Закрыть</button></div></div>`;
  document.body.appendChild(box);
  box.querySelectorAll('[data-float-close]').forEach(btn=>btn.onclick=()=>{box.hidden=true;box.classList.remove('minimized');});
  box.querySelector('[data-float-pause]').onclick=()=>{if(!floatingTimerCurrent)return; floatingTimerCurrent.running?floatingTimerCurrent.pause():floatingTimerCurrent.start(false);};
  box.querySelector('[data-float-reset]').onclick=()=>{if(floatingTimerCurrent) floatingTimerCurrent.reset();};
  return box;
}
function updateFloatingTimer(timer){
  if(floatingTimerCurrent!==timer) return;
  const box=ensureFloatingTimer();
  const label=timer.left<=0?'Готово':timerLabel(timer.left);
  box.querySelector('[data-float-title]').textContent=`Шаг ${timer.stepNumber}`;
  box.querySelector('[data-float-time]').textContent=label;
  const miniTime=box.querySelector('[data-float-mini-time]'); if(miniTime) miniTime.textContent=label;
  box.querySelector('[data-float-note]').textContent=timer.finished?'Готово':(timer.running?'Идёт отсчёт':'Таймер на паузе');
  const pauseBtn=box.querySelector('[data-float-pause]');
  if(pauseBtn) pauseBtn.textContent=timer.running?'Пауза':'Продолжить';
  box.classList.toggle('running',timer.running);
  box.classList.toggle('finished',timer.finished);
}
function showFloatingTimer(timer,minimized=false){
  const box=ensureFloatingTimer();
  floatingTimerCurrent=timer;
  box.hidden=false;
  box.classList.remove('minimized');
  updateFloatingTimer(timer);
}
function initStepTimers(){
  recipeTimers=[];
  $$('.step-timer[data-timer]').forEach((block,i)=>{
    const total=Number(block.dataset.timer)||0;
    const step=block.closest('.step');
    const timeEl=block.querySelector('[data-time]');
    const timer={
      total,left:total,interval:null,running:false,started:false,finished:false,block,step,stepNumber:i+1,
      update(){
        const label=this.left<=0?'Готово':timerLabel(this.left);
        if(timeEl) timeEl.textContent=label;
        this.block.classList.toggle('running',this.running);
        this.block.classList.toggle('finished',this.finished);
        this.block.classList.toggle('paused',this.started&&!this.running&&!this.finished);
        if(floatingTimerCurrent===this) updateFloatingTimer(this);
      },
      clear(){if(this.interval){clearInterval(this.interval);unregisterRecipeTimer(this.interval);this.interval=null;}this.running=false;},
      pause(){this.clear();this.update();vibe(8);},
      reset(){this.clear();this.left=this.total;this.started=false;this.finished=false;this.update();vibe(8);},
      finish(){this.clear();this.left=0;this.running=false;this.finished=true;this.started=true;this.update();showFloatingTimer(this,false);timerSignal();},
      start(auto=true){
        if(this.running) return;
        if(this.left<=0){this.left=this.total;this.finished=false;}
        this.started=true;this.finished=false;this.running=true;this.update();
        showFloatingTimer(this,false);
        this.interval=registerRecipeTimer(setInterval(()=>{this.left=Math.max(0,this.left-1);this.update();if(this.left<=0)this.finish();},1000));
        vibe(auto?[10,28,10]:8);
      }
    };
    block._timerObj=timer;
    if(step) step._timerObj=timer;
    block.onclick=e=>{e.preventDefault(); e.stopPropagation(); showFloatingTimer(timer,false); if(!timer.running&&!timer.finished) timer.start(false);};
    recipeTimers.push(timer);
    timer.update();
  });
}
function startTimerForStep(step,auto=true){
  if(!step||!step._timerObj) return false;
  const timer=step._timerObj;
  if(timer.started||timer.finished||timer.running){
    showFloatingTimer(timer,false);
    return true;
  }
  timer.start(auto);
  return true;
}
function startReachedStepTimer(){
  const current=$$('.step').find(step=>{const c=step.querySelector('[data-check]');return c&&!c.checked;});
  if(current&&startTimerForStep(current,true)) return;
}
function handleStepCheckChange(input){
  const step=input.closest('.step');
  if(input.checked){
    if(startTimerForStep(step,true)) return;
    startReachedStepTimer();
  }else if(step&&step._timerObj&&!step._timerObj.running){
    step._timerObj.reset();
  }
}
function renderLikedRecipes(scroll=true){
  const list=$('#likedRecipesList'), empty=$('#likedEmpty');
  if(!list) return;
  const items=normalizeLikedRecipes(state.likedRecipes).map(resolveRecipeRef).filter(Boolean);
  list.innerHTML=items.map(recipeCard).join('');
  if(empty) empty.hidden=items.length>0;
  renderRecipeInteractions(list);
  updateHomeMeta();
  if(scroll) setTimeout(()=>list.scrollIntoView({block:'start',behavior:'smooth'}),30);
}
function openLikedView(){showView('likedview','page');}
function encyclopediaTypes(){return ['Все',...Array.from(new Set(encyclopediaItems.map(item=>item.type)))];}
function renderEncyclopedia(){
  const filters=$('#encyclopediaFilters'), grid=$('#encyclopediaGrid');
  if(!filters || !grid) return;
  const active=state.encyTab||'Все';
  filters.innerHTML=encyclopediaTypes().map(type=>`<button class="encyclopedia-filter ${active===type?'active':''}" type="button" data-ency-tab="${esc(type)}">${esc(type)}</button>`).join('');
  filters.querySelectorAll('[data-ency-tab]').forEach(btn=>btn.onclick=()=>{state.encyTab=btn.dataset.encyTab; saveState(); renderEncyclopedia();});
  const items=active==='Все'?encyclopediaItems:encyclopediaItems.filter(item=>item.type===active);
  grid.innerHTML=items.map(item=>`<article class="encyclopedia-card"><small>${esc(item.type)}</small><h3>${esc(item.name)}</h3><p>${esc(item.text)}</p></article>`).join('');
}
function openEncyclopediaView(){showView('encyclopediaview','page');}
function recipeVersionActionsHtml(recipeId){
  const edited=!!recipeOverrideFor(recipeId);
  return `<section class="recipe-version-actions"><div><strong>${edited?'Показывается ваша версия':'Оригинальный рецепт'}</strong><p>${cloudUser?'Изменения хранятся в вашем аккаунте и доступны на других устройствах.':'Войдите в аккаунт, чтобы редактировать и сохранять свою версию рецепта.'}</p></div><div class="recipe-version-buttons"><button class="btn primary" type="button" data-edit-base="${esc(recipeId)}">Редактировать рецепт</button><button class="btn ghost recipe-reset-btn" type="button" data-reset-base="${esc(recipeId)}" ${edited?'':'disabled'}>Сбросить до оригинала</button></div></section>`;
}
function requireRecipeEditingAccount(){
  if(cloudUser) return true;
  closeModalInstant();
  openTopAuth('login');
  setAuthPlaque('Войдите в аккаунт, чтобы редактировать рецепты и хранить изменения в Supabase.');
  return false;
}
function openBaseRecipeEditor(id){
  if(!requireRecipeEditingAccount()) return;
  const canonicalId=canonicalRecipeId(id,'base');
  const original=baseRecipeIndex.get(canonicalId);
  const r=effectiveBaseRecipe(canonicalId);
  if(!original||!r) return;
  clearRecipeStepTimers();
  const categoryOptions=Array.from(new Set([...categoryOrder,r.category])).map(cat=>`<option value="${esc(cat)}" ${cat===r.category?'selected':''}>${esc(cat)}</option>`).join('');
  const nutrition=r.nutrition||nutritionOf(r);
  $('#modalTags').innerHTML=`<span class="tag">${esc(original.country)}</span><span class="tag">Редактирование</span>`;
  $('#modalTitle').textContent=r.title;
  $('#modalBody').innerHTML=`<form class="base-recipe-editor" id="baseRecipeEditor"><div class="base-editor-grid"><label><span>Название</span><input class="input" id="baseEditTitle" maxlength="220" value="${esc(r.title||'')}"></label><label><span>Категория</span><select class="select" id="baseEditCategory">${categoryOptions}</select></label><label><span>Время</span><input class="input" id="baseEditTime" maxlength="80" value="${esc(r.time||'')}"></label><label><span>Порции</span><input class="input" id="baseEditServings" type="number" min="1" max="100" step="1" value="${Math.max(1,Number(r.servings)||1)}"></label><label><span>Сложность</span><select class="select" id="baseEditDifficulty"><option value="легко" ${r.difficulty==='легко'?'selected':''}>легко</option><option value="средне" ${r.difficulty==='средне'?'selected':''}>средне</option><option value="сложно" ${r.difficulty==='сложно'?'selected':''}>сложно</option></select></label><label class="base-editor-country"><span>Страна</span><input class="input" value="${esc(original.country)}" readonly></label></div><div class="base-editor-nutrition"><label><span>Ккал / порцию</span><input class="input" id="baseEditKcal" type="number" min="0" step="0.1" value="${esc(nutrition.kcal??0)}"></label><label><span>Белки, г</span><input class="input" id="baseEditProtein" type="number" min="0" step="0.1" value="${esc(nutrition.protein??0)}"></label><label><span>Жиры, г</span><input class="input" id="baseEditFat" type="number" min="0" step="0.1" value="${esc(nutrition.fat??0)}"></label><label><span>Углеводы, г</span><input class="input" id="baseEditCarbs" type="number" min="0" step="0.1" value="${esc(nutrition.carbs??0)}"></label></div><label class="base-editor-wide"><span>Ингредиенты — каждый с новой строки</span><textarea class="textarea" id="baseEditIngredients" rows="10">${esc((r.ingredients||[]).join('\n'))}</textarea></label><label class="base-editor-wide"><span>Шаги приготовления — каждый с новой строки</span><textarea class="textarea" id="baseEditSteps" rows="12">${esc((r.steps||[]).join('\n'))}</textarea></label><label class="base-editor-wide"><span>Заметка</span><textarea class="textarea" id="baseEditTips" rows="4">${esc(r.tips||'')}</textarea></label><div class="base-editor-actions"><button class="btn ghost" type="button" id="cancelBaseRecipeEdit">Отмена</button><button class="btn primary" type="submit" id="saveBaseRecipeEdit">Сохранить изменения</button></div><p class="base-editor-status" id="baseRecipeEditStatus">Оригинальная версия останется в приложении и не будет изменена.</p></form>`;
  $('#cancelBaseRecipeEdit').onclick=()=>openRecipe(canonicalId,'base');
  $('#baseRecipeEditor').onsubmit=event=>{event.preventDefault(); saveBaseRecipeEdit(canonicalId);};
  openModal();
  setTimeout(()=>$('#baseEditTitle')?.focus(),30);
}
async function saveBaseRecipeEdit(id){
  if(!requireRecipeEditingAccount()) return false;
  const original=baseRecipeIndex.get(canonicalRecipeId(id,'base'));
  if(!original) return false;
  const lines=selector=>(($(selector)?.value)||'').split('\n').map(value=>value.trim()).filter(Boolean);
  const title=($('#baseEditTitle')?.value||'').trim();
  const ingredients=lines('#baseEditIngredients');
  const steps=lines('#baseEditSteps');
  const status=$('#baseRecipeEditStatus');
  if(!title||!ingredients.length||!steps.length){if(status) status.textContent='Заполните название, ингредиенты и шаги приготовления.'; return false;}
  const now=new Date().toISOString();
  const recipeData={
    title,
    category:$('#baseEditCategory')?.value||original.category,
    time:($('#baseEditTime')?.value||'').trim()||'—',
    servings:Math.max(1,Number($('#baseEditServings')?.value)||1),
    difficulty:$('#baseEditDifficulty')?.value||'легко',
    ingredients,
    steps,
    tips:($('#baseEditTips')?.value||'').trim(),
    nutrition:{kcal:Math.max(0,Number($('#baseEditKcal')?.value)||0),protein:Math.max(0,Number($('#baseEditProtein')?.value)||0),fat:Math.max(0,Number($('#baseEditFat')?.value)||0),carbs:Math.max(0,Number($('#baseEditCarbs')?.value)||0)},
    updatedAt:now
  };
  const button=$('#saveBaseRecipeEdit');
  if(button){button.disabled=true;button.textContent='Сохраняю…';}
  if(status) status.textContent='Сохраняю пользовательскую версию в Supabase…';
  const saved=await saveRecipeOverrideToCloud(original.id,recipeData);
  if(!saved){if(button){button.disabled=false;button.textContent='Сохранить изменения';} if(status) status.textContent='Не удалось сохранить изменения. Проверьте подключение и повторите попытку.'; return false;}
  renderCountries();
  if(state.country===original.country) renderCountry(original.country);
  openRecipe(original.id,'base');
  return true;
}
async function resetBaseRecipeToOriginal(id){
  if(!requireRecipeEditingAccount()) return false;
  const canonicalId=canonicalRecipeId(id,'base');
  if(!recipeOverrideFor(canonicalId)) return true;
  if(!confirm('Удалить вашу версию и вернуть оригинальный рецепт?')) return false;
  const reset=await deleteRecipeOverrideFromCloud(canonicalId);
  if(!reset){alert('Не удалось сбросить рецепт. Проверьте подключение к интернету.'); return false;}
  const original=baseRecipeIndex.get(canonicalId);
  renderCountries();
  if(original&&state.country===original.country) renderCountry(original.country);
  openRecipe(canonicalId,'base');
  return true;
}
function fodmapIngredientMark(value){
  const result=window.TABLE_BOOK_FODMAP_REFERENCE?.classify(value);
  if(!result) return '';
  return `<i class="fodmap-dot ${result.level}" title="${esc(result.label)}" aria-label="FODMAP: ${esc(result.short)}"></i>`;
}
function fodmapLegendHtml(){return '<div class="fodmap-legend" aria-label="Подсказка FODMAP"><span><i class="fodmap-dot green"></i>низкий</span><span><i class="fodmap-dot yellow"></i>зависит от порции</span><span><i class="fodmap-dot red"></i>высокий</span><small>Ориентир: переносимость и размер порции индивидуальны.</small></div>';}
async function openRecipe(id,source='base',recipeOverride=null,{skipCloud=false}={}){
  clearRecipeStepTimers();
  const normalizedSource=source==='custom'?'custom':source==='shared'?'shared':'base';
  const canonicalId=normalizedSource==='shared'?String(id||'shared'):canonicalRecipeId(id,normalizedSource);
  let r=recipeOverride||(normalizedSource==='custom'?(myRecipes.find(x=>x.id===canonicalId)||effectiveBaseRecipe(canonicalId)):effectiveBaseRecipe(canonicalId)); if(!r) return false;
  activeRecipeModalKey=`${normalizedSource}:${canonicalId}`;
  const requestedModalKey=activeRecipeModalKey;
  if(normalizedSource==='base'&&!(Array.isArray(r.steps)&&r.steps.length)){
    $('#modalTags').innerHTML=`<span class="tag">${esc(r.country||'Каталог')}</span><span class="tag">${esc(r.category||'Рецепт')}</span>`;
    $('#modalTitle').textContent=r.title||'Рецепт';
    $('#modalBody').innerHTML='<section class="panel recipe-loading-panel"><p>Загружаю выбранный рецепт…</p></section>';
    openModal();
    try{
      await loadBaseRecipeDetails(canonicalId);
    }catch(error){
      console.warn('Recipe detail load failed',error);
      if(activeRecipeModalKey===requestedModalKey) $('#modalBody').innerHTML='<section class="panel"><p>Не удалось загрузить рецепт. Проверьте соединение и откройте карточку ещё раз.</p></section>';
      return false;
    }
    if(activeRecipeModalKey!==requestedModalKey||!$('#modal')?.classList.contains('open')) return false;
    r=recipeOverride||effectiveBaseRecipe(canonicalId);
    if(!r) return false;
  }
  activeSharedRecipe=normalizedSource==='shared'?r:null;
  const likeAction=normalizedSource==='shared'?'':likeButtonHtml(r.id,normalizedSource,'');
  const menuTags=`${r.preparedAhead?'<span class="tag green">Приготовлено заранее</span>':''}${r.batchLabel?`<span class="tag">${esc(r.batchLabel)}</span>`:''}`;
  $('#modalTags').innerHTML=`<span class="tag">${esc(r.country||'Мои рецепты')}</span><span class="tag">${esc(r.category||'Без категории')}</span>${r.healthy?'<span class="tag green">Полезный</span>':''}${menuTags}${likeAction}${shareButtonHtml(r.id||canonicalId,normalizedSource)}${revokeShareButtonHtml(r.id||canonicalId,normalizedSource)}`;
  $('#modalTitle').innerHTML=`<span>${esc(r.title)}</span>${originLabel(r)?`<small>${esc(originLabel(r))}</small>`:''}`;
  const nut=r.nutrition||nutritionOf(r);
  const baseServings=r.servings||1;
  const nutritionProducts=Array.isArray(r.ingredientNutrition)?r.ingredientNutrition:[];
  const ingredients=(list,m)=>(Array.isArray(list)?list:[]).map(x=>`<li>${fodmapIngredientMark(x)}<span>${esc(scaledIngredientText(x,m))}</span></li>`).join('');
  const nutritionHtml=(n,s)=>`<div class="nutrition-total-label">На всё блюдо · ${s} ${plural(s,['порция','порции','порций'])}</div><div class="nutrition"><div class="ncard"><strong>${fmt(n.kcal*s)}</strong><span>ккал</span></div><div class="ncard"><strong>${fmt(n.protein*s)} г</strong><span>белки</span></div><div class="ncard"><strong>${fmt(n.fat*s)} г</strong><span>жиры</span></div><div class="ncard"><strong>${fmt(n.carbs*s)} г</strong><span>углеводы</span></div></div><div class="nnote">На 1 порцию: ${fmt(n.kcal)} ккал • Б ${fmt(n.protein)} г • Ж ${fmt(n.fat)} г • У ${fmt(n.carbs)} г</div>`;
  const stepsHtml=(r.steps||[]).map(step=>{const sec=extractStepTimerSeconds(step); return `<div class="step"><label class="checkline"><input type="checkbox" data-check><span>${esc(step)}</span></label>${sec?timerHtml(sec):''}</div>`;}).join('');
  const timingHtml=(r.prepTime||r.cookTime||r.totalTime)?`<div class="recipe-timing"><span><small>Подготовка</small><b>${esc(r.prepTime||'—')}</b></span><span><small>Приготовление</small><b>${esc(r.cookTime||'—')}</b></span><span><small>Общее время</small><b>${esc(r.totalTime||r.time||'—')}</b></span></div>`:'';
  const historyHtml=r.historyNote?`<div class="tip recipe-history"><strong>История и традиция:</strong> ${esc(r.historyNote)}</div>`:'';
  const recipeSources=Array.isArray(r.recipeSources)?r.recipeSources.filter(source=>source&&source.url&&source.label):[];
  const sourcesHtml=recipeSources.length?`<div class="recipe-sources"><strong>Источники проверки</strong><div>${recipeSources.map(source=>`<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.label)}</a>`).join('')}</div></div>`:'';
  const cookedWeightNote=r.nutrition100?`<div class="nnote">Расчёт из КБЖУ на 100 г и ${r.weightEstimated?'оценочного':'взвешенного'} веса готового блюда ${r.weightEstimated?'≈ ':''}${r.weight||0} г.${!r.weightEstimated&&r.estimatedWeight&&Math.abs(Number(r.estimatedWeight)-Number(r.weight||0))>Math.max(10,Number(r.weight||0)*.05)?` Расчётный ориентир по продуктам ≈ ${fmt(r.estimatedWeight)} г.`:''}</div>`:'';
  $('#modalBody').innerHTML=`<div class="recipe-cols"><aside class="panel"><h3>Порции</h3><div class="portion-box"><div class="portion-label">Калькулятор</div><div class="stepper"><button id="portionMinus">−</button><input id="portionInput" type="number" min="1" step="1" value="${baseServings}"><button id="portionPlus">+</button></div><div class="portion-label">База: ${baseServings}</div></div>${timingHtml}<h3>Ингредиенты</h3><ul class="ingredients" id="ingredientsList">${ingredients(r.ingredients,1)}</ul>${fodmapLegendHtml()}<div class="nnote" id="ingredientsNote">Граммовки и количества показаны для ${baseServings} ${plural(baseServings,['порции','порций','порций'])}.</div><div id="nutritionBox">${nutritionHtml(nut,baseServings)}</div>${nutritionProducts.length?`<div id="productNutritionBreakdown">${productNutritionDetailsHtml(nutritionProducts,{servings:baseServings})}</div>`:''}${cookedWeightNote}</aside><section class="panel"><h3>Приготовление</h3>${historyHtml}<div class="progress" id="progressText">Отмечено 0 из ${(r.steps||[]).length}</div><div class="steps">${stepsHtml}</div>${r.tips?`<div class="tip"><strong>Заметка:</strong> ${esc(r.tips)}</div>`:''}${sourcesHtml}<div class="swipe-close">Потяните верхнюю ручку вниз, чтобы закрыть</div></section></div>${normalizedSource==='base'?recipeVersionActionsHtml(canonicalId):''}`;
  function rerender(){
    const raw=Number($('#portionInput').value); const s=Number.isFinite(raw)&&raw>0?raw:baseServings;
    $('#portionInput').value=s;
    const mult=s/baseServings;
    $('#ingredientsList').innerHTML=ingredients(r.ingredients,mult);
    $('#ingredientsNote').textContent=`Граммовки и количества показаны для ${s} ${plural(s,['порции','порций','порций'])}.`;
    $('#nutritionBox').innerHTML=nutritionHtml(nut,s);
    const breakdown=$('#productNutritionBreakdown'); if(breakdown) breakdown.innerHTML=productNutritionDetailsHtml(nutritionProducts,{mult,servings:s});
  }
  function progress(){const cs=$$('[data-check]'); const done=cs.filter(c=>c.checked).length; $('#progressText').textContent=`Отмечено ${done} из ${cs.length}`; cs.forEach(c=>c.nextElementSibling.classList.toggle('done',c.checked));}
  $('#portionMinus').onclick=()=>{$('#portionInput').value=Math.max(1,Number($('#portionInput').value||baseServings)-1); rerender();};
  $('#portionPlus').onclick=()=>{$('#portionInput').value=Math.max(1,Number($('#portionInput').value||baseServings)+1); rerender();};
  $('#portionInput').oninput=rerender;
  $$('[data-check]').forEach(c=>c.onchange=()=>{progress(); vibe(8); handleStepCheckChange(c);});
  progress(); initStepTimers(); renderRecipeInteractions($('#modal')); openModal(); vibe(12);
  if(normalizedSource==='base'&&!skipCloud&&cloudUser){
    const modalKey=activeRecipeModalKey;
    requestAnimationFrame(()=>loadRecipeOverrideFromCloud(canonicalId).then(changed=>{
      if(changed&&activeRecipeModalKey===modalKey&&$('#modal')?.classList.contains('open')) openRecipe(canonicalId,'base',null,{skipCloud:true});
    }));
  }
  return true;
}
async function openRecipeFromUrl(){
  const request=recipeRequestFromUrl();
  if(!request) return false;
  if(request.source==='shared' && request.shareCode){
    try{
      const {data,error}=await cloud.rpc('get_shared_recipe',{p_share_code:request.shareCode});
      if(error) throw error;
      const recipe=normalizeRemoteSharedRecipe(data,request.shareCode);
      if(!recipe) throw new Error('Shared recipe was not found or has been revoked');
      await openRecipe(request.id,'shared',recipe);
    }catch(error){
      console.warn('Shared recipe loading failed',error);
      $('#modalTags').innerHTML='<span class="tag">Публичная ссылка</span>';
      $('#modalTitle').textContent='Рецепт недоступен';
      $('#modalBody').innerHTML='<section class="panel"><p>Ссылка недействительна или владелец рецепта отозвал доступ.</p></section>';
      openModal();
      return false;
    }
  }
  else if(request.source==='shared') await openRecipe(request.id,'shared',request.recipe);
  else await openRecipe(request.id,'base');
  return true;
}
const modalEls={modal:$('#modal'),dialog:$('#dialog'),body:document.body};
function resetDialogPosition(animate=true){const d=modalEls.dialog;if(animate)d.classList.remove('dragging','drag-ready');d.style.transform='translate3d(0,0,0) rotateX(0deg) scale(1)';modalEls.modal.style.background='rgba(70,46,33,.28)';}
function openModal(){modalEls.modal.classList.add('open'); modalEls.body.classList.add('modal-open'); const d=modalEls.dialog; d.classList.remove('closing-up','dragging'); d.classList.add('drag-ready'); resetDialogPosition(false);}
function closeModalDown(){clearRecipeStepTimers(); activeRecipeModalKey=null; const d=modalEls.dialog; if(!modalEls.modal.classList.contains('open')) return; if(d.classList.contains('closing-up')) return; d.classList.remove('dragging','drag-ready'); d.classList.add('closing-up'); vibe(24); setTimeout(()=>{modalEls.modal.classList.remove('open'); modalEls.body.classList.remove('modal-open'); d.classList.remove('closing-up'); resetDialogPosition(false);},320);} function closeModalUp(){closeModalDown();}
function closeModalInstant(){clearRecipeStepTimers(); activeRecipeModalKey=null; modalEls.modal.classList.remove('open'); modalEls.body.classList.remove('modal-open'); modalEls.dialog.classList.remove('closing-up','dragging','drag-ready'); resetDialogPosition(false);}
const dragState={active:false,startX:0,startY:0,lastX:0,lastY:0,lastTime:0,dy:0,dx:0,velocityY:0,moved:false};
function isDialogDragHandle(target){return !!target.closest('.dialog-head') && !target.closest('button,input,textarea,select,label');}
function updateDialogDrag(dx,dy){
  const d=modalEls.dialog;
  const pull=Math.max(0,dy);
  const upward=Math.min(0,dy)*.16;
  const dampY=pull*.82 + upward;
  const dampX=dx*.04;
  const rotate=Math.max(-2,Math.min(5,dampY/42));
  const scale=1-Math.min(pull/1700,.045);
  d.style.transform=`translate3d(${dampX}px, ${dampY}px, 0) rotateX(${rotate}deg) scale(${scale})`;
  const alpha=Math.max(.12,.28-Math.min(pull/560,.16));
  modalEls.modal.style.background=`rgba(70,46,33,${alpha.toFixed(3)})`;
}
function beginDialogDrag(clientX,clientY,target){
  if(!modalEls.modal.classList.contains('open')) return false;
  if(!isDialogDragHandle(target)) return false;
  dragState.active=true; dragState.moved=false;
  dragState.startX=dragState.lastX=clientX; dragState.startY=dragState.lastY=clientY;
  dragState.lastTime=performance.now(); dragState.dy=0; dragState.dx=0; dragState.velocityY=0;
  modalEls.dialog.classList.add('dragging'); vibe(12); return true;
}
function moveDialogDrag(clientX,clientY){
  if(!dragState.active) return;
  const now=performance.now();
  dragState.dx=clientX-dragState.startX;
  dragState.dy=clientY-dragState.startY;
  if(Math.abs(dragState.dy)>8 || Math.abs(dragState.dx)>8) dragState.moved=true;
  const dt=Math.max(16,now-dragState.lastTime);
  dragState.velocityY=(clientY-dragState.lastY)/dt;
  dragState.lastX=clientX; dragState.lastY=clientY; dragState.lastTime=now;
  updateDialogDrag(dragState.dx,dragState.dy);
}
function endDialogDrag(){
  if(!dragState.active) return;
  dragState.active=false; modalEls.dialog.classList.remove('dragging');
  const deliberateFastDown = dragState.velocityY > .85 && dragState.dy > 58;
  const deliberateLongDown = dragState.dy > 155;
  if(deliberateFastDown || deliberateLongDown){closeModalDown(); return;}
  vibe(10); resetDialogPosition(true);
}
function initDialogDrag(){
  const d=modalEls.dialog; if(d.dataset.dragReady==='1') return; d.dataset.dragReady='1';
  d.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return; if(beginDialogDrag(e.clientX,e.clientY,e.target)){try{d.setPointerCapture(e.pointerId)}catch(err){}}});
  d.addEventListener('pointermove',e=>{if(!dragState.active)return; moveDialogDrag(e.clientX,e.clientY);});
  const finish=()=>endDialogDrag();
  d.addEventListener('pointerup',finish); d.addEventListener('pointercancel',finish); d.addEventListener('lostpointercapture',finish);
}
function emptyPageSwipe(){
  return {active:false,tracking:false,pointerId:null,pointerType:'',startX:0,startY:0,lastX:0,lastT:0,dx:0,dy:0,view:null,blocked:false};
}
let pageSwipe=emptyPageSwipe();
function pageSwipeMatchesPointer(event){
  return pageSwipe.pointerId===null || event?.pointerId===pageSwipe.pointerId;
}
function swipeBackBlockedTarget(target){return !!(target?.closest?.('#mealPickerModal,.dialog,.auth-popover,input,textarea,select,[contenteditable="true"],.cuisine-carousel-shell,#countryGrid.cuisine-carousel,#mealCalendarPanel,#mealCalendarGrid,.meal-picker-dialog'))}
function canSwipeBack(){return state.route!=='home' || $('#modal')?.classList.contains('open') || ($('#mealPickerModal') && !$('#mealPickerModal').hidden);}
function currentSwipeView(){return $('#'+(state.route||'home')) || $('.view.active');}
function resetPageSwipeView(view,{returning=false}={}){
  if(!view) return;
  view.classList.remove('swipe-back-dragging','swipe-back-finish');
  if(returning){
    view.classList.add('swipe-back-return');
    setTimeout(()=>view.classList.remove('swipe-back-return'),320);
  }else{
    view.classList.remove('swipe-back-return');
  }
  view.style.removeProperty('--swipe-x');
  view.style.removeProperty('--swipe-p');
}
function finishPageSwipeBack(view){
  if(!view){goBackPage(); return;}
  view.classList.remove('swipe-back-dragging','swipe-back-return');
  view.classList.add('swipe-back-finish');
  $('#swipeCue')?.classList.remove('show');
  setTimeout(()=>{
    resetPageSwipeView(view);
    document.body.classList.remove('page-swipe-active');
    goBackPage();
  },260);
}
function cancelPageSwipeBack(view){
  $('#swipeCue')?.classList.remove('show');
  document.body.classList.remove('page-swipe-active');
  resetPageSwipeView(view,{returning:true});
}
document.addEventListener('pointerdown',e=>{
  if(e.pointerType==='pen' || e.isPrimary===false || pageSwipe.tracking) return;
  if(e.pointerType==='mouse' && e.button!==0) return;
  if(!canSwipeBack() || swipeBackBlockedTarget(e.target)) return;
  if(e.clientX>window.innerWidth-18) return;
  pageSwipe={active:false,tracking:true,pointerId:e.pointerId,pointerType:e.pointerType,startX:e.clientX,startY:e.clientY,lastX:e.clientX,lastT:performance.now(),dx:0,dy:0,view:currentSwipeView(),blocked:false};
},{passive:true});
document.addEventListener('pointermove',e=>{
  if(!pageSwipe.tracking || !pageSwipeMatchesPointer(e) || !canSwipeBack()) return;
  const dx=e.clientX-pageSwipe.startX;
  const dy=e.clientY-pageSwipe.startY;
  pageSwipe.dx=dx; pageSwipe.dy=dy;
  const adx=Math.abs(dx), ady=Math.abs(dy);
  if(!pageSwipe.active){
    if(ady>14 && ady>adx*.72){pageSwipe=emptyPageSwipe(); return;}
    if(dx<=0 || adx<22 || ady>44) return;
    pageSwipe.active=true;
    document.body.classList.add('page-swipe-active');
    pageSwipe.view=currentSwipeView();
    pageSwipe.view?.classList.add('swipe-back-dragging');
    try{e.target.setPointerCapture?.(e.pointerId)}catch(err){}
  }
  if(pageSwipe.active){
    e.preventDefault?.();
    const x=Math.max(0,dx);
    const p=Math.min(1,x/Math.min(window.innerWidth,420));
    if(pageSwipe.view){
      pageSwipe.view.style.setProperty('--swipe-x', x+'px');
      pageSwipe.view.style.setProperty('--swipe-p', p.toFixed(3));
    }
    if(x>34) $('#swipeCue')?.classList.add('show'); else $('#swipeCue')?.classList.remove('show');
    pageSwipe.lastX=e.clientX; pageSwipe.lastT=performance.now();
  }
},{passive:false});
function endPageSwipe(e){
  if(!pageSwipe.tracking || !pageSwipeMatchesPointer(e)) return;
  const dx=(e?.clientX??pageSwipe.lastX)-pageSwipe.startX;
  const dy=Math.abs((e?.clientY??pageSwipe.startY)-pageSwipe.startY);
  const view=pageSwipe.view;
  const active=pageSwipe.active;
  pageSwipe=emptyPageSwipe();
  if(!active){$('#swipeCue')?.classList.remove('show'); return;}
  const shouldGo=dx>Math.min(145,window.innerWidth*.34) && dy<96;
  if(shouldGo){vibe(12); finishPageSwipeBack(view);} else cancelPageSwipeBack(view);
}
function abortPageSwipe(e){
  if(!pageSwipe.tracking || !pageSwipeMatchesPointer(e)) return;
  const view=pageSwipe.view;
  pageSwipe=emptyPageSwipe();
  cancelPageSwipeBack(view);
}
document.addEventListener('pointerup',endPageSwipe,{passive:true});
document.addEventListener('pointercancel',abortPageSwipe,{passive:true});
document.addEventListener('lostpointercapture',abortPageSwipe,{passive:true});

function bindClick(id,handler){const el=$('#'+id); if(el) el.onclick=handler; return el;}
function bindInput(id,handler){const el=$('#'+id); if(el) el.oninput=handler; return el;}
window.addEventListener?.('error',event=>{
  const msg=event?.message||'Ошибка скрипта';
  console.warn('Table book runtime error',event?.error||msg);
  try{cloudStatus('Ошибка приложения: '+msg+'. Обновите страницу; если повторяется — пришлите этот текст.');}catch(e){}
  try{setAuthPlaque('Ошибка приложения: '+msg+'. Я добавила защиту, чтобы авторизация не блокировалась из-за календаря или других блоков.','error');}catch(e){}
});
window.addEventListener?.('unhandledrejection',event=>{
  const msg=event?.reason?.message||String(event?.reason||'Необработанная ошибка');
  console.warn('Table book unhandled rejection',event?.reason);
  try{cloudStatus('Ошибка Supabase/синхронизации: '+msg);}catch(e){}
});

bindClick('topLoginBtn',()=>openTopAuth('login'));
bindClick('topRegisterBtn',()=>openTopAuth('register'));
bindClick('topLogoutBtn',cloudSignOut);
bindClick('topAuthClose',closeTopAuth);
bindClick('topPanelSignIn',topCloudSignIn);
bindClick('topPanelSignUp',topCloudSignUp);
bindClick('topResendConfirm',resendConfirmationEmail);
const topStatusEl=bindClick('topAuthStatus',()=>openTopAuth('cabinet'));
if(topStatusEl) topStatusEl.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openTopAuth('cabinet');}};
['topCloudNickname','topCloudEmail','topCloudPassword'].forEach(id=>{const el=$('#'+id); if(el) el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault(); const mode=$('#topAuthPanel')?.dataset.mode; if(mode==='register') topCloudSignUp(); else topCloudSignIn();}});});
bindClick('cabinetSignOut',cloudSignOut);
bindClick('cabinetSettingsBtn',openAccountSettings);
bindClick('cabinetUserEmail',openAccountSettings);
bindClick('accountBackBtn',openCabinetHome);
bindClick('accountSaveNickname',saveNickname);
['settingsAge','settingsHeight','settingsWeight','settingsActivity'].forEach(id=>{const input=$('#'+id);if(input) input.addEventListener('input',()=>renderProfileEnergyEstimate());});
document.querySelectorAll('input[name="settingsSex"]').forEach(input=>input.addEventListener('change',()=>renderProfileEnergyEstimate()));
bindClick('cloudSignIn',cloudSignIn);
bindClick('cloudSignUp',cloudSignUp);
bindClick('cloudSignOut',cloudSignOut);
bindClick('themeBtn',()=>{const b=$('#themeBtn'); if(!b) return; b.classList.remove('tapped','theme-morph'); void b.offsetWidth; b.classList.add('tapped','theme-morph'); state.theme=state.theme==='dark'?'light':'dark'; saveState(); setTheme(); vibe([12,24,12]); setTimeout(()=>b.classList.remove('tapped'),180); setTimeout(()=>b.classList.remove('theme-morph'),460);});
bindClick('homeBrand',()=>{if(state.route!=='home') goHomeWithFlip();});
bindClick('backBtn',goHomeWithFlip);
bindClick('myBackBtn',goHomeWithFlip);
bindClick('mealBackBtn',goHomeWithFlip);
bindClick('clearCat',()=>{state.filterCat=null; saveState(); renderCountry(state.country);});
bindClick('myRecipesCard',()=>{state.myCat=null; state.editingId=null; saveState(); showMyLibrary(false); showView('myview'); vibe(12);});
bindClick('homeMealCalendarCard',()=>openMealCalendar());
bindClick('likedRecipesCard',openLikedView);
bindClick('encyclopediaCard',openEncyclopediaView);
bindClick('likedBackBtn',goHomeWithFlip);
bindClick('encyclopediaBackBtn',goHomeWithFlip);
bindClick('createMyRecipe',()=>openMyEditor(state.myCat));
bindClick('closeMyEditor',showMyLibrary);

bindClick('addProductRow',()=>addProductRow());
bindClick('saveMealDay',saveMealDay);
bindClick('editMealDay',editMealDay);
bindClick('clearMealDay',clearMealDay);
bindClick('shoppingPrevWeek',()=>setShoppingWeek(-1));
bindClick('shoppingCurrentWeek',()=>setShoppingWeek(0,{today:true}));
bindClick('shoppingNextWeek',()=>setShoppingWeek(1));
bindClick('copyShoppingList',copyWeeklyShoppingList);
bindClick('closeMealPicker',closeMealDishPicker);
bindClick('mealPickerBack',mealPickerBackToCountries);
const mealPickerModal=$('#mealPickerModal'); if(mealPickerModal) mealPickerModal.onclick=e=>{if(e.target.id==='mealPickerModal') closeMealDishPicker();};
bindClick('saveMyRecipe',saveCustomRecipe);
bindClick('resetMyRecipe',resetMyForm);
bindClick('closeModal',closeModalUp);
const modalEl=$('#modal'); if(modalEl) modalEl.onclick=e=>{if(e.target.id==='modal') closeModalInstant();};
bindClick('exportData',exportUserData);
const importBtn=$('#importData'), backupFile=$('#backupFile');
if(importBtn&&backupFile) importBtn.onclick=()=>backupFile.click();
if(backupFile) backupFile.onchange=()=>{importUserData(backupFile.files[0]); backupFile.value='';};
document.addEventListener('click',e=>{const panel=$('#topAuthPanel'), wrap=$('#topAuth'); if(panel && wrap && !panel.hidden && !wrap.contains(e.target)) closeTopAuth();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeTopAuth(); closeModalInstant(); closeMealDishPicker();}});
initializeNavigationIcons();
function boot(){
  const brand=$('#brandMark');
  if(brand && !brand.querySelector('.brand-app-icon')) brand.innerHTML='<img class="brand-app-icon" src="./assets/icons/icon-192.png" alt="" loading="eager" decoding="async">';
  clearLegacyReferenceCaches();
  initCloudAuth();
  setHomeActionIcon('myRecipesIcon','my-recipes','Мои рецепты');
  setHomeActionIcon('mealCalendarIcon','menu-week','Меню на неделю');
  setHomeActionIcon('likedRecipesIcon','liked','Мне нравится');
  setHomeActionIcon('encyclopediaIcon','encyclopedia','Энциклопедия');
  ensureMealPlan();
  fillMyCategory();
  bindPantryFinder();
  const myCatSelect=$('#myCategory');
  if(myCatSelect) myCatSelect.onchange=()=>{state.myCat=myCatSelect.value; saveState();};
  const ingredientsField=$('#myIngredients');
  if(ingredientsField) ingredientsField.addEventListener('input',queueIngredientProductSync);
  ['myKcal100','myProtein100','myFat100','myCarbs100','myServings'].forEach(id=>{const el=$('#'+id); if(el) el.addEventListener('input',updateKbjuPreview);});
  const weightInput=$('#myWeight');
  if(weightInput) weightInput.addEventListener('input',()=>{weightInput.dataset.autoEstimate='0';updateKbjuPreview();});
  setTheme();
  updateStats();
  renderCountries();
  initDialogDrag();
  if(state.country==='Италия'||state.country==='Испания') state.country='Средиземноморская';
  if(state.route==='country' && state.country) renderCountry(state.country);
  else if(state.route==='myview'){state.editingId=null; showMyLibrary(false); showView('myview');}
  else if(state.route==='mealview') openMealCalendar();
  else if(state.route==='likedview') openLikedView();
  else if(state.route==='encyclopediaview') openEncyclopediaView();
  else showView('home');
  requestAnimationFrame(()=>openRecipeFromUrl().catch(error=>console.warn('Recipe URL opening failed',error)));
}
try{boot();}catch(error){console.warn('Boot failed',error); try{cloudStatus('Ошибка запуска приложения: '+(error?.message||error)+'. Авторизация доступна, попробуйте войти снова.');}catch(e){} try{renderCloudUi();}catch(e){}}
