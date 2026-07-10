# Table book

Статическое веб-приложение книги рецептов для GitHub Pages.

## Структура

```text
cookbook_webapp/
├─ index.html              # разметка приложения
├─ css/style.css           # весь дизайн и адаптивная вёрстка
├─ js/app.js               # логика, рецепты, календарь, Supabase, таймеры и свайпы
├─ assets/icons/           # favicon и иконки PWA
├─ assets/countries/       # оптимизированные WebP-картинки стран
├─ site.webmanifest        # манифест для установки на главный экран
├─ supabase_setup.sql      # SQL для таблицы синхронизации
└─ .nojekyll               # корректная отдача статических файлов на GitHub Pages
```

## Публикация

Загрузите содержимое папки `cookbook_webapp` в репозиторий GitHub Pages.

Supabase продолжает использовать таблицу `user_app_state`; отдельная таблица для календаря не нужна. Меню хранится в `app_state.mealPlan`, а личные рецепты — в `my_recipes`.
