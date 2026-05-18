# Happy Life — внутренний контекст (для преемственности в разработке и ИИ)

Этот файл — **не пользовательская документация**, а рабочая память: решения, риски, расхождения с исходным DOC. Обновлять по мере изменений.

## Старт следующей сессии (читать первым)

> **Назначение:** срез состояния, который актуализируется в конце каждой сессии. Если что-то ниже устарело — сначала обнови этот блок и `TODO_ROADMAP.md`, потом продолжай.

**Последняя дата апдейта:** 2026-05-18 (production Neon → поселок «Щасливе Життя») · Ветка: `main` · Репозиторий: `SjPn/HappyLifeManagement` · Прод: Vercel `hlm-nu.vercel.app` + Neon.

**Последние коммиты (`git log -8`):** `6f73ef6` · `63a1d19` · `2fcdbf8` · `a51b2f2` · `39749d1` · `ab95a6b` · `913a3fe` · `9a341bb`.

- Раздел **«Мої платежі»** (`/{locale}/payments`): житель видит абонплату + электро; при `paidAt` — «Оплачено». Голова вносит на `/payments` по месяцам (`HouseholdBilling`). `/meters` — редирект.
- **Заявки** (`/requests`): список **название + статус** → модалка (`RequestsPanel`); архив `/requests/archive` для `RESOLVED`.
- **Голова / жители** (`/chair/users`): список **имя | адрес** → модалка (`ChairUsersPanel`).
- **UX:** 4 таба; синяя тема; бейджи «новое»; управление с главной; из **«Ещё»** убрана ссылка «Управление». Один тенант (одна БД на посёлок).

**Где код:** `web/` (Next.js 16 App Router + Prisma 5 + Postgres + Auth.js v5 + next-intl). База — Postgres (Neon), на Vercel — единый деплой.

**Схема платежей:** `HouseholdBilling` (месяц+адрес) + отдельно `User.balanceUah` в `/chair/users`. Код только `prisma.householdBilling` (P2021 если задеплоен старый билд).

**Что работает (`npm run build`, 2026-05-18):**

- Локали с префиксом URL `/uk` (default) / `/ru` / `/en`; root `/` редиректит на `/uk` через `web/src/app/page.tsx` (фолбэк к `next-intl` middleware).
- Auth.js v5: вход email/password, JWT-сессия, корректный sign-out (`SignOutButton` уходит через `signOut({ redirect: false })` + клиентский `window.location.assign('/${locale}')`).
- Регистрация: владелец/арендатор + согласие с меморандумом (`memorandumAcceptedAt`/`memorandumVersion`).
- Сообщество: дошка, форум (тема + ответы + первый пост), конфиденциальные обращения; авторы редактируют свои объявления и темы; персонал удаляет любой контент через `/{locale}/chair/moderation`.
- Голосования: создаёт только `CHAIR`, аудитория `ALL`/`OWNERS_ONLY`/`TENANTS_ONLY`, удаление через панель модерации.
- `MODERATOR` — служебная роль: видит автора конфиденциальных обращений, не голосует, не публикует, не правит балансы; для него `dashboard` упрощённый, а `requests`/`community`/`votes`/`payments` редиректят в `/chair`.
- Публичные: memorandum, tariffs. Жители: `/residents` (из `/community`). Платежи: `/payments` (голова вносит суммы здесь, не в `chair/users`).
- Деплой: после `db push` на Neon нужен коммит с `HouseholdBilling`. Скрипт: `web/scripts/migrate_household_billing.ts` (если осталась старая таблица).

**Известные не-блокеры (на потом):**

- Next.js 16 в `next build` пишет: `The "middleware" file convention is deprecated. Please use "proxy" instead.` — нужно будет переименовать `web/src/middleware.ts` → `web/src/proxy.ts` и проверить `next-intl` совместимость. Сейчас всё работает, но deprecation висит.
- Загрузки изображений всё ещё в `web/public/uploads/` (на Vercel — эфемерное хранилище). Перенос в S3-совместимое — открытая задача в `TODO_ROADMAP.md`.
- В `TODO_ROADMAP.md` голосования помечены как `[~]` — UX/архив можно ещё подтянуть, но базовый CRUD + участие работает.

**Что недавно убрано (если возникнет искушение «вернуть» — не возвращать без явного запроса):**

- `web/scripts/migrate_sqlite_to_postgres.ts` + sqlite-client — миграция SQLite→Postgres завершена.
- `HouseholdPayment` (одна строка на адрес без месяца) — заменена на `HouseholdBilling`.
- `web/scripts/cleanup_demo_news.ts` — разовая чистка демо-новости, в `seed.ts` её больше нет.
- `web/scripts/fix-links.mjs` / `fix-link-named.mjs` — codemod-ы на `next/link` → `@/i18n/navigation`, проект давно мигрирован.
- В `web/src/lib/enums.ts` удалены неиспользуемые `TicketStatus`, `ReportStatus` и все label-словари (`*Label`) — все подписи идут через `next-intl` (`messages/{uk,ru,en}.json`).

**Открытые приоритеты (см. `TODO_ROADMAP.md`):**

1. Платежи: «скопировать начисления с прошлого месяца»; фильтр «только неоплаченные» для голови; привязка биллинга к `communityAddressId` вместо строк street/house (избежать дублей «Лісова» vs «Лесная»).
2. UI-бейджи аудитории на голосованиях и темах форума.
3. Редактируемый контент тарифов/меморандума (сейчас плейсхолдеры).
4. `prisma migrate` вместо `db push`; S3 для uploads; `middleware.ts` → `proxy.ts` (Next.js 16).

**Быстрые команды для проверки состояния (Windows / PowerShell):**

```powershell
cd e:\MyPyPro\HappyLife\web
npm run -s build    # должен пройти без ошибок (warning про middleware → proxy ожидаем)
npm run -s lint     # должен быть пустым
git -C .. log --oneline -5
git -C .. status
```

**Паттерны UI (зафиксировать при новых списках):**

- Компактный список на странице → **модалка** с деталями и действиями (заявки, жители у головы).
- Завершённые сущности — **отдельный архив** (заявки `RESOLVED` → `/requests/archive`).

**Источники истины:**

- Продуктовое видение и роли — `docs/PROJECT_OVERVIEW.md`.
- Сравнение с рынком (ДАХ и аналоги) — `docs/PROJECT_EVALUATION.md`.
- Дорожная карта — `docs/TODO_ROADMAP.md`.
- Локальный запуск, Prisma/Auth трюки, заметки по деплою — `web/README.md`.
- Транскрипт прошлых чатов — `C:\Users\intel\.cursor\projects\e-MyPyPro-HappyLife\agent-transcripts\` (по uuid сессии).


## Источник видения

Файл `e:\MVP_happyLife.docx` (извлечён текстово). Ключевые модули: Dashboard, счётчики, заявки, голосования, анонимные обращения, доска, чат в стиле Threads; роли: житель, модератор, председатель; flow: регистрация → подтверждение адреса → главная.

## Зафиксированные противоречия / уточнения

1. **Нижнее меню в DOC:** указаны 6 табов, в списке пересечения и опечатка (иконка голосований + подпись «чат»). Для UX зафиксировать **4–5 табов**: Главная | Сообщество (доска + чат + анонимка как подразделы) | Заявки | Профиль/ещё; голосования и счётчики — prominent на главной или в «ещё», чтобы не размазывать внимание.
2. **Threads-like чат** для MVP — высокая сложность (real-time, вложенность, уведомления). Имеет смысл **упростить**: форум «тема → ответы» без полного паритета с Threads; позже усложнять.
3. **Счётчики и начисления** без интеграции с УК/бухгалтерией быстро превращаются в источник споров. В MVP — **ввод показаний + история**; «начисления/баланс» — только если есть надёжный ввод данных от администрации или интеграция.
4. **Конфиденциальность**: автора конфиденциального обращения видит **только модератор** (не председатель). В интерфейсе не называть это «анонимно для администрации», лучше **«конфиденциальное обращение»** с ясной политикой.
5. **Модератор — служебная роль**: не участвует как житель (не голосует и не создаёт заявки/объявления/темы/ответы), его зона — **пользователи + конфиденциальные обращения**.

## Рынок (кратко, на момент сбора)

- **РФ:** тренд на специализированные системы для посёлков/СНТ (например, обзоры вроде SNT Club: учёт, заявки, рассылки, пропуска). Сильная сторона конкурентов — **финансы и интеграция с УК**. Социальный слой часто слабее; Happy Life может выиграть за счёт **соседского UX** (доска + структурированные обсуждения), если не пытаться сразу конкурировать с полным биллингом.
- **Зарубежно (HOA):** HeyNeighbor, Deets, WeNeighbors, NeighborCloud — упор на **engagement**, события, формы, уведомления, self-service; ИИ-ассистенты встречаются как опция. Для копирования идей: дайджесты, календарь, каталог соседей (с согласия), прозрачный статус заявок.

## Технические риски (заранее)

- Верификация адреса без офлайн-процесса подделывается; нужен осознанный минимум (одноразовые коды, списки от председателя).
- Геометки на заявках — риск **PII**; хранить обобщённо или только для роли «ремонт».
- Масштабирование **real-time чата** дороже, чем остальной MVP.

## Что не делать в первом коде (until explicitly requested)

- Полный клон Threads, тяжёлый биллинг, открытая лента «все проблемы посёлка» без модерации (токсичность).

## Следующий шаг после этого документа

Согласовать с заказчиком **состав MVP** из `TODO_ROADMAP.md` Фазы 3 и прототип навигации — затем выбирать стек и репозиторий.

## Реализованный MVP (код)

- Каталог приложения: `web/` — Next.js + Prisma + **Postgres** + Auth.js.  
- Запуск и демо-аккаунты: см. `web/README.md`.  
- База: `web/prisma/schema.prisma`, сид `npm run db:seed`.

### Интернационализация и локаль (актуально)

- **`next-intl`**, локали маршрута: **`uk`** (дефолт), **`ru`**, **`en`**. Префикс URL: `/uk/…`, `/ru/…`, `/en/…`. Файлы строк: `web/messages/{uk,ru,en}.json`. Русская локаль в UI подписана как **«Київський» / «Киевский» / «Kyiv Russian»** (`lang.ru`), без использования слова «российский» в переключателе.
- Навигационные `Link`/`router` — из `web/src/i18n/navigation.ts`; после мутаций серверные экшены вызывают **`revalidateAllLocales`** (`web/src/lib/revalidateI18n.ts`), чтобы кеш страниц сбрасывался для всех локалей.
- Даты в интерфейсе: **`dateLocaleForUi`** (`web/src/lib/dateLocale.ts`) — `uk-UA` / `ru-UA` / `en-GB`.
- Деньги: **`balanceUah`**, отображение через **`formatUah`** (`web/src/lib/money.ts`).
- Загрузки изображений: **`savePublicUpload`** → `public/uploads/`; в схеме: **`Ticket.photoUrl`**, **`BoardPost.imageUrl`**, **`ForumPost.imageUrl`**. Формы с файлами — `encType="multipart/form-data"`.
- Страницы и формы, ранее с фиксированным русским текстом (голосования, профиль с `LanguageSwitcher`, спільнота/звернення, панель голови, модерація), переведены на `getTranslations` / `useTranslations`; редиректы в `chair/*` с отказом в доступе — с префиксом локали (`getLocale` + `redirect(\`/${locale}/dashboard\`)`).
- Статусы заявок и адреса в селектах: `TicketStatusForm` / `UserApproveSelect` используют `categories.ticketStatus` и `categories.userStatus` (`PENDING` / `APPROVED` / `REJECTED`). `BalanceEditForm` — `chair.balance`, `common.save` / `common.loading`. Корневой `app/layout.tsx` — дефолтные `metadata` на украинском, в духе `meta` из `messages/uk.json`.
- **Prisma / `balanceUah`:** в схеме поле `User.balanceUah`. Если сгенерированный клиент в `node_modules` ещё со старым `balanceRub` (не запускали `prisma generate` после смены схемы) — на дашборде будет `PrismaClientValidationError` на `balanceUah`. Решение: `npx prisma generate` (на Windows при EPERM — остановить dev-сервер). БД из старой ветки с колонкой `balanceRub`: `ALTER TABLE "User" RENAME COLUMN "balanceRub" TO "balanceUah";` через `prisma db execute --stdin`, затем `prisma db push`. См. `web/README.md`, раздел Prisma.
- **`npm run dev`** вызывает **`predev`** → `prisma generate`, чтобы перед стартом Next подтянуть актуальный клиент. Если ошибка всё ещё упоминает `balanceRub`, процесс `next dev` держит старый клиент в памяти: полная остановка dev, при необходимости удалить `web/.next`, снова `npm run dev`.
- **Auth.js / `ClientFetchError` (Failed to fetch):** в `.env` переменные **`AUTH_URL` и `NEXTAUTH_URL`** должны совпадать с фактическим origin в браузере (включая порт, например `http://localhost:3300` при `next dev -p 3300`). Иначе падает запрос к `/api/auth/session`. См. `web/README.md`.
- **Sign out / редиректы:** в проде возможна ошибка, когда неверный `NEXTAUTH_URL` отправляет пользователя на `localhost` при выходе. Для устойчивости `SignOutButton` делает `signOut({ redirect: false })` и затем клиентский переход на `/${locale}`.
- **Владелец / арендатор и аудитория:** у `User` поле `tenancyType` (`OWNER` | `TENANT`), задаётся при регистрации. У `Vote` и `ForumTopic` поле `audience` (`ALL` | `OWNERS_ONLY` | `TENANTS_ONLY`). Логика в `web/src/lib/audience.ts`; персонал (`CHAIR`, `MODERATOR`) обходит ограничения. Доска объявлений пока без аудитории.
- **Меморандум/тарифы:** публичные страницы до логина: `/{locale}/info/memorandum`, `/{locale}/info/tariffs`. При регистрации требуется согласие с меморандумом; сохраняется `User.memorandumAcceptedAt` и `User.memorandumVersion`.
- **Каталог жителей:** `/{locale}/residents` (вход с `/community`).
- **Адреса КГ:** `CommunityAddress`, CRUD `/{locale}/chair/addresses`, выбор при регистрации (`AddressSelect`).
- **Платежи:** `HouseholdBilling`, хелперы `web/src/lib/billing.ts`, UI `PaymentPeriodNav`, экшены в `web/src/actions/chair.ts`.
- **Редактирование/модерация:** автор редактирует свои посты/темы; персонал удаляет контент в `/chair/moderation`.

### Деплой и эксплуатация (заметки)

- Прод и разработка — **Postgres** (Neon). SQLite не используется.
- Render на недорогих тарифах может «усыплять» сервис → **cold start** (десятки секунд). Для MVP это ок; для UX — переход на always-on план или хостинг без сна.
- Vercel часто быстрее для Next.js, но требует внешнюю БД; SQLite-файл на Vercel — нецелевой путь.

#### Neon Postgres (заметка)

- Для операций Prisma уровня схемы (`prisma db push`, миграции) обычно лучше использовать **direct endpoint** (не `-pooler`).
- Если используете pooler endpoint, иногда требуется `?pgbouncer=true` (см. документацию Neon по pooling).
- Смена `HouseholdPayment` → `HouseholdBilling`: на проде уже применён `db push` (2026-05-17); при потере строк — голова заново вносит суммы за текущий месяц на `/payments`.
