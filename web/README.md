# Happy Life — веб-MVP

Платформа для жителів ОСББ/котеджних громад в **Україні**: головна з новинами та голосуваннями, заявки, спільнота (дошка, форум, конфіденційні звернення), лічильники, ролі мешканець / модератор / голова. Орієнтація продукту: **гривня (UAH)**, дати/формати — за обраною мовою.

## Стек

- **Next.js 16** (App Router), React 19, TypeScript  
- **Tailwind CSS 4**  
- **Prisma 5** + **Postgres** (например Neon/Render Postgres)  
- **Auth.js (next-auth v5 beta)** — вхід за email/паролем  
- **next-intl** — три мови з префіксом у URL: **`/uk`** (типово), **`/ru`**, **`/en`**. Російська в інтерфейсі позначається як **«Київський»** (не «російська»). У шапці — перемикач мов.  

## Запуск локально

```bash
cd web
npm install
cp .env.example .env
npx prisma db push
npm run db:seed
npm run dev
```

Відкрийте [http://localhost:3000](http://localhost:3000) — буде перенаправлення на **`/uk`** (або одразу `/uk`, `/ru`, `/en`).

В `.env` задайте `AUTH_SECRET` (довипадковий рядок). Для автосхвалення реєстрації — `INVITE_CODE` (у прикладі `HAPPY2026`).

**Auth.js: `ClientFetchError` / `Failed to fetch` на дашборді** — зазвичай браузер на `http://localhost:ПОРТ` звертається до `/api/auth/session`, а в `.env` вказано **інший порт** (наприклад, додаток на **3300**, а `AUTH_URL` / `NEXTAUTH_URL` лишились на **3000**). Виправлення: у `.env` виставте **`AUTH_URL` і `NEXTAUTH_URL`** на той самий базовий URL, що в адресному рядку (включно з портом), перезапустіть `npm run dev`. Якщо після цього помилка лишається — відкрийте в новій вкладці `http://localhost:ПОРТ/api/auth/session`: при 500 див. лог сервера (часто Prisma після оновлення схеми).

## Prisma і помилка `Unknown field balanceUah`

- **`npm run dev`** автоматично виконує **`prisma generate`** (скрипт `predev`). Це зменшує шанс підняти Next із застарілим `@prisma/client` у пам’яті після зміни схеми.
- Якщо в тексті помилки все ще фігурує **`balanceRub`** — процес `next dev` тримає **старий** згенерований клієнт: **зупиніть** сервер, за потреби видаліть **`web/.next`**, виконайте **`npx prisma generate`**, знову **`npm run dev`**.
- Після зміни `prisma/schema.prisma` виконуйте **`npx prisma db push`** (і при потребі **`prisma generate`** — уже входить у `npm run dev`).
- У Windows якщо `prisma generate` падає з **EPERM** (не вдається перейменувати `query_engine-*.dll`), **зупиніть** `npm run dev` / інші процеси Node, повторіть `generate`.  
- Стара БД з колонкою **`balanceRub`**: перейменуйте колонку (дані збережуться), потім `db push`:

  ```bash
  echo 'ALTER TABLE "User" RENAME COLUMN "balanceRub" TO "balanceUah";' | npx prisma db execute --stdin --schema prisma/schema.prisma
  npx prisma db push
  ```

  Або `npx prisma db push --accept-data-loss` і знову **`npm run db:seed`** (баланси скинуться).

## Демо (лише для локальної розробки)

Після `npm run db:seed` у локальній БД будуть тестові записи (для dev). **У продакшені UI не показує демо-підказок**, а реальні обліковки/дані має створювати громада.

## Важливо для продакшена: оновлення схеми БД

Після змін у `prisma/schema.prisma` (наприклад, додали поле згоди з меморандумом) потрібно синхронізувати **Postgres**:

```bash
cd web
npx prisma db push
```

## Удаление демо-новости “Добро пожаловать…”

Если вы уже сидили БД раньше и в ленте видите демо-новость “Добро пожаловать в Happy Life”, её можно удалить разово:

```bash
cd web
npm run db:cleanup:demo-news
```

## Сборка

```bash
npm run build
npm start
```

## Деплой (Render / Vercel) — заметки

- Для продакшена используйте внешний **Postgres** (Render Postgres / Neon / Supabase и т.д.).
- **Render**:
  - На бесплатных/cheap инстансах часто есть **cold start** (пауза после простоя). Это нормально для MVP/пилота.
  - Лечится: платный план без сна, keep-alive пинг (cron), либо перенос SSR в более «always-on» окружение.
- **Vercel**:
  - Отлично подходит для Next.js и обычно даёт более быстрые старты, но приложение всё равно должно ходить в **внешнюю БД** (Postgres). SQLite-файл на Vercel — плохая идея.
  - Для Prisma на Vercel обычно делают `prisma migrate deploy` на этапе build/deploy и используют пулер/accelerate при необходимости.
  - Если на Vercel падает сборка из‑за `scripts/migrate_sqlite_to_postgres.ts` (нет сгенерированного sqlite-клиента) — скрипт исключён из typecheck в `web/tsconfig.json`.

### Neon (важно)

- Для Prisma **миграций/`db push`** чаще надёжнее использовать **direct endpoint** (не `-pooler`), а `-pooler` оставлять для runtime-коннектов приложения.
- Если указываете `-pooler`, может понадобиться параметр `pgbouncer=true` (зависит от конфигурации Neon).

Минимальный план миграции на Postgres:
1) Заменить `DATABASE_URL` на Postgres.
2) Перейти с `db push` на `prisma migrate dev` (локально) → `prisma migrate deploy` (в проде).
3) Загрузки изображений вынести из `public/uploads` в S3-совместимое хранилище.

### Перенос данных из SQLite в Postgres (один раз)

Если у вас есть локальная SQLite-база (`dev.db`) и нужно перелить данные в Postgres:

1) Сгенерировать отдельный Prisma-клиент для SQLite:

```bash
npm run db:generate:sqlite
```

2) Убедиться, что Postgres-схема создана (на Postgres `DATABASE_URL`):

```bash
npx prisma db push
```

3) Задать SQLite URL (в окружении) и запустить перенос:

```bash
:: Windows (cmd)
set SQLITE_DATABASE_URL=file:./dev.db
npm run db:migrate:sqlite-to-postgres
```

PowerShell:

```bash
$env:SQLITE_DATABASE_URL="file:./dev.db"
npm run db:migrate:sqlite-to-postgres
```

Если Postgres подключение идёт через Neon pooler и периодически отваливается, для переноса можно временно задать **direct** URL:

```bash
$env:POSTGRES_DATABASE_URL="postgresql://USER:PASSWORD@DIRECT_HOST:5432/DB?sslmode=require"
npm run db:migrate:sqlite-to-postgres
```

Скрипт переносит сущности, сохраняя `id` и связи, и использует `createMany(skipDuplicates)` — его можно безопасно запускать повторно.

## Навігація (MVP)

Усі сторінки додатку — під `[locale]`, наприклад `/uk/dashboard`, `/en/community/board`.

- Якщо відкрити сторінку без префікса (наприклад `/register`), middleware автоматично перенаправить на локалізований маршрут (`/uk/register`, `/ru/register`, `/en/register`).

- **Головна** — дашборд, новини, активні голосування, заявки, нагадування.  
- **Заявки** — service desk; фото до заявки; голова/модератор змінюють статус.  
- **Спільнота** — дошка оголошень (текст + фото), форум (тема та відповіді з фото), конфіденційні звернення.  
- **Ще** — профіль, голосування, лічильники, вихід; для модераторів — панель `/chair`.  

Приклади маршрутів: `/uk/votes`, `/uk/meters`, `/uk/chair/users`. Завантажені зображення зберігаються в **`web/public/uploads/`** (у продакшені варто винести в об’єктне сховище).

Реєстрація: **власник чи орендар** (`tenancyType`). Голосування та теми форуму мають поле **аудиторії** (усі / лише власники / лише орендарі); голова бачить усе. При реєстрації потрібна згода з **меморандумом** (сторінка меморандуму публічна: `/{locale}/info/memorandum`). Окремої ролі «адмін платформи» поки немає — панель `/chair` для голови та модератора (модератор: користувачі + конфіденційні звернення + модерація контенту).

## Документація репозиторію

- Огляд продукту: `docs/PROJECT_OVERVIEW.md`  
- Контекст розробки: `docs/DEVELOPMENT_CONTEXT.md`
