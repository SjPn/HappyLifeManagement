# Happy Life — веб-MVP

Платформа для жителів ОСББ/котеджних громад в **Україні**: головна з новинами та голосуваннями, заявки, спільнота (дошка, форум, конфіденційні звернення), лічильники, ролі мешканець / модератор / голова. Орієнтація продукту: **гривня (UAH)**, дати/формати — за обраною мовою.

## Стек

- **Next.js 16** (App Router), React 19, TypeScript  
- **Tailwind CSS 4**  
- **Prisma 5** + **SQLite** (`dev.db` в корне `web/`)  
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

## Демо-акаунти (після `db:seed`)

| Email | Пароль | Роль |
|-------|--------|------|
| chair@happylife.demo | demo123 | Голова |
| mod@happylife.demo | demo123 | Модератор |
| neighbor@happylife.demo | demo123 | Мешканець |

## Сборка

```bash
npm run build
npm start
```

## Навігація (MVP)

Усі сторінки додатку — під `[locale]`, наприклад `/uk/dashboard`, `/en/community/board`.

- **Головна** — дашборд, новини, активні голосування, заявки, нагадування.  
- **Заявки** — service desk; фото до заявки; голова/модератор змінюють статус.  
- **Спільнота** — дошка оголошень (текст + фото), форум (тема та відповіді з фото), конфіденційні звернення.  
- **Ще** — профіль, голосування, лічильники, вихід; для модераторів — панель `/chair`.  

Приклади маршрутів: `/uk/votes`, `/uk/meters`, `/uk/chair/users`. Завантажені зображення зберігаються в **`web/public/uploads/`** (у продакшені варто винести в об’єктне сховище).

## Документація репозиторію

- Огляд продукту: `docs/PROJECT_OVERVIEW.md`  
- Контекст розробки: `docs/DEVELOPMENT_CONTEXT.md`
