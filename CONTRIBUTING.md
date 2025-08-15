# CONTRIBUTING.md

Спасибо за интерес к проекту — ваш вклад важен! Этот файл даёт чёткие инструкции для людей и для автоматизированных агентов/нейросетей, которые будут вносить изменения в репозиторий. Следуйте шагам ниже — это поможет быстро и безопасно вносить правки, открывать PR и отслеживать прогресс.

## 1. Основные принципы

- Делайте маленькие, атомарные изменения — один PR = одна логичная задача/фича/фикс.
- Подписи коммитов и названия веток должны быть понятны (см. секцию Branch & Commit conventions).
- Всегда пишите тесты для критичных изменений (auth, API, трансформация данных).
- Не пушьте секреты: используйте server/.env.example и .gitignore.

## 2. Как открыть Issue / Feature request / Bug report

Проверьте, нет ли уже похожего issue.

Если нет — создайте новый issue с шаблоном:

**Заголовок:** `bug: <краткое описание>` или `feat: <краткое описание>`.

**Описание содержит:**

- Что не работает / чего не хватает.
- Шаги воспроизведения (repro steps).
- Ожидаемое поведение.
- Логи / скриншоты / HTTP-запросы (если есть).

**Присвойте label:** `bug`, `enhancement`, `documentation`, `help wanted`, `good first issue`.

## 3. Быстрая настройка окружения (dev)

Для локальной разработки удобно использовать Docker:

```bash
git clone https://github.com/MrArtik4762/anime-site.git
cd anime-site
cp server/.env.example server/.env
# При необходимости отредактируйте server/.env
docker-compose up --build -d
# Откройте frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

**Альтернатива без Docker:**

```bash
# backend
cd server
npm install
npm run dev

# frontend
cd ../client
npm install
npm run dev
```

## 4. Branch & Commit conventions (обязательно)

### Branch naming

```
task/<id>-<short-slug>
# пример: task/12-auth-fix-login
```

### Commit message

```
<type>(<scope>): Short description

# types: feat, fix, chore, docs, test, refactor
# scopes: auth, api, client, server, player, db
# пример:
fix(auth): restore refresh token flow and set httponly cookie
```

**Правило:** один коммит — одна логическая часть фичи/исправления.

## 5. Pull Request — шаблон и процесс

Перед созданием PR убедитесь, что:

- Код форматирован (prettier / eslint).
- Линтеры проходят.
- Юнит-тесты для изменённых частей добавлены и проходят.
- CI зелёный.

### PR title:

```
<type>(<scope>): short description
# пример: feat(player): add HlsPlayer component with progress save
```

### PR body (copy/paste шаблон):

```markdown
### Что сделано
- Краткое резюме изменений (пункты)

### Файлы
- перечислить ключевые файлы, которые были изменены

### Как протестировать (smoke test)
1. docker-compose up --build -d
2. POST /api/auth/register -> ожидаем 201
3. POST /api/auth/login -> cookie refreshToken + accessToken в ответе
4. Откройте http://localhost:3000 и проверьте флоу

### Acceptance criteria
- краткий список критериев приёмки (min 3 пункта)

### Notes
- Указать ограничения, примечания, ссылки на issue

Closes: #<issue-id> (если есть)
```

## 6. Code review checklist (для ревьюера и CI)

- Соответствует style-guide (ESLint, Prettier).
- Нет жёстко закоммиченных секретов (.env, ключи).
- Имеются тесты для новой логики или исправлений.
- Все новые / изменённые endpoint'ы документированы (README / API docs).
- Нет утечек console.log или debugger в продакшн-коде.
- Все внешние запросы/источники имеют обработку ошибок и таймауты.
- Security review: auth / токены / CORS / cookie flags проверены.

## 7. Тесты и CI

Серверная часть использует Jest + Supertest (рекомендация).

Frontend — unit tests (react-testing-library) по возможности.

В репо должен быть GitHub Actions workflow `.github/workflows/ci.yml` который:

- Устанавливает зависимости.
- Запускает линтеры.
- Запускает тесты.
- Проверяет сборку клиента и сервера.

### Как запускать тесты локально (пример):

```bash
# server
cd server
npm install
npm test

# client
cd client
npm install
npm test
```

## 8. Обновление README / Progress

Чтобы трекать прогресс задач:

При закрытии задачи / мёрдже PR — обновите раздел Progress в [`README.md`](README.md) или [`README_PROGRESS.md`](README_PROGRESS.md).

**Формат строки:**

```markdown
- [x] B2 auth/fix-register-login — PR #42 (fix: login flow)
- [ ] D1 player/hls-component — WIP
```

Если PR закрывает issue, добавьте `Closes #<issue>` в PR body — это поможет автоматизировать статусы.

## 9. Инструкции для нейросети / автоматизированного агента

Если вы — автоматизированный агент (или готовите инструкции для бота), следуйте этому procedural checklist при внесении изменений:

1. Создать issue (если его нет) с repro и acceptance criteria.
2. Создать ветку: `task/<id>-<short-slug>`.
   ```bash
   git checkout -b task/12-auth-fix-login
   ```
3. Выполнить изменения локально или через патчи.
4. Запустить тесты и локальный smoke test:
   ```bash
   docker-compose up --build -d
   ```
5. Пройти smoke test (регистрация → логин → воспроизведение эпизода).
6. Коммитить с шаблонами (см. секцию Commit message).
7. Открыть PR с заполненным PR body (шаблон выше).
8. Добавить в PR ссылку на issue и `Closes #<id>` при возможности.
9. Обновить README Progress (пометить таск в состоянии WIP или Done). Коммит: `docs(progress): update README progress — task/12 auth fix`

**Если CI упал** — исправить ошибки, не мерджить до зелёного CI.

**После мерджа** — проверить production-like smoke test (если staging есть), и создать follow-up task, если нужно.

### Дополнительно для агента:

- Указывайте тестовые данные/учётную запись, которыми вы пользовались (например `test@example.com`), чтобы другие могли воспроизвести.
- В PR body вставляйте How to test — пошагово.

## 10. Security и легальность

- Никогда не вносите код, который помогает обходить авторские права или защищённый контент.
- Если вы добавляете stream-proxy — документируйте источники и подтверждайте легальность.
- Не коммитите реальные секреты, API-ключи или пароли.

## 11. Форматы файлов и места, которые чаще правятся

### Backend:
- [`server/controllers`](server/controllers)
- [`server/routes`](server/routes)
- [`server/models`](server/models)
- [`server/services`](server/services)

### Frontend:
- [`client/src/components`](client/src/components)
- [`client/src/pages`](client/src/pages)
- [`client/src/services`](client/src/services)

### Docs:
- [`README.md`](README.md)
- [`CONTRIBUTING.md`](CONTRIBUTING.md)
- [`README_PROGRESS.md`](README_PROGRESS.md)
- [`LEGAL.md`](LEGAL.md)
- [`CHANGELOG.md`](CHANGELOG.md)

## 12. Полезные git-команды (шаблоны)

```bash
# новая ветка
git checkout -b task/12-auth-fix-login

# добавить изменения
git add .

# коммит
git commit -m "fix(auth): restore refresh token flow and set httponly cookie"

# пуш
git push origin task/12-auth-fix-login

# создать PR можно через GitHub UI или hub/gh CLI
gh pr create --title "fix(auth): ..." --body-file pr_body.md
```

## 13. Контакты / помощь

Если нужны дополнительные указания, тестовые данные или помощь с CI — открывайте issue с тегом `help wanted` и подробно указывайте, что требуется.