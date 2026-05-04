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

## Prisma і помилка `Unknown field balanceUah`

- Після зміни `prisma/schema.prisma` завжди виконуйте **`npx prisma db push`** і **`npx prisma generate`**.  
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
