# public/db — мок-база данных

Бэкенда у проекта нет. Всё, что приложение «читает с сервера», лежит здесь статическими
JSON-файлами: Vite отдаёт папку `public` как есть, поэтому файлы доступны по адресу
`<base>/db/*.json`, где `<base>` — значение `base` из `vite.config.ts` (сейчас `/SkillSwap/`).

Все запросы идут через слой `src/api/*`, который подставляет базовый путь через
`assetUrl()` из `src/shared/lib/helpers.ts`. **Не обращайтесь к `/db/...` напрямую из
компонентов** — на GitHub Pages такой путь даст 404.

## Файлы

### `users.json` — 50 пользователей

Аккаунты каталога и демо-аккаунты для входа.

| Поле | Тип | Замечания |
|------|-----|-----------|
| `id` | `string` | `user_001` … `user_050` |
| `name` | `string` | Только имя, без фамилии — так же выводится в карточках |
| `email` | `string` | Логин |
| `password` | `string` | У всех демо-аккаунтов `Demo1234!` |
| `avatarUrl` | `string \| null` | Путь от корня; `null` у 15 пользователей — `Avatar` рисует цветную заглушку |
| `createdAt` | `string` | ISO, дата регистрации; навыки пользователя всегда созданы позже неё |
| `city` | `string` | Только города из `cities.json` |
| `age` | `number` | Согласован с `birthDate` на 20.09.2026 |
| `birthDate` | `string` | `YYYY-MM-DD`, подставляется в профиль при входе |
| `gender` | `'male' \| 'female'` | Совпадает с фотографией на аватаре |
| `about` | `string` | Текст «о себе», связан с навыками пользователя |
| `likes` | `number` | 31–120, определяет порядок секции «Популярное» |

Читают: `src/api/users.ts` → `usersSlice.fetchUsersThunk` (диспатчится в `MainLayout`),
`LoginPage` (поиск демо-аккаунта по email), `SkillPage`.

### `userSkills.json` — 148 навыков

Собственно объявления: что человек готов преподать и чему хочет научиться.

| Поле | Тип | Замечания |
|------|-----|-----------|
| `id` | `string` | `skill_001` … `skill_148` |
| `title` | `string` | Короткое название объявления, попадает в чип карточки |
| `description` | `string` | Уникальный текст от первого лица; тон зависит от `type` |
| `type` | `'teach' \| 'learn'` | 61 `teach` и 87 `learn` |
| `category` | `string` | id категории из `categories.json` |
| `subcategory` | `string` | id подкатегории, обязательно принадлежит своей категории |
| `tags` | `string` | Человекочитаемая метка категории |
| `imageUrl` | `string \| null` | Обложка из `images/skills/` |
| `photos` | `string[]` | Галерея на странице навыка: 3 изображения у `teach`, 2 у `learn` |
| `authorId` | `string` | Ссылка на `users.json` |
| `createdAt` | `string` | ISO, определяет порядок секции «Новое» |

Покрыты все 42 подкатегории, у каждого пользователя есть минимум один `teach`-навык —
иначе он не попал бы в каталог.

Читают: `src/api/userSkills.ts` → `skillsSlice.fetchSkillsThunk` (`MainLayout`), `CatalogPage`,
`FavoritesPage`, `SkillPage`.

### `categories.json` — справочник категорий

Шесть категорий и 42 подкатегории. Читает `src/api/categories.ts` → `RegisterPage` и страницы
пошаговой регистрации.

⚠️ Тот же справочник продублирован в коде: `src/shared/lib/skillCategories.ts` (типизированная
константа для фильтров, шапки и страницы навыка). При изменении правьте **оба** файла — id
подкатегорий в `userSkills.json` завязаны на них.

### `requests.json` — 30 заявок на обмен

| Поле | Тип | Замечания |
|------|-----|-----------|
| `id` | `string` | `req-001` … `req-030` |
| `skillId` | `string` | Всегда `teach`-навык получателя |
| `fromUserId` / `toUserId` | `string` | Ссылки на `users.json` |
| `fromUserName` / `toUserName` / `skillTitle` | `string` | Денормализация — уведомления строятся без join |
| `status` | `'pending' \| 'accepted' \| 'rejected' \| 'inProgress' \| 'done'` | 12 / 8 / 3 / 4 / 3 |
| `createdAt` / `updatedAt` | `string` | ISO, лето–сентябрь 2026 |
| `notificationIsRead` | `boolean` | Разделяет «Новые» и «Просмотренные» в шторке уведомлений |

Уведомления строятся только из заявок со статусом `pending` (получателю) и `accepted`
(отправителю) — см. `requestsSlice`.

Читают: `src/api/requests.ts` → `requestsSlice.fetchRequestsThunk` (`widgets/Header`,
`NotificationsDropdown`).

### `cities.json` — 22 города

Справочник для автокомплита города в профиле и регистрации. Все значения `city` в
`users.json` взяты отсюда. Читает `src/api/cities.ts`.

### `images/users/` — 35 фотографий

Уникальные, без дублей. Ссылки хранятся в `users.json`; свободных файлов нет, поэтому новому
пользователю ставьте `avatarUrl: null`.

### `images/skills/` — 48 SVG-обложек

Генерируемые обложки: по одной на каждую из 42 подкатегорий (`<категория>-<подкатегория>.svg`)
и по одной на каждую из 6 категорий (`<категория>.svg`). Векторные, работают офлайн и в тёмной
теме, весят ~4 КБ каждая.

## Куда приложение пишет

На диск — никуда, `saveRequest()` в `src/api/requests.ts` только возвращает объект.
Всё изменяемое состояние живёт в `localStorage`:

| Ключ | Кто пишет | Что хранит |
|------|-----------|------------|
| `skillswap_auth_user` | `features/auth/model/authUtils.ts` | Текущая сессия (`AuthUser` + мок-токен) |
| `skillswap_registered_users` | `authUtils.saveRegisteredUser` | Аккаунты, созданные через регистрацию в этом браузере |
| `skillswap_registration` | `pages/RegistrationStep1-3Page` | Черновик мастера регистрации |
| `skillswap_favorites` | `entities/favorite/model/favoriteSlice.ts` | id пользователей в избранном |
| `skillswap_notifications` | `entities/request/model/requestsSlice.ts` | Уведомления по пользователям |
| `skillswap_dismissed_notifications` | `entities/request/model/requestsSlice.ts` | Скрытые уведомления, чтобы не появлялись заново |

Имена ключей объявлены в `src/shared/lib/constants.ts` → `LOCAL_STORAGE_KEYS`.
Чтобы вернуть демо к исходному состоянию, очистите `localStorage` для домена.

## Демо-вход

Логин — email любого пользователя из `users.json`, пароль у всех `Demo1234!`.

| Аккаунт | Email | Чем интересен |
|---------|-------|---------------|
| Мария, 27, СПб | `maria88@mail.ru` | Четыре входящие заявки и три исходящие, все статусы, два `teach`-навыка |
| Иван, 34, Казань | `ivan34@mail.ru` | Одна исходящая заявка в статусе `pending` |
| Алина, 26, Казань | `alina00@mail.ru` | Два `teach`-навыка, входящие заявки на оба |

`LoginPage` сначала ищет пользователя среди зарегистрированных в браузере, и только потом —
в `users.json`. Пароли лежат в открытом виде осознанно: это моки без бэкенда.

## Правила целостности

При правке данных держите инварианты — на них опирается UI:

1. `authorId`, `fromUserId`, `toUserId`, `skillId` ссылаются на существующие записи.
2. `subcategory` принадлежит своей `category` (иначе навык пропадает из фильтра).
3. У каждого пользователя есть хотя бы один навык с `type: 'teach'`.
4. `createdAt` навыка ≥ `createdAt` автора.
5. Все пути к картинкам начинаются с `/db/` и указывают на существующий файл.
6. `city` есть в `cities.json`; `age` согласован с `birthDate`.
