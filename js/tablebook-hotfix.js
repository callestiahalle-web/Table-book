(() => {
  'use strict';

  const LEGACY_FAVORITES_KEY = 'table_book_favorites_v1';
  const FAVORITES_CACHE_PREFIX = 'table_book_favorites_cache_v2:';
  const FAVORITES_STATE_FIELD = 'favorites';
  const FAVORITES_UPDATED_FIELD = 'favoritesUpdatedAt';
  const EQUIPMENT = [
    {category:'Нагрев', icon:'♨', name:'Духовой шкаф', kind:'Запекание и выпечка', use:'Для равномерного сухого нагрева, запекания мяса, овощей, хлеба и десертов.', choose:'Полезны конвекция, точная регулировка температуры и легко очищаемое покрытие.', care:'После остывания удаляйте крошки и жир; не закрывайте вентиляционные отверстия.'},
    {category:'Нагрев', icon:'◉', name:'Варочная панель', kind:'Варка, тушение и быстрый нагрев', use:'Основная поверхность для кастрюль, сотейников и сковород.', choose:'Диаметр конфорок должен соответствовать вашей посуде; для индукции нужна магнитная посуда.', care:'Очищайте после полного остывания мягким средством без абразива.'},
    {category:'Нагрев', icon:'▱', name:'Аэрогриль', kind:'Конвекционное запекание', use:'Готовит небольшие порции горячим воздухом с минимальным количеством масла.', choose:'Ориентируйтесь на полезный объём корзины, диапазон температур и удобство мойки.', care:'Мойте корзину после каждого использования и не перекрывайте циркуляцию воздуха.'},
    {category:'Нагрев', icon:'⌁', name:'Мультиварка', kind:'Тушение, крупы и томление', use:'Поддерживает стабильный нагрев и подходит для блюд длительного приготовления.', choose:'Проверьте объём чаши, ручной режим и возможность отключить автоподогрев.', care:'Не используйте металлические лопатки в чаше с антипригарным покрытием.'},
    {category:'Подготовка', icon:'✦', name:'Погружной блендер', kind:'Пюре, соусы и эмульсии', use:'Измельчает продукты прямо в высокой ёмкости или кастрюле.', choose:'Важны металлическая ножка, удобная кнопка и защита от разбрызгивания.', care:'Отключайте от сети перед снятием насадки; моторный блок не погружайте в воду.'},
    {category:'Подготовка', icon:'◎', name:'Стационарный блендер', kind:'Напитки, супы и измельчение', use:'Подходит для однородных смесей и работы с большим объёмом.', choose:'Учитывайте полезный объём кувшина, мощность и наличие импульсного режима.', care:'Не заполняйте горячей жидкостью выше допустимой отметки и мойте ножевой блок сразу.'},
    {category:'Подготовка', icon:'⋈', name:'Кухонный комбайн', kind:'Нарезка, тёрка и замешивание', use:'Ускоряет повторяющиеся операции при больших объёмах продуктов.', choose:'Выбирайте только нужные насадки, чтобы прибор не занимал место без пользы.', care:'Сушите насадки перед хранением и не перегружайте чашу.'},
    {category:'Подготовка', icon:'⌇', name:'Кухонные весы', kind:'Точные граммовки', use:'Нужны для выпечки, КБЖУ и воспроизводимого результата.', choose:'Удобны функция тары, шаг 1 г и хорошо читаемый дисплей.', care:'Не превышайте максимальную нагрузку и протирайте слегка влажной салфеткой.'},
    {category:'Посуда', icon:'◯', name:'Кастрюля', kind:'Варка и медленное тушение', use:'Для супов, круп, пасты, бульонов и соусов.', choose:'Толстое дно уменьшает риск пригорания; крышка должна сидеть устойчиво.', care:'Не охлаждайте раскалённую посуду ледяной водой, чтобы дно не деформировалось.'},
    {category:'Посуда', icon:'◒', name:'Сотейник', kind:'Тушение и соусы', use:'Высокие борта удобны для блюд с жидкостью и перемешивания.', choose:'Ручка должна быть устойчивой, а дно — достаточно широким для равномерного нагрева.', care:'Подбирайте лопатки под покрытие и не храните готовую еду в посуде надолго.'},
    {category:'Посуда', icon:'⌔', name:'Форма для запекания', kind:'Запеканки и порционная подача', use:'Стеклянные, керамические и металлические формы по-разному проводят тепло.', choose:'Металл быстрее румянит, керамика и стекло дольше удерживают тепло.', care:'Избегайте резкого перепада температур у стекла и керамики.'},
    {category:'Инструменты', icon:'✧', name:'Шеф-нож', kind:'Основная нарезка', use:'Один хорошо заточенный нож закрывает большинство задач подготовки.', choose:'Рукоять должна удобно лежать в руке, а клинок — быть сбалансированным.', care:'Мойте вручную, вытирайте насухо и регулярно правьте режущую кромку.'},
    {category:'Инструменты', icon:'▤', name:'Разделочная доска', kind:'Безопасная подготовка', use:'Желательно разделять доски для сырого мяса, рыбы и готовых продуктов.', choose:'Доска не должна скользить; удобен желоб для жидкости.', care:'Мойте сразу после использования и полностью высушивайте вертикально.'},
    {category:'Инструменты', icon:'⌗', name:'Термометр-щуп', kind:'Контроль готовности', use:'Позволяет проверить температуру внутри мяса, выпечки и других блюд.', choose:'Ищите быстрый отклик, тонкий щуп и понятный дисплей.', care:'Мойте только щуп; электронный корпус не погружайте в воду.'},
    {category:'Инструменты', icon:'⌒', name:'Венчик и лопатка', kind:'Смешивание и работа с тестом', use:'Силиконовая лопатка собирает массу со стенок, венчик объединяет жидкие смеси.', choose:'Термостойкий силикон подходит для горячих продуктов и деликатных покрытий.', care:'Проверяйте, чтобы в местах соединения не скапливалась влага.'}
  ];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const textOf = el => (el?.textContent || '').replace(/\s+/g, ' ').trim();

  let favorites = loadInitialFavorites();
  let favoritesUserId = null;
  let favoritesRemoteReady = false;
  let favoritesDirty = false;
  let favoritesCloudTimer = 0;
  let favoritesLastRefresh = 0;
  let favoritesRealtimeChannel = null;
  let favoritesAuthSubscription = null;
  let favoritesCloudWrite = Promise.resolve();
  let currentRecipeKey = null;
  let equipmentCategory = 'Все';
  let cuisineModels = [];
  let cuisineIndex = 0;
  let carouselTimer = 0;
  let carouselRendering = false;
  let pointerStart = null;

  function safeVibe(value = 10) {
    try {
      if (typeof vibe === 'function') vibe(value);
      else if (navigator.vibrate) navigator.vibrate(typeof value === 'number' ? value : 10);
    } catch (_) {}
  }

  function plural(number, forms) {
    const n = Math.abs(Number(number)) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return forms[2];
    if (n1 > 1 && n1 < 5) return forms[1];
    if (n1 === 1) return forms[0];
    return forms[2];
  }

  function normalizeFavoriteKeys(value) {
    if (!Array.isArray(value)) return [];
    return Array.from(new Set(value.map(String).map(item => item.trim()).filter(Boolean)));
  }

  function favoritesCacheKey(userId = favoritesUserId) {
    return `${FAVORITES_CACHE_PREFIX}${userId || 'guest'}`;
  }

  function readCachedFavorites(userId = favoritesUserId) {
    try {
      const parsed = JSON.parse(localStorage.getItem(favoritesCacheKey(userId)) || '[]');
      return normalizeFavoriteKeys(parsed);
    } catch (_) {
      return [];
    }
  }

  function readLegacyFavorites() {
    try {
      const parsed = JSON.parse(localStorage.getItem(LEGACY_FAVORITES_KEY) || '[]');
      return normalizeFavoriteKeys(parsed);
    } catch (_) {
      return [];
    }
  }

  function readFavoritesFromAppState() {
    try {
      if (typeof state !== 'undefined' && state && Array.isArray(state[FAVORITES_STATE_FIELD])) {
        return normalizeFavoriteKeys(state[FAVORITES_STATE_FIELD]);
      }
    } catch (_) {}
    return null;
  }

  function loadInitialFavorites() {
    const fromState = readFavoritesFromAppState();
    if (fromState) return new Set(fromState);
    const cached = readCachedFavorites(null);
    if (cached.length) return new Set(cached);
    return new Set(readLegacyFavorites());
  }

  function cacheFavorites(userId = favoritesUserId) {
    try {
      localStorage.setItem(favoritesCacheKey(userId), JSON.stringify(Array.from(favorites)));
    } catch (_) {}
  }

  function writeFavoritesToAppState(updatedAt = new Date().toISOString()) {
    try {
      if (typeof state === 'undefined' || !state) return;
      state[FAVORITES_STATE_FIELD] = Array.from(favorites);
      state[FAVORITES_UPDATED_FIELD] = updatedAt;
      if (typeof saveState === 'function') saveState();
    } catch (_) {}
  }

  function refreshFavoritesUi() {
    decorateRecipeCards();
    updateFavoriteCounters();
    if ($('#likedview')?.classList.contains('active')) renderLikedRecipes();
    syncModalHeart();
  }

  function applyFavorites(nextKeys, {cache = true, writeState = true, updatedAt = null} = {}) {
    favorites = new Set(normalizeFavoriteKeys(nextKeys));
    if (cache) cacheFavorites();
    if (writeState) writeFavoritesToAppState(updatedAt || new Date().toISOString());
    refreshFavoritesUi();
  }

  function getCloudClient() {
    try {
      return typeof cloud !== 'undefined' && cloud ? cloud : null;
    } catch (_) {
      return null;
    }
  }

  function getCloudTable() {
    try {
      return typeof CLOUD_TABLE !== 'undefined' && CLOUD_TABLE ? CLOUD_TABLE : 'user_app_state';
    } catch (_) {
      return 'user_app_state';
    }
  }

  function getKnownCloudUser() {
    try {
      return typeof cloudUser !== 'undefined' && cloudUser ? cloudUser : null;
    } catch (_) {
      return null;
    }
  }

  async function resolveCloudUser(client = getCloudClient()) {
    const known = getKnownCloudUser();
    if (known?.id) return known;
    if (!client?.auth) return null;
    try {
      const {data, error} = await client.auth.getSession();
      if (error) throw error;
      return data?.session?.user || null;
    } catch (error) {
      console.warn('Table book: Supabase session unavailable', error);
      return null;
    }
  }

  function remoteFavoritePayload(appState) {
    if (!appState || typeof appState !== 'object') return {present: false, keys: [], updatedAt: null};
    const present = Object.prototype.hasOwnProperty.call(appState, FAVORITES_STATE_FIELD);
    return {
      present,
      keys: normalizeFavoriteKeys(appState[FAVORITES_STATE_FIELD]),
      updatedAt: typeof appState[FAVORITES_UPDATED_FIELD] === 'string' ? appState[FAVORITES_UPDATED_FIELD] : null
    };
  }

  async function persistFavoritesToSupabase(keys = Array.from(favorites)) {
    const client = getCloudClient();
    const user = await resolveCloudUser(client);
    if (!client || !user?.id) return false;

    favoritesUserId = user.id;
    const table = getCloudTable();
    const now = new Date().toISOString();
    const normalized = normalizeFavoriteKeys(keys);
    const {data, error: readError} = await client
      .from(table)
      .select('app_state')
      .eq('user_id', user.id)
      .maybeSingle();
    if (readError) throw readError;

    const appState = Object.assign({}, data?.app_state && typeof data.app_state === 'object' ? data.app_state : {});
    appState[FAVORITES_STATE_FIELD] = normalized;
    appState[FAVORITES_UPDATED_FIELD] = now;

    if (data) {
      const {error} = await client
        .from(table)
        .update({app_state: appState, updated_at: now})
        .eq('user_id', user.id);
      if (error) throw error;
    } else {
      let recipesForInsert = [];
      try {
        if (typeof myRecipes !== 'undefined' && Array.isArray(myRecipes)) recipesForInsert = myRecipes;
      } catch (_) {}
      const {error} = await client
        .from(table)
        .upsert({user_id: user.id, app_state: appState, my_recipes: recipesForInsert, updated_at: now}, {onConflict: 'user_id'});
      if (error) throw error;
    }

    favoritesRemoteReady = true;
    writeFavoritesToAppState(now);
    cacheFavorites(user.id);
    return true;
  }

  function queueFavoritesCloudSave() {
    window.clearTimeout(favoritesCloudTimer);
    const snapshot = Array.from(favorites);
    favoritesCloudTimer = window.setTimeout(() => {
      favoritesCloudWrite = favoritesCloudWrite
        .catch(() => false)
        .then(() => persistFavoritesToSupabase(snapshot))
        .then(saved => {
          if (saved) favoritesDirty = false;
          return saved;
        })
        .catch(error => {
          console.warn('Table book: favorites will stay in offline cache until Supabase is available', error);
          return false;
        });
    }, 180);
  }

  function stopFavoritesRealtime() {
    const client = getCloudClient();
    if (favoritesRealtimeChannel && client?.removeChannel) {
      try { client.removeChannel(favoritesRealtimeChannel); } catch (_) {}
    }
    favoritesRealtimeChannel = null;
  }

  function startFavoritesRealtime(user) {
    const client = getCloudClient();
    if (!client?.channel || !user?.id) return;
    stopFavoritesRealtime();
    const table = getCloudTable();
    favoritesRealtimeChannel = client
      .channel(`table-book-favorites-${user.id}`)
      .on('postgres_changes', {event: 'UPDATE', schema: 'public', table, filter: `user_id=eq.${user.id}`}, payload => {
        if (favoritesDirty) return;
        const remote = remoteFavoritePayload(payload?.new?.app_state);
        if (!remote.present) return;
        favoritesUserId = user.id;
        favoritesRemoteReady = true;
        favoritesDirty = false;
        applyFavorites(remote.keys, {cache: true, writeState: true, updatedAt: remote.updatedAt});
      })
      .subscribe();
  }

  async function syncFavoritesFromSupabase({force = false, migrateLocal = true} = {}) {
    const now = Date.now();
    if (!force && now - favoritesLastRefresh < 2500) return favoritesRemoteReady;
    favoritesLastRefresh = now;

    const client = getCloudClient();
    const user = await resolveCloudUser(client);
    if (!client || !user?.id) {
      favoritesUserId = null;
      favoritesRemoteReady = false;
      stopFavoritesRealtime();
      applyFavorites(readCachedFavorites(null), {cache: false, writeState: false});
      return false;
    }

    const previousUserId = favoritesUserId;
    favoritesUserId = user.id;

    if (favoritesDirty && previousUserId === user.id) {
      window.clearTimeout(favoritesCloudTimer);
      try {
        const saved = await persistFavoritesToSupabase(Array.from(favorites));
        if (saved) favoritesDirty = false;
      } catch (error) {
        console.warn('Table book: pending favorites could not be sent to Supabase yet', error);
        return false;
      }
    } else if (previousUserId !== user.id) {
      favoritesDirty = false;
    }
    if (previousUserId !== user.id) {
      const userCache = readCachedFavorites(user.id);
      if (userCache.length) applyFavorites(userCache, {cache: false, writeState: true});
    }

    const table = getCloudTable();
    try {
      const {data, error} = await client
        .from(table)
        .select('app_state,updated_at')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;

      const remote = remoteFavoritePayload(data?.app_state);
      if (remote.present) {
        favoritesRemoteReady = true;
        favoritesDirty = false;
        applyFavorites(remote.keys, {cache: true, writeState: true, updatedAt: remote.updatedAt || data?.updated_at});
      } else {
        const userCache = readCachedFavorites(user.id);
        const legacy = readLegacyFavorites();
        const localCandidate = userCache.length ? userCache : (favorites.size ? Array.from(favorites) : legacy);
        applyFavorites(localCandidate, {cache: true, writeState: true});
        if (migrateLocal) await persistFavoritesToSupabase(localCandidate);
      }
      startFavoritesRealtime(user);
      return true;
    } catch (error) {
      console.warn('Table book: Supabase favorites sync failed; cached favorites are shown', error);
      const cached = readCachedFavorites(user.id);
      if (cached.length || !favoritesRemoteReady) applyFavorites(cached, {cache: false, writeState: true});
      return false;
    }
  }

  async function installFavoritesSupabaseSync() {
    let client = getCloudClient();
    for (let attempt = 0; !client && attempt < 80; attempt += 1) {
      await new Promise(resolve => window.setTimeout(resolve, 100));
      client = getCloudClient();
    }
    if (!client?.auth) return;

    try {
      const result = client.auth.onAuthStateChange((_event, session) => {
        const user = session?.user || null;
        if (!user) {
          favoritesUserId = null;
          favoritesRemoteReady = false;
          favoritesDirty = false;
          stopFavoritesRealtime();
          applyFavorites(readCachedFavorites(null), {cache: false, writeState: false});
          return;
        }
        favoritesUserId = user.id;
        syncFavoritesFromSupabase({force: true, migrateLocal: true});
      });
      favoritesAuthSubscription = result?.data?.subscription || null;
    } catch (error) {
      console.warn('Table book: Supabase auth observer unavailable', error);
    }

    await syncFavoritesFromSupabase({force: true, migrateLocal: true});
  }

  function recipeKey(id, source = 'base') {
    return `${source || 'base'}:${String(id)}`;
  }

  function keyFromCard(card) {
    if (!card) return null;
    const id = card.dataset.open || card.dataset.id;
    if (id === undefined || id === null || id === '') return null;
    return recipeKey(id, card.dataset.source || 'base');
  }

  function allRecipes() {
    const result = [];
    try {
      if (typeof recipes !== 'undefined' && Array.isArray(recipes)) {
        recipes.forEach(item => result.push({...item, source: item.source || 'base'}));
      }
    } catch (_) {}
    try {
      if (typeof myRecipes !== 'undefined' && Array.isArray(myRecipes)) {
        myRecipes.forEach(item => result.push({...item, source: item.source || 'my'}));
      }
    } catch (_) {}
    return result;
  }

  function findRecipeByKey(key) {
    const split = String(key).indexOf(':');
    if (split < 0) return null;
    const source = key.slice(0, split);
    const id = key.slice(split + 1);
    return allRecipes().find(item => String(item.id) === id && String(item.source || 'base') === source) || null;
  }

  function updateFavoriteCounters() {
    const count = Array.from(favorites).filter(key => findRecipeByKey(key)).length;
    const label = `${count} ${plural(count, ['блюдо', 'блюда', 'блюд'])}`;
    const homeCount = $('#likedRecipesCount');
    const metaCount = $('#likedMetaCount');
    if (homeCount) homeCount.textContent = label;
    if (metaCount) metaCount.textContent = label;
  }

  function setHeartState(heart, key) {
    const active = Boolean(key && favorites.has(key));
    heart.classList.toggle('is-active', active);
    heart.textContent = active ? '♥' : '♡';
    heart.setAttribute('aria-pressed', String(active));
    heart.setAttribute('aria-label', active ? 'Убрать из «Мне нравится»' : 'Добавить в «Мне нравится»');
    const card = heart.closest('.recipe-card');
    if (card) card.classList.toggle('is-favorite', active);
  }

  function toggleFavorite(key, heart) {
    if (!key) return;
    if (favorites.has(key)) favorites.delete(key);
    else favorites.add(key);
    const knownUser = getKnownCloudUser();
    if (!favoritesUserId && knownUser?.id) favoritesUserId = knownUser.id;
    const canSyncWithSupabase = Boolean(favoritesUserId);
    favoritesDirty = canSyncWithSupabase;
    cacheFavorites(canSyncWithSupabase ? favoritesUserId : null);
    if (canSyncWithSupabase) {
      writeFavoritesToAppState();
      queueFavoritesCloudSave();
    }
    safeVibe(favorites.has(key) ? [10, 24, 10] : 8);
    if (heart) {
      setHeartState(heart, key);
      heart.classList.remove('is-burst');
      void heart.offsetWidth;
      heart.classList.add('is-burst');
      setTimeout(() => heart.classList.remove('is-burst'), 380);
    }
    const escapedKey = window.CSS?.escape ? CSS.escape(key) : key.replace(/[\"\\]/g, '\\$&');
    $$(`.favorite-heart[data-favorite-key="${escapedKey}"]`).forEach(item => setHeartState(item, key));
    updateFavoriteCounters();
    if ($('#likedview')?.classList.contains('active')) renderLikedRecipes();
  }

  function createHeart(key, extraClass = '') {
    const heart = document.createElement(extraClass.includes('modal') ? 'button' : 'span');
    if (heart.tagName === 'BUTTON') heart.type = 'button';
    heart.className = `favorite-heart ${extraClass}`.trim();
    heart.dataset.favoriteKey = key;
    heart.setAttribute('role', 'button');
    heart.tabIndex = 0;
    setHeartState(heart, key);
    const activate = event => {
      event.preventDefault();
      event.stopPropagation();
      if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
      toggleFavorite(key, heart);
    };
    heart.addEventListener('click', activate);
    heart.addEventListener('keydown', activate);
    return heart;
  }

  function decorateRecipeCard(card) {
    if (!(card instanceof Element) || !card.matches('.recipe-card')) return;
    const key = keyFromCard(card);
    if (!key) return;
    let heart = $('.favorite-heart', card);
    if (!heart) {
      heart = createHeart(key);
      card.appendChild(heart);
    } else {
      heart.dataset.favoriteKey = key;
      setHeartState(heart, key);
    }
  }

  function decorateRecipeCards(root = document) {
    $$('.recipe-card', root).forEach(decorateRecipeCard);
  }

  function syncModalHeart() {
    const modal = $('#modal');
    if (!modal || !currentRecipeKey) return;
    const title = $('.dialog-title', modal);
    const close = $('#closeModal', modal);
    if (!title || !close) return;
    let heart = $('.modal-favorite-heart', title);
    if (heart?.dataset.favoriteKey === currentRecipeKey) {
      setHeartState(heart, currentRecipeKey);
      return;
    }
    if (heart) heart.remove();
    heart = createHeart(currentRecipeKey, 'modal-favorite-heart');
    title.insertBefore(heart, close);
  }

  function openStoredRecipe(id, source = 'base') {
    currentRecipeKey = recipeKey(id, source);
    try {
      if (typeof openRecipe === 'function') openRecipe(String(id), source);
    } catch (error) {
      console.warn('Table book: recipe opening failed', error);
    }
    setTimeout(syncModalHeart, 0);
  }

  function recipeCardForLiked(item) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'recipe-card';
    card.dataset.open = item.id;
    card.dataset.source = item.source || 'base';
    const origin = item.country || item.origin || '';
    const time = item.time || '—';
    const servings = item.servings || 1;
    const difficulty = item.difficulty || 'легко';
    card.innerHTML = `${item.healthy ? '<span class="recipe-badge">Полезный</span>' : ''}<h3>${escapeHtml(item.title || 'Без названия')}</h3>${origin ? `<div class="recipe-origin">${escapeHtml(origin)}</div>` : ''}<div class="recipe-meta"><span>${escapeHtml(time)}</span><span>${escapeHtml(servings)} порц.</span><span>${escapeHtml(difficulty)}</span></div>`;
    card.addEventListener('click', event => {
      if (event.target.closest('.favorite-heart')) return;
      openStoredRecipe(item.id, item.source || 'base');
    });
    decorateRecipeCard(card);
    return card;
  }

  function renderLikedRecipes() {
    const list = $('#likedRecipesList');
    const empty = $('#likedEmpty');
    if (!list || !empty) return;
    const found = Array.from(favorites).map(findRecipeByKey).filter(Boolean);
    list.innerHTML = '';
    found.forEach(item => list.appendChild(recipeCardForLiked(item)));
    empty.hidden = found.length > 0;
    updateFavoriteCounters();
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  }

  function showCustomView(id) {
    const target = document.getElementById(id);
    if (!target) return;
    $$('.view').forEach(view => {
      view.classList.remove('active', 'anim-in', 'page-enter', 'page-leave');
      view.style.display = '';
    });
    target.classList.add('active', 'anim-in');
    try {
      if (typeof state !== 'undefined' && state) state.route = id;
      if (typeof saveState === 'function') saveState();
    } catch (_) {}
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  function goHome() {
    showCustomView('home');
    installCarousel(false);
  }

  function ensureCustomViews() {
    const main = $('main.page') || $('main');
    if (!main) return;

    if (!$('#likedview')) {
      const section = document.createElement('section');
      section.id = 'likedview';
      section.className = 'view';
      section.innerHTML = '<section class="custom-head"><div><button class="back-btn" id="likedBackBtn" type="button">← Назад</button><h1>Мне нравится</h1><p>Здесь собраны блюда, отмеченные сердечком.</p></div><div class="country-meta"><span class="pill" id="likedMetaCount">0 блюд</span></div></section><div id="likedRecipesList" class="recipe-grid liked-recipes-grid"></div><div id="likedEmpty" class="empty-box" hidden>Пока нет сохранённых блюд. Нажмите сердечко на карточке или в открытом рецепте.</div>';
      main.appendChild(section);
    }

    if (!$('#equipmentview')) {
      const section = document.createElement('section');
      section.id = 'equipmentview';
      section.className = 'view';
      section.innerHTML = '<section class="custom-head"><div><button class="back-btn" id="equipmentBackBtn" type="button">← Назад</button><h1>Энциклопедия оборудования</h1><p>Кухонная техника, посуда и инструменты: назначение, выбор и уход.</p></div></section><div class="equipment-filters" id="equipmentFilters"></div><div class="equipment-grid" id="equipmentGrid"></div>';
      main.appendChild(section);
    }
  }

  function findButtonByText(root, text) {
    return $$('button, [role="button"]', root).find(button => textOf(button).toLowerCase().includes(text.toLowerCase())) || null;
  }

  function makeHomeCard(id, title, description, small, icon, className) {
    const button = document.createElement('button');
    button.id = id;
    button.type = 'button';
    button.className = `tab-card ${className}`;
    button.innerHTML = `<div class="tab-icon" aria-hidden="true">${icon}</div><div class="home-card-copy"><b>${title}</b><span>${description}</span><small>${small}</small></div>`;
    return button;
  }

  function normalizeHomeLayout() {
    const home = $('#home');
    const hero = $('.hero', home);
    if (!home || !hero) return;

    const stats = $('.stats', home);
    if (stats) {
      stats.hidden = true;
      stats.classList.add('stats-hidden');
    }

    let planner = $('.home-planner-row', home);
    if (!planner) {
      planner = document.createElement('div');
      planner.className = 'home-planner-row';
    }

    const myCard = $('#myRecipesCard', home) || findButtonByText(home, 'Мои рецепты');
    const menuCard = $('#homeMealCalendarCard', home) || findButtonByText(home, 'Меню недели') || findButtonByText(home, 'Меню на неделю');
    if (myCard) planner.appendChild(myCard);
    if (menuCard) planner.appendChild(menuCard);
    hero.insertAdjacentElement('afterend', planner);

    let tools = $('#homeToolsRow', home) || $('.home-tools-row', home);
    if (!tools) {
      tools = document.createElement('div');
      tools.id = 'homeToolsRow';
      tools.className = 'home-tools-row';
    }

    let likedCard = $('#likedRecipesCard', home) || findButtonByText(home, 'Мне нравится');
    if (!likedCard) {
      likedCard = makeHomeCard('likedRecipesCard', 'Мне нравится', 'Сохранённые любимые блюда', '<span id="likedRecipesCount">0 блюд</span>', '♡', 'home-liked-card');
    } else if (!$('#likedRecipesCount', likedCard)) {
      const small = $('small', likedCard) || document.createElement('small');
      small.id = 'likedRecipesCount';
      if (!small.parentElement) likedCard.appendChild(small);
    }

    let equipmentCard = $('#equipmentCard', home) || findButtonByText(home, 'Оборудование');
    if (!equipmentCard) {
      equipmentCard = makeHomeCard('equipmentCard', 'Оборудование', 'Энциклопедия кухонной техники и инвентаря', 'Открыть справочник', '⌁', 'home-equipment-card');
    }

    tools.append(likedCard, equipmentCard);
    planner.insertAdjacentElement('afterend', tools);

    let title = $$('.section-title', home).find(section => /кухн/i.test(textOf($('h2', section)))) || $('.cuisine-title', home);
    if (!title) {
      title = document.createElement('div');
      title.className = 'section-title cuisine-title';
      title.innerHTML = '<div><h2>Кухни</h2><p>Рецепты со всего мира.</p></div>';
    }
    title.classList.add('cuisine-title');
    const h2 = $('h2', title);
    const p = $('p', title);
    if (h2) h2.textContent = 'Кухни';
    if (p) p.textContent = 'Рецепты со всего мира.';
    tools.insertAdjacentElement('afterend', title);

    const grid = $('#countryGrid', home);
    if (!grid) return;
    let shell = $('#cuisineCarouselShell', home) || grid.closest('.cuisine-carousel-shell');
    if (!shell) {
      shell = document.createElement('div');
      shell.id = 'cuisineCarouselShell';
      shell.className = 'cuisine-carousel-shell';
      title.insertAdjacentElement('afterend', shell);
      shell.appendChild(grid);
    } else {
      title.insertAdjacentElement('afterend', shell);
    }
    shell.setAttribute('aria-label', 'Карусель кухонь');
    grid.classList.add('cuisine-carousel');

    let prev = $('#cuisinePrev', shell);
    if (!prev) {
      prev = document.createElement('button');
      prev.id = 'cuisinePrev';
      prev.type = 'button';
      prev.className = 'cuisine-carousel-arrow cuisine-carousel-prev';
      prev.setAttribute('aria-label', 'Предыдущая кухня');
      prev.textContent = '‹';
    }
    let next = $('#cuisineNext', shell);
    if (!next) {
      next = document.createElement('button');
      next.id = 'cuisineNext';
      next.type = 'button';
      next.className = 'cuisine-carousel-arrow cuisine-carousel-next';
      next.setAttribute('aria-label', 'Следующая кухня');
      next.textContent = '›';
    }
    if (prev.parentElement !== shell) shell.insertBefore(prev, grid);
    if (grid.parentElement !== shell) shell.appendChild(grid);
    if (next.parentElement !== shell) shell.appendChild(next);
  }

  function getCuisineNames() {
    try {
      if (typeof uniqueCountries === 'function') {
        const value = uniqueCountries();
        if (Array.isArray(value)) return value.map(String);
      }
    } catch (_) {}
    try {
      if (typeof recipes !== 'undefined' && Array.isArray(recipes)) {
        return Array.from(new Set(recipes.map(item => item.country).filter(Boolean))).map(String);
      }
    } catch (_) {}
    return [];
  }

  function createCuisineCard(name) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'country-card';
    button.dataset.country = name;
    let note = 'Открыть блюда этой кухни';
    let background = '';
    try {
      if (typeof theme === 'function') {
        const info = theme(name) || {};
        note = info.note || note;
        background = info.bg || '';
      }
    } catch (_) {}
    if (background) button.style.setProperty('--country-bg', background);
    let visual = '<span aria-hidden="true">✦</span>';
    try {
      if (typeof countryFlagSvg === 'function' && typeof countryIconKey === 'function') visual = countryFlagSvg(countryIconKey(name));
    } catch (_) {}
    let count = '';
    try {
      if (typeof recipes !== 'undefined' && Array.isArray(recipes)) {
        const list = recipes.filter(item => item.country === name);
        count = `${list.length} ${plural(list.length, ['рецепт', 'рецепта', 'рецептов'])}`;
      }
    } catch (_) {}
    button.innerHTML = `<div class="country-main"><div class="cemoji">${visual}</div><div class="country-copy"><h3>${escapeHtml(name)}</h3><p>${escapeHtml(note)}</p></div></div><div class="country-bottom"><span>${escapeHtml(count)}</span><span class="arrow">›</span></div>`;
    return button;
  }

  function collectCuisineModels(grid) {
    const models = [];
    const seen = new Set();
    $$('.country-card', grid).forEach(card => {
      if (card.dataset.tbCarouselCopy === '1') return;
      const name = card.dataset.country || textOf($('h3', card));
      if (!name || seen.has(name)) return;
      seen.add(name);
      const clone = card.cloneNode(true);
      clone.removeAttribute('id');
      clone.removeAttribute('onclick');
      models.push({name, node: clone});
    });
    getCuisineNames().forEach(name => {
      if (seen.has(name)) return;
      seen.add(name);
      models.push({name, node: createCuisineCard(name)});
    });
    return models;
  }

  function visibleCuisineCount() {
    if (window.matchMedia('(max-width: 700px)').matches) return 1;
    if (window.matchMedia('(max-width: 980px)').matches) return 3;
    return 5;
  }

  function openCuisine(name) {
    stopCarouselAutoplay();
    safeVibe(12);
    let opened = false;
    try {
      if (typeof showCountry === 'function') {
        showCountry(name);
        opened = true;
      }
    } catch (error) {
      console.warn('Table book: cuisine opening failed', error);
    }
    if (!opened) {
      try {
        if (typeof renderCountry === 'function') {
          renderCountry(name);
          opened = true;
        }
      } catch (_) {}
    }
    setTimeout(() => {
      const view = $('#country');
      if (view && !view.classList.contains('active')) showCustomView('country');
      decorateRecipeCards(view || document);
    }, 20);
  }

  function renderCarousel() {
    const grid = $('#countryGrid');
    if (!grid || cuisineModels.length === 0) return;
    const count = visibleCuisineCount();
    const half = Math.floor(count / 2);
    carouselRendering = true;
    grid.innerHTML = '';
    for (let offset = -half; offset <= half; offset += 1) {
      const modelIndex = (cuisineIndex + offset + cuisineModels.length) % cuisineModels.length;
      const model = cuisineModels[modelIndex];
      const card = model.node.cloneNode(true);
      card.dataset.tbCarouselCopy = '1';
      card.dataset.country = model.name;
      card.classList.toggle('tb-carousel-center', offset === 0);
      card.classList.toggle('tb-carousel-near', Math.abs(offset) === 1);
      card.classList.toggle('tb-carousel-far', Math.abs(offset) > 1);
      card.setAttribute('aria-label', `Открыть кухню: ${model.name}`);
      card.addEventListener('click', event => {
        event.preventDefault();
        openCuisine(model.name);
      });
      grid.appendChild(card);
    }
    grid.dataset.tbCarouselReady = '1';
    requestAnimationFrame(() => { carouselRendering = false; });
  }

  function moveCarousel(direction) {
    if (cuisineModels.length < 2) return;
    cuisineIndex = (cuisineIndex + direction + cuisineModels.length) % cuisineModels.length;
    safeVibe(7);
    renderCarousel();
    restartCarouselAutoplay();
  }

  function stopCarouselAutoplay() {
    if (carouselTimer) window.clearInterval(carouselTimer);
    carouselTimer = 0;
  }

  function startCarouselAutoplay() {
    stopCarouselAutoplay();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || cuisineModels.length < 2) return;
    carouselTimer = window.setInterval(() => {
      if (document.hidden || !$('#home')?.classList.contains('active')) return;
      cuisineIndex = (cuisineIndex + 1) % cuisineModels.length;
      renderCarousel();
    }, 5200);
  }

  function restartCarouselAutoplay() {
    startCarouselAutoplay();
  }

  function bindCarouselControls() {
    const prev = $('#cuisinePrev');
    const next = $('#cuisineNext');
    const grid = $('#countryGrid');
    const shell = $('#cuisineCarouselShell');
    if (!grid || !shell) return;

    if (prev && prev.dataset.bound !== '1') {
      prev.dataset.bound = '1';
      prev.addEventListener('click', event => { event.preventDefault(); moveCarousel(-1); });
    }
    if (next && next.dataset.bound !== '1') {
      next.dataset.bound = '1';
      next.addEventListener('click', event => { event.preventDefault(); moveCarousel(1); });
    }
    if (grid.dataset.pointerBound !== '1') {
      grid.dataset.pointerBound = '1';
      grid.addEventListener('pointerdown', event => {
        pointerStart = {x: event.clientX, y: event.clientY, time: Date.now()};
      });
      grid.addEventListener('pointerup', event => {
        if (!pointerStart) return;
        const dx = event.clientX - pointerStart.x;
        const dy = event.clientY - pointerStart.y;
        const elapsed = Date.now() - pointerStart.time;
        pointerStart = null;
        if (Math.abs(dx) > 34 && Math.abs(dx) > Math.abs(dy) && elapsed < 900) moveCarousel(dx < 0 ? 1 : -1);
      });
      grid.addEventListener('pointercancel', () => { pointerStart = null; });
      grid.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') { event.preventDefault(); moveCarousel(-1); }
        if (event.key === 'ArrowRight') { event.preventDefault(); moveCarousel(1); }
      });
    }
    if (shell.dataset.hoverBound !== '1') {
      shell.dataset.hoverBound = '1';
      shell.addEventListener('mouseenter', stopCarouselAutoplay);
      shell.addEventListener('mouseleave', startCarouselAutoplay);
      shell.addEventListener('focusin', stopCarouselAutoplay);
      shell.addEventListener('focusout', startCarouselAutoplay);
    }
  }

  function installCarousel(refreshModels = true) {
    normalizeHomeLayout();
    const grid = $('#countryGrid');
    if (!grid) return;
    if (refreshModels) {
      const nextModels = collectCuisineModels(grid);
      if (nextModels.length) cuisineModels = nextModels;
    }
    if (!cuisineModels.length) cuisineModels = collectCuisineModels(grid);
    cuisineIndex = Math.min(cuisineIndex, Math.max(0, cuisineModels.length - 1));
    renderCarousel();
    bindCarouselControls();
    startCarouselAutoplay();
  }

  function wrapCountryRenderer() {
    try {
      if (typeof renderCountries === 'function' && !renderCountries.__tableBookHotfix) {
        const original = renderCountries;
        const wrapped = function(...args) {
          const result = original.apply(this, args);
          setTimeout(() => installCarousel(true), 0);
          return result;
        };
        wrapped.__tableBookHotfix = true;
        renderCountries = wrapped;
        try { window.renderCountries = wrapped; } catch (_) {}
      }
    } catch (_) {}
  }

  function wrapBackNavigation() {
    try {
      if (typeof goHomeWithFlip === 'function' && !goHomeWithFlip.__tableBookHotfix) {
        const original = goHomeWithFlip;
        const wrapped = function(...args) {
          const active = $('.view.active');
          if (active?.id === 'likedview' || active?.id === 'equipmentview') return goHome();
          return original.apply(this, args);
        };
        wrapped.__tableBookHotfix = true;
        goHomeWithFlip = wrapped;
        try { window.goHomeWithFlip = wrapped; } catch (_) {}
      }
    } catch (_) {}
  }

  function renderEquipmentFilters() {
    const wrap = $('#equipmentFilters');
    if (!wrap) return;
    const categories = ['Все', ...Array.from(new Set(EQUIPMENT.map(item => item.category)))];
    wrap.innerHTML = '';
    categories.forEach(category => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `equipment-filter${category === equipmentCategory ? ' active' : ''}`;
      button.textContent = category;
      button.addEventListener('click', () => {
        equipmentCategory = category;
        safeVibe(7);
        renderEquipment();
      });
      wrap.appendChild(button);
    });
  }

  function renderEquipment() {
    renderEquipmentFilters();
    const grid = $('#equipmentGrid');
    if (!grid) return;
    const items = equipmentCategory === 'Все' ? EQUIPMENT : EQUIPMENT.filter(item => item.category === equipmentCategory);
    grid.innerHTML = items.map(item => `<details class="equipment-card"><summary><span class="equipment-card-icon" aria-hidden="true">${item.icon}</span><span><h3>${escapeHtml(item.name)}</h3><small>${escapeHtml(item.kind)}</small></span></summary><div class="equipment-card-body"><p><b>Для чего:</b> ${escapeHtml(item.use)}</p><p><b>Как выбрать:</b> ${escapeHtml(item.choose)}</p><p><b>Уход:</b> ${escapeHtml(item.care)}</p></div></details>`).join('');
  }

  function openEquipment() {
    ensureCustomViews();
    renderEquipment();
    showCustomView('equipmentview');
    safeVibe(12);
  }

  function openLiked() {
    ensureCustomViews();
    renderLikedRecipes();
    showCustomView('likedview');
    syncFavoritesFromSupabase({force: true, migrateLocal: true});
    safeVibe(12);
  }

  function bindCustomNavigation() {
    const liked = $('#likedRecipesCard');
    const equipment = $('#equipmentCard');
    const likedBack = $('#likedBackBtn');
    const equipmentBack = $('#equipmentBackBtn');
    if (liked && liked.dataset.bound !== '1') {
      liked.dataset.bound = '1';
      liked.addEventListener('click', openLiked);
    }
    if (equipment && equipment.dataset.bound !== '1') {
      equipment.dataset.bound = '1';
      equipment.addEventListener('click', openEquipment);
    }
    if (likedBack && likedBack.dataset.bound !== '1') {
      likedBack.dataset.bound = '1';
      likedBack.addEventListener('click', goHome);
    }
    if (equipmentBack && equipmentBack.dataset.bound !== '1') {
      equipmentBack.dataset.bound = '1';
      equipmentBack.addEventListener('click', goHome);
    }
  }

  function observeDynamicContent() {
    const bodyObserver = new MutationObserver(records => {
      let needsCards = false;
      let modalChanged = false;
      records.forEach(record => record.addedNodes.forEach(node => {
        if (!(node instanceof Element)) return;
        if (node.matches('.recipe-card') || node.querySelector('.recipe-card')) needsCards = true;
        if (node.id === 'modal' || node.closest?.('#modal') || node.querySelector?.('#modal')) modalChanged = true;
      }));
      if (needsCards) decorateRecipeCards();
      if (modalChanged || $('#modal')?.classList.contains('open') || $('#modal')?.classList.contains('active')) syncModalHeart();
    });
    bodyObserver.observe(document.body, {childList: true, subtree: true});

    const grid = $('#countryGrid');
    if (grid) {
      const gridObserver = new MutationObserver(() => {
        if (carouselRendering) return;
        const children = Array.from(grid.children);
        if (!children.length) return;
        const isOurRender = children.every(child => child.dataset?.tbCarouselCopy === '1');
        if (!isOurRender) setTimeout(() => installCarousel(true), 0);
      });
      gridObserver.observe(grid, {childList: true});
    }
  }

  function globalCaptureHandler(event) {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const card = target.closest('[data-open]');
    if (card && !target.closest('.favorite-heart')) {
      currentRecipeKey = keyFromCard(card);
      setTimeout(syncModalHeart, 0);
    }

    const button = target.closest('button,[role="button"]');
    if (!button) return;
    const label = textOf(button).toLowerCase();
    const activeView = $('.view.active')?.id;

    if (button.id === 'homeBrand' && (activeView === 'likedview' || activeView === 'equipmentview')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      goHome();
      return;
    }

    if (label.includes('оборудование') && !button.closest('#equipmentview')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openEquipment();
      return;
    }

    if (label.includes('мне нравится') && !button.closest('#likedview')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openLiked();
    }
  }

  function init() {
    ensureCustomViews();
    normalizeHomeLayout();
    wrapCountryRenderer();
    wrapBackNavigation();
    bindCustomNavigation();
    installCarousel(true);
    decorateRecipeCards();
    updateFavoriteCounters();
    renderEquipment();
    observeDynamicContent();

    document.addEventListener('click', globalCaptureHandler, true);
    window.addEventListener('storage', event => {
      const activeKey = favoritesCacheKey();
      if (event.key !== activeKey && event.key !== LEGACY_FAVORITES_KEY) return;
      const next = event.key === LEGACY_FAVORITES_KEY ? readLegacyFavorites() : readCachedFavorites();
      applyFavorites(next, {cache: false, writeState: Boolean(favoritesUserId)});
    });

    window.addEventListener('online', () => {
      if (favoritesUserId) {
        queueFavoritesCloudSave();
        syncFavoritesFromSupabase({force: true, migrateLocal: true});
      }
    });
    window.addEventListener('focus', () => {
      if (favoritesUserId) syncFavoritesFromSupabase({force: false, migrateLocal: false});
    });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && favoritesUserId) syncFavoritesFromSupabase({force: false, migrateLocal: false});
    });

    installFavoritesSupabaseSync();

    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(renderCarousel, 120);
    });

    try {
      if (typeof state !== 'undefined' && state?.route === 'likedview') openLiked();
      if (typeof state !== 'undefined' && state?.route === 'equipmentview') openEquipment();
    } catch (_) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
  else init();
})();
