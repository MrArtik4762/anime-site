# Anime Site

**Цель проекта:** современный сайт для поиска и просмотра аниме — с удобным каталогом, авторизацией, плеером (HLS/MP4), прогрессом просмотра и фичей «где серия в первоисточнике». Этот README ориентирован как на разработчика-человека, так и на нейросеть, которая будет автоматизированно вносить изменения.

## Содержание

1. [Quick start (Docker)](#1-quick-start-docker)
2. [Переменные окружения (.env.example)](#2-переменные-окружения-envexample)
3. [Архитектура проекта и важные файлы](#3-архитектура-проекта-и-важные-файлы)
4. [Команды разработки и npm-скрипты](#4-команды-разработки-и-npm-скрипты)
5. [API — ключевые endpoint'ы (примеры)](#5-api-ключевые-endpointы-примеры)
6. [Progress — чеклист задач (для отслеживания работы)](#6-progress-чеклист-задач-для-отслеживания-работы)
7. [PR / Commit / Branch conventions (для людей и ботов)](#7-pr--commit--branch-conventions-для-людей-ботов)
8. [Smoke tests / Acceptance criteria](#8-smoke-tests--acceptance-criteria)
9. [Best practices (безопасность, легальность)](#9-best-practices-безопасность-легальность)
10. [Troubleshooting](#10-troubleshooting)
11. [Roadmap / Рекомендации по дальнейшей работе](#11-roadmap-рекомендации-по-дальнейшей-работе)
12. [Контакты и ссылки](#12-контакты-и-ссылки)

## 1. Quick start (Docker)

Клонирование и быстрый запуск (рекомендуется для разработки):

```bash
git clone https://github.com/MrArtik4762/anime-site.git
cd anime-site

# скопировать пример env
cp server/.env.example server/.env

# (опционально) отредактируйте server/.env

# поднять контейнеры (frontend, backend, mongo, redis если есть)
docker-compose up --build -d

# Проверить
# frontend: http://localhost:3000
# backend API: http://localhost:5000
```

Если вы предпочитаете запуск без Docker:

```bash
cd server && npm install && npm run dev
cd client && npm install && npm run dev
```

## 2. Переменные окружения (server/.env.example)

```bash
# MongoDB
MONGO_URI=mongodb://mongo:27017/anime-site

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=change_me_random_string
JWT_REFRESH_SECRET=change_me_refresh_random_string

# AniLiberty / внешние API (если используются)
ANILIBERTY_API_KEY=

# Redis (опционально)
REDIS_URL=redis://redis:6379

# Прочее
SENTRY_DSN=
```

⚠️ Не храните реальные секреты в репозитории. Добавьте server/.env в .gitignore.

## 3. Архитектура проекта (коротко)

```
/client          # React frontend с Tailwind CSS
  /src
    /components     # UI компоненты (Button, Input, Modal и др.)
    /pages          # Страницы приложения
    /services       # API сервисы
    /styles         # Глобальные стили и дизайн-токены
    /context        # React context (тема, авторизация)
    /hooks          # Custom hooks
    /utils          # Утилиты
/server          # Express backend
  /controllers
  /models
  /routes
  /services
  /utils
docker-compose.yml
README.md
```

Ключевые модули:

- `server/services/anilibertyService.js` — интеграция с AniLiberty (fetch episodes / sources)
- `server/routes/auth.js` — регистрация / логин / refresh
- `client/src/components/video/HlsPlayer.jsx` — HLS-плеер (hls.js)
- `server/models/WatchProgress.js` — сохранение прогресса просмотра
- `client/src/styles/designTokens.js` — дизайн-система (цвета, отступы, скругления)
- `client/src/components/common/` — переиспользуемые UI компоненты
- `client/tailwind.config.js` — конфигурация Tailwind CSS с кастомными токенами

## 4. Основные команды / npm-скрипты

В корне проекта можно добавить (рекомендуется):

```json
{
  "scripts": {
    "install:all": "npm --prefix server install && npm --prefix client install",
    "dev:all": "docker-compose -f docker-compose.dev.yml up --build",
    "lint": "npm --prefix client run lint && npm --prefix server run lint",
    "build:client": "cd client && npm run build",
    "build:server": "cd server && npm run build"
  }
}
```

Примеры запуска:

- Frontend: `cd client && npm run dev`
- Backend: `cd server && npm run dev`
- Tests (server): `cd server && npm test`
- Сборка клиентской части: `cd client && npm run build`

## 4.1. UI и стили (Tailwind CSS)

Проект использует Tailwind CSS для стилизации интерфейса. Основные файлы, связанные с UI:

- `client/src/styles/designTokens.js` — дизайн-токены (цвета, отступы, скругления, анимации)
- `client/tailwind.config.js` — конфигурация Tailwind с кастомными токенами
- `client/src/index.css` — глобальные стили, включая кастомные скроллбары и анимации
- `client/src/components/common/` — переиспользуемые UI компоненты (Button, Input, Modal и др.)
- `client/src/components/common/ThemeProvider.jsx` — провайдер темы (светлая/темная)

### Структура компонентов

Все UI компоненты находятся в `client/src/components/common/` и следуют единой архитектуре:

- Используют дизайн-токены из `designTokens.js`
- Поддерживают адаптивность через Tailwind breakpoints
- Имеют поддержку темной темы через CSS-классы
- Стилизованы с помощью Tailwind CSS utility classes

### Кастомные скроллбары

В проекте реализованы кастомные скроллбары, которые адаптируются под тему:

- Светлая тема: темные элементы на светлом фоне
- Темная тема: светлые элементы на темном фоне

Стили скроллбаров определены в `client/src/index.css` в классах `.custom-scrollbar`.

### Градиентные фоны и тексты

Многие элементы используют градиентные фоны и тексты для визуальной привлекательности:

```css
/* Пример градиентного текста */
background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

### Анимации и переходы

Проект включает набор предопределенных анимаций:

- `animate-fade-in` — плавное появление
- `animate-slide-up` — появление снизу
- `animate-slide-down` — появление сверху
- `animate-scale-in` — масштабирование при появлении
- `hover-lift` — подъем при наведении
- `hover-scale` — масштабирование при наведении

Все анимации определены в `client/src/index.css`.

### Структура компонентов

Все UI компоненты находятся в `client/src/components/common/` и следуют единой архитектуре:

- Используют дизайн-токены из `designTokens.js`
- Поддерживают адаптивность через Tailwind breakpoints
- Имеют поддержку темной темы через CSS-классы
- Стилизованы с помощью Tailwind CSS utility classes

### Кастомные скроллбары

В проекте реализованы кастомные скроллбары, которые адаптируются под тему:

- Светлая тема: темные элементы на светлом фоне
- Темная тема: светлые элементы на темном фоне

Стили скроллбаров определены в `client/src/index.css` в классах `.custom-scrollbar`.

### Градиентные фоны и тексты

Многие элементы используют градиентные фоны и тексты для визуальной привлекательности:

```css
/* Пример градиентного текста */
background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

### Анимации и переходы

Проект включает набор предопределенных анимаций:

- `animate-fade-in` — плавное появление
- `animate-slide-up` — появление снизу
- `animate-slide-down` — появление сверху
- `animate-scale-in` — масштабирование при появлении
- `hover-lift` — подъем при наведении
- `hover-scale` — масштабирование при наведении

Все анимации определены в `client/src/index.css`.

## 5. API — ключевые endpoint'ы (примеры)

### Auth

- `POST /api/auth/register`
  Body: `{ "email","password","username?" }`

- `POST /api/auth/login`
  Body: `{ "email", "password" }` — возвращает accessToken + refreshToken в httpOnly cookie

- `POST /api/auth/refresh` — использует cookie refreshToken, возвращает новый accessToken

### Каталог

- `GET /api/anime?q=&page=&limit=&genres=&year=&sort=rating|year|popular`

### Плеер / Стрим

- `GET /api/stream?url=<encoded>` — прокси для stream URL (поддержка Range)

### Прогресс

- `POST /api/watch/progress` — `{ animeId, episode, position, duration }` (auth required)
- `GET /api/watch/progress?animeId=...` — возвращает последнее значение

### Где серия

- `GET /api/anime/:id/episode/:num/sources` — возвращает список доступных источников/зеркал

## 6. Progress — чеклист (для отслеживания статуса работы)

Используйте этот блок для быстрой визуальной индикации текущего статуса. Нейросеть/разработчики должны обновлять чекбоксы с PR ссылкой после выполнения.

```markdown
## Progress (Trello / GitHub checklist)
- [x] Repo cleanup
- [ ] A0.0 setup/verify-environment
- [ ] B1 auth/audit
- [ ] B2 auth/fix-register-login
- [ ] B3 auth/frontend-integration
- [ ] C1 catalog/unify-endpoint
- [ ] C2 catalog/frontend-list
- [ ] C3 search/autocomplete
- [ ] D1 player/hls-component
- [ ] D2 server/stream-proxy
- [ ] D3 watch/progress
- [ ] E1 sources/fetch-and-store
- [ ] E2 sources/api
- [x] F1 ui/theme-setup — настройка темы с Tailwind CSS
- [x] F2 redesign-home-cards — домашняя страница и карточки аниме
- [x] F3 redesign-watch-page — страница просмотра с Tailwind CSS
- [x] G1 README & CONTRIBUTING
- [x] H1 CI (GitHub Actions)
```

При обновлении: указывайте PR номер и краткое описание, например:

- [x] B2 auth/fix-register-login — PR #42 (fix: login flow, refresh tokens)

## 7. PR / Commit / Branch conventions (полезно для бота/нейросети)

### Branch naming

```bash
task/<id>-<short-slug>
# пример: task/1-auth-fix-login
```

### Commit message

```bash
<type>(<scope>): Short description

# type: feat, fix, chore, docs, refactor, test
# scope: auth, player, api, client, server

# пример:
fix(auth): restore refresh token flow and set httponly cookie
```

### PR body template

```markdown
### Что сделано
- Краткое резюме изменений

### Файлы
- server/routes/auth.js
- client/src/pages/Login.jsx

### How to test (smoke test)
1. docker-compose up --build -d
2. POST /api/auth/register -> 201
3. POST /api/auth/login -> Set-Cookie refreshToken + access in response
4. Open frontend http://localhost:3000 and login

### Acceptance criteria
- Регистрация/логин работают
- refresh token в httponly cookie
- tests: server/tests/auth.test.js проходят

Closes: #<issue-id> (если есть)
```

## 8. Smoke tests / Acceptance criteria (быстрая проверка после PR)

### Auth

- Регистрация возвращает 201 и создает запись в users.
- Логин возвращает accessToken и выставляет refreshToken cookie (HttpOnly).
- POST /api/auth/refresh возвращает новый accessToken при наличии refresh cookie.

### Catalog

- GET /api/anime?page=1&limit=24 возвращает page/limit/total/data.
- Фильтрация по genres и year работает.

### Player

- Воспроизведение HLS-потока через HlsPlayer работает в современном браузере.
- Stream proxy корректно отрабатывает Range-запросы.

### Progress

- При старте эпизода прогресс восстанавливается на последнюю сохранённую позицию.

## 9. Best practices (безопасность и легальность)

- **Secrets**: не пушьте `.env` в репозиторий. Используйте `server/.env.example`.
- **JWT**: короткий accessToken (например 15 минут), долгий refreshToken (например 30 дней) в HttpOnly Secure cookie.
- **CORS**: в dev localhost разрешать фронтенду; в проде — поставить строгий origin.
- **Streaming / legal**: не проксируйте нелегальный контент. Где возможно — использовать embeddable/официальные API (Crunchyroll, Funimation, YouTube) или договоры с правообладателями.
- **Rate limiting**: защитите /api/auth и /api/stream от брутфорса / DoS.
- **DMCA / Legal**: заведите LEGAL.md с процедурой обработки жалоб.

## 10. Troubleshooting (частые проблемы)

### CORS ошибки при воспроизведении видео

Проверьте, что прокси /api/stream добавляет правильные Access-Control-Allow-* заголовки.
Убедитесь, что video source отдаёт Content-Type и поддерживает Range-запросы.

### refreshToken не устанавливается

При локальной разработке cookie Secure не должен быть выставлен; выставить secure: process.env.NODE_ENV === 'production'.
Используйте fetch(..., { credentials: 'include' }) на фронте.

### Mongo connection errors

Проверьте MONGO_URI в .env. В docker-compose service name обычно mongo, URI mongodb://mongo:27017/anime-site.

## 11. Roadmap / Рекомендации по дальнейшей работе (мои предложения)

- Redis caching для каталога и episode metadata.
- OAuth (Google / Discord) для ускоренной регистрации.
- Analytics (events: play, pause, finish) — для рекомендаций.
- PWA — быстрая загрузка и offline страницы (если легально).
- Subtitles editor / crowdsubtitles (модерация).
- Image CDN & WebP generation (Sharp) — ускорение загрузки карточек.
- Integrate Sentry (frontend + backend) для автоматического мониторинга ошибок.

## 12. Контакты и как дальше

Если хотите, я могу прямо сейчас сгенерировать:

- auth-patch — .patch/.diff для исправления регистрации/входа (готово к git apply), или
- player-component — готовый HlsPlayer.jsx компонент (React) с hooks для автосохранения прогресса, или
- README файл в виде README.md (я уже сгенерировал содержимое — вставьте в файл).

---

*Этот README ориентирован как на разработчика-человека, так и на нейросеть, которая будет автоматизированно вносить изменения.*