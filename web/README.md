# Happy Life — веб-MVP

Платформа для жителів ОСББ/котеджних громад в **Україні**: головна з новинами та голосуваннями, заявки, спільнота (дошка, форум, конфіденційні звернення, каталог мешканців), **платежі за домом по місяцях**, ролі мешканець / модератор / голова. Орієнтація: **гривня (UAH)**.

## Стек

- **Next.js 16** (App Router), React 19, TypeScript  
- **Tailwind CSS 4**  
- **Prisma 5** + **Postgres** (Neon у продакшені)  
- **Auth.js (next-auth v5 beta)** — вхід за email/паролем  
- **next-intl** — `/uk` (default), `/ru`, `/en`

## Запуск локально

```bash
cd web
npm install
cp .env.example .env
# DATABASE_URL → Postgres (Neon direct endpoint для db push)
# AUTH_SECRET, AUTH_URL / NEXTAUTH_URL = http://localhost:3000
npx prisma db push
npm run db:seed
npm run dev
```

Відкрийте [http://localhost:3000](http://localhost:3000) → редірект на `/uk`.

## Схема платежей (важно)

| Модель | Опис |
|--------|------|
| `HouseholdBilling` | Нарахування за **календарний місяць** на адресу (`street`, `houseNumber`, `periodYear`, `periodMonth`, суми, `paidAt`). Історія = окремий рядок на кожен місяць. |
| `User.balanceUah` | Окрема «заборгованість» — голова редагує в `/chair/users`, не плутати з місячним рахунком. |
| `CommunityAddress` | Довідник адрес КГ; голова в `/chair/addresses`; реєстрація через випадаючий список. |

Старі моделі **`HouseholdPayment`**, **`MeterReading`** видалені. Після оновлення схеми на Neon:

```bash
npx prisma db push
```

Якщо на Neon ще була таблиця `HouseholdPayment` **до** push — один раз (поки таблиця існує):

```bash
npx tsx scripts/migrate_household_billing.ts
```

Код на Vercel має бути з комітом, де використовується `householdBilling` (інакше P2021: table HouseholdPayment does not exist).

## Prisma / Auth (типові помилки)

- **`balanceUah` / `balanceRub`:** `npx prisma generate`, перезапуск dev, при потребі `db push`.
- **Auth `Failed to fetch`:** `AUTH_URL` і `NEXTAUTH_URL` = той самий origin, що в браузері (з портом).
- **Sign out:** `SignOutButton` → `signOut({ redirect: false })` + `window.location.assign('/${locale}')`.

## Збірка

```bash
npm run build
npm start
```

## Деплой (Vercel + Neon)

1. **Дві змінні в Vercel** (обовʼязково для збірки з міграціями):
   - `DATABASE_URL` — **pooler** (для роботи застосунку на Vercel).
   - `DIRECT_URL` — **direct** connection string з Neon (рекомендовано).  
     Якщо є лише pooler URL, збірка спробує автоматично прибрати `-pooler` з хоста Neon.
2. Build: `npm run vercel-build` → `prisma db push` (direct URL) + Next build. Не `migrate deploy` — прод і CI історично на `db push`.
3. Нові поля в `schema.prisma` → commit → redeploy (build сам зробить `db push`). Файли в `prisma/migrations/` — для документації / майбутнього baseline.
4. Якщо таймаут на cold start Neon — **Redeploy** один раз; або виконайте локально:  
   `set DIRECT_URL=...` (direct) і `npx prisma migrate deploy`.
4. Завантаження фото: `public/uploads/` (на Vercel ефемерно — винести в S3 згодом).

### Поселок «Щасливе Життя» (production)

- ID: `cm_shchaslyve_zhyttya`
- Код запрошення для реєстрації: **`HAPPY2026`** (з `.env` `INVITE_CODE`)
- Повторна міграція даних: `npm run db:migrate:production`

## Навігація (4 таби)

| Таб | Маршрути |
|-----|----------|
| **Головна** | `/dashboard` — новини, карточка нарахувань (поточний місяць) → `/payments`, превʼю голосувань → `/votes`, заявок → `/requests` |
| **Заявки** | `/requests`, `/requests/new` |
| **Спільнота** | `/community` → дошка, форум, звернення, **мешканці** (`/residents`) |
| **Ще** | `/profile` — профіль, меморандум, панель голови; без дублів платежів/тарифів |

**Голова:** платежі мешканців — `/payments` (перемикач місяця `?y=2026&m=5`). Користувачі та баланс — `/chair/users`. Адреси — `/chair/addresses`.

**Модератор:** таби заявки/спільнота приховані; `/payments` → `/chair`; каталог жителів — з панелі `/chair`.

**Публічно:** `/info/memorandum`, `/info/tariffs`. Старий `/meters` → `/payments`.

## Android APK і push

- APK для завантаження: `public/downloads/happylife.apk` → `/api/download/apk`.
- Збірка: `mobile/README.md`.
- **Push (FCM):** код у `lib/push/`, `DevicePushToken`; у APK **вимкнено** (`NEXT_PUBLIC_ENABLE_NATIVE_PUSH` ≠ `true`) до `google-services.json` — інакше виліт після дозволу сповіщень.

## Документація репозиторію

- `docs/TESTER_GUIDE.md` — гайд для тестувальників (RU)  
- `docs/DEVELOPMENT_CONTEXT.md` — **старт наступної сесії (ІІ)**  
- `docs/PROJECT_OVERVIEW.md` — продукт  
- `docs/TODO_ROADMAP.md` — дорожня карта  
