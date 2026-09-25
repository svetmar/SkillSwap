# SkillSwap

Платформа обмена навыками.

---

## Быстрый старт

```bash
npm install
npm run dev
```

Открой [http://localhost:5173](http://localhost:5173)

---

## State management

Проект использует **Redux Toolkit**. Store настроен в `src/store/index.ts`.

Для работы со store используй типизированные хуки из `src/store/hooks.ts` — `useAppDispatch` и `useAppSelector` вместо оригинальных из react-redux.

---

## Структура проекта

```
src/
├── api/                  # fetch-функции для загрузки JSON-моков
├── app/
│   ├── providers/        # StoreProvider, RouterProvider
│   └── styles/           # global.css с CSS-переменными
├── entities/             # Доменные модели: Skill, User, Request
│   ├── skill/
│   ├── user/
│   └── request/
├── features/             # Фичи: auth, skills, favorites, requests
├── pages/                # Страницы приложения
├── shared/
│   ├── hooks/            # useDebounce, useLocalStorage
│   ├── lib/              # constants, helpers
│   ├── types/            # общие TypeScript-типы
│   └── ui/               # атомарные компоненты
├── store/                # Redux store и типизированные хуки
└── widgets/              # Составные блоки: Header, SkillCard, FiltersBar

public/
└── db/                   # Мок-база: см. public/db/README.md
    ├── users.json        # 50 пользователей
    ├── userSkills.json   # 148 навыков (teach / learn)
    ├── categories.json   # Справочник категорий и подкатегорий
    ├── requests.json     # 30 заявок на обмен
    ├── cities.json       # 22 города
    └── images/           # Фото пользователей и SVG-обложки навыков
```

---

## Моки данных

Бэкенда нет — данные лежат статическими JSON в `public/db`. Что в каком файле, кто его читает,
куда приложение пишет и какие инварианты нельзя ломать — в [`public/db/README.md`](public/db/README.md).

Типы объектов описаны в `src/shared/types/index.ts`.

Запросы идут через `src/api/*`; базовый путь подставляет `assetUrl()` из
`src/shared/lib/helpers.ts` — из-за `base: '/SkillSwap/'` обращаться к `/db/...` напрямую нельзя.

### Демо-вход

Email любого пользователя из `users.json`, пароль у всех — `Demo1234!`.
Самый наполненный аккаунт: `maria88@mail.ru` (заявки во всех статусах, уведомления, два навыка).

---

## Доступные скрипты

| Скрипт | Что делает |
|--------|------------|
| `npm run dev` | Запуск dev-сервера |
| `npm run build` | Сборка для продакшена |
| `npm run lint` | Проверка ESLint + Stylelint |
| `npm run lint:fix` | Автоисправление lint-ошибок |
| `npm run format` | Форматирование через Prettier |
| `npm run test` | Запуск тестов |
| `npm run test:watch` | Тесты в watch-режиме |
| `npm run test:coverage` | Покрытие (цель ≥ 70%) |

---

## Роутинг

Маршруты объявлены в `src/shared/lib/constants.ts` → `ROUTES`.

Lazy-загрузка уже настроена в `src/app/providers/RouterProvider.tsx`, защищённые маршруты
обёрнуты в `PrivateRoute` из `src/app/providers/PrivateRoute.tsx`.

`BrowserRouter` получает `basename={import.meta.env.BASE_URL}` — приложение живёт по адресу
`/SkillSwap/`, а не в корне домена.

Ещё не подключены к роутеру: `/requests`, `/exchanges`, `/my-skills` (ссылки есть в
`ProfileSidebar`) и страницы `RegistrationStep1-3Page`.

---

## Переменные окружения

Создай `.env.local` для локальных настроек (в `.gitignore` уже исключён):

```
VITE_APP_TITLE=SkillSwap
```

Доступ в коде: `import.meta.env.VITE_APP_TITLE`

---

## Git-процесс

```
main        ← только стабильный код, не трогаем напрямую
└── develop ← основная ветка разработки, PR только сюда
    └── feature/catalog-filters   ← твоя задача
        └── → PR → code review → merge в develop
```

Перед началом каждой задачи:
```bash
git checkout develop
git pull
git checkout -b feature/название-задачи
```

После завершения:
```bash
git push -u origin feature/название-задачи
# открываешь PR из своей ветки → в develop
```

Ветки называй: `feature/`, `fix/`, `refactor/`, `docs/`, `chore/`

Коммиты по [Conventional Commits](https://www.conventionalcommits.org/ru/):
```
feat: добавить фильтр по категориям
fix: исправить отображение карточки на мобильном
refactor: вынести логику избранного в хук
```

PR — не больше ~200 строк изменений. Вливает только тимлид или его заместитель. `--force` и `merge --no-ff` в `develop` запрещены.

---

## Деплой на GitHub Pages

`.github/workflows/deploy.yml` собирает проект на каждый push в `develop` и публикует `dist/`.
В настройках репозитория **Settings → Pages → Source** должен быть выбран `GitHub Actions`.

Сайт живёт не в корне домена, а по адресу `https://<owner>.github.io/SkillSwap/`, поэтому:

- `base: '/SkillSwap/'` в `vite.config.ts` должен совпадать с именем репозитория (регистр важен);
- `BrowserRouter` получает `basename={import.meta.env.BASE_URL}`;
- пути к мокам и картинкам проходят через `assetUrl()`.

Pages не умеет SPA-фолбэк и на путь без файла отдаёт `404.html`, поэтому сборка кладёт туда
копию `index.html` (плагин `spa-404-fallback` в `vite.config.ts`). Без этого прямой заход на
`/skill/:id` или F5 на любой внутренней странице вернули бы ошибку вместо приложения.
Статус ответа при этом остаётся `404` — это особенность Pages, на работу приложения не влияет.

---

## CI

GitHub Actions запускается на каждый push и PR:
- `npm run lint`
- `tsc --noEmit`
- `npm run test`
- `npm run build`

Если CI красный — PR не мержится.

