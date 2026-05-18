# Happy Life — внутренний контекст (для преемственности в разработке и ИИ)

Этот файл — **не пользовательская документация**, а рабочая память: решения, риски, расхождения с исходным DOC. Обновлять по мере изменений.

## Старт следующей сессии (читать первым)

> **Назначение:** срез состояния, который актуализируется в конце каждой сессии. Если что-то ниже устарело — сначала обнови этот блок и `TODO_ROADMAP.md`, потом продолжай.

**Последняя дата апдейта:** 2026-05-19 · Ветка: `main` @ `14ee329` · Репозиторий: `SjPn/HappyLifeManagement` · Прод: Vercel `hlm-nu.vercel.app` + Neon.

**Последние коммиты (`git log -5`):** `14ee329` · `aad4557` · `f471bb0` · `93826bd` · `c1a6757`.

### Архитектура (актуально)

- **Multi-tenant SaaS:** модель `Community`, у сущностей `communityId`. Один деплой — много поселков/ОСББ.
- **Роли:** `RESIDENT`, `MODERATOR`, `CHAIR`, `PLATFORM_ADMIN` (`communityId: null` у суперадмина).
- **Онбординг поселка:** `/register-community` → поселок + председатель в статусе ожидания (`Community.approvedAt = null`, chair `PENDING`) → суперадмин **«Схвалити»** в `/platform/communities`.
- **Регистрация жителя:** только с **кодом приглашения** поселка (обязательное поле, без «необязательно»). Код генерируется при создании поселка; **председатель меняет** в профиле (`ChairInviteCodeForm`). Регистрация не работает для неодобренных/заблокированных поселков.
- **Суперадмин** (`/platform/communities`): CRUD поселков, одобрение, блокировка/удаление (подтверждение **кодом приглашения** поселка); управление **председателями** (приостановить / восстановить / удалить — тоже с кодом).
- **Prod-откат:** тег `stable/pre-multitenant-2026-05-18` → `6f73ef6` (до multi-tenant). Не откатывать БД без явного запроса.
- **Пилот на проде:** поселок «Щасливе Життя», `inviteCode` из env (`HAPPY2026`), миграция данных `scripts/migrate_shchaslyve_zhyttya.ts`. Суперадмин: `scripts/ensure_platform_admin.ts`.

### Что работает (функционально)

| Область | Маршруты / заметки |
|--------|---------------------|
| Локали | `/uk` (default), `/ru`, `/en`; `next-intl`, `revalidateAllLocales` |
| Auth | Auth.js v5, JWT + refresh `communityId`/status из БД |
| Житель | dashboard, заявки (list+modal+archive), голосования, платежи, сообщество, ЛС `/messages` |
| Голова | `/chair/*`, биллинг `/payments`, адреса, пользователи (list+modal), модерация |
| Модератор | упрощённый UX, конфиденциальные обращения, без ЛС |
| Платформа | `/platform/communities` |
| Платежи | `HouseholdBilling` по месяцу+дому; не уровень ДАХ/квитанций |
| Чат | **Личные сообщения** 1-на-1 (не групповой Threads) |

### Схема и деплой

- **Prisma:** `web/prisma/schema.prisma`; миграции в `prisma/migrations/` (в т.ч. `20260519120000_community_approval` — поле `approvedAt`).
- **Vercel build:** `npm run vercel-build` = `prisma migrate deploy` + `next build` (`web/vercel.json`).
- **Сборка локально:** `cd web && npm run build` — должна проходить (warning: `middleware` → `proxy` в Next 16).

### Известные не-блокеры

- Загрузки в `public/uploads/` — эфемерны на Vercel → нужен S3.
- Нет push / SMS / онлайн-оплаты.
- `middleware.ts` deprecated → позже `proxy.ts` + проверка `next-intl`.
- Capacitor skeleton в `mobile/` — APK-ссылка в профиле, не store-ready.
- Тесты: Vitest (`src/lib/*.test.ts`), Playwright e2e (`e2e/`) — базовое покрытие, не полный регресс.

### Паттерны UI

- Список → **модалка** (заявки, жители у головы).
- Архив завершённого (`/requests/archive`).
- Опасные действия суперадмина → **модалка + код приглашения** (`CommunityDangerModal`).

### Быстрые команды (PowerShell)

```powershell
cd e:\MyPyPro\HappyLife\web
npm run build
git -C .. log --oneline -5
git -C .. status
```

### Источники истины

- Видение — `docs/PROJECT_OVERVIEW.md`
- **Оценка vs ДАХ** — `docs/PROJECT_EVALUATION.md`
- Дорожная карта — `docs/TODO_ROADMAP.md`
- Запуск — `web/README.md`

---

## Источник видения

Файл `e:\MVP_happyLife.docx`. Ключевые модули: Dashboard, счётчики, заявки, голосования, конфиденциальные обращения, доска, чат; роли: житель, модератор, председатель; flow: регистрация → подтверждение → главная.

## Зафиксированные противоречия / уточнения

1. **Нижнее меню:** 4 таба (Главная | Сообщество | Заявки | Ещё); голосования и платежи — с главной.
2. **Чат MVP:** форум + **личные сообщения**, не клон Threads и не замена Telegram-группы посёлка.
3. **Счётчики/начисления:** ручной ввод головой; без интеграции с УК/ДАХ.
4. **Конфиденциальные обращения:** автора видит только модератор.
5. **Модератор:** служебная роль, без публикаций и голосований.
6. **Верификация жителя:** код приглашения + выбор адреса из справочника + апрув головой (`PENDING` → `APPROVED`).
7. **Верификация поселка:** апрув суперадмина (`approvedAt`) до открытия регистрации жителей.

## Технические риски

- Подделка адреса без списка от головы — частично снято `CommunityAddress`.
- Геометки на заявках — PII.
- Смена invite-кода головой — старый код сразу недействителен (ожидаемо).
- Удаление единственного председателя — поселок без главы (суперадмин может назначить нового только через новую регистрацию / ручное вмешательство в БД).

## Реализованный MVP (код) — справочник

- Каталог: `web/` — Next.js 16 + Prisma 5 + Postgres + Auth.js + next-intl.
- Мульти-тенант: `web/src/lib/tenant.ts`, `Community`, scope в экшенах.
- Платформа: `web/src/actions/platform.ts`, `PlatformCommunitiesPanel`.
- Регистрация: `RegisterForm`, `RegisterCommunityForm`, `api/register`, `api/addresses`.
- i18n: `web/messages/{uk,ru,en}.json`.
- Биллинг: `HouseholdBilling`, `web/src/lib/billing.ts`, `/payments`.

### Деплой

- Postgres (Neon); на Vercel — `prisma migrate deploy` в build.
- `AUTH_URL` / `NEXTAUTH_URL` = фактический origin (иначе redirect loop / ClientFetchError).
- JWT callback обновляет `communityId` из БД (фикс redirect loop для старых сессий).
