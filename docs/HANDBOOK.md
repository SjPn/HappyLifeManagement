# Happy Life — справочник разработчика

Единый документ: архитектура, локальная разработка, прод (Coolify), env, APK, бэклог, заметки для AI-сессий.

**Прод:** [https://happylife.estate](https://happylife.estate) · **Репо:** `SjPn/HappyLifeManagement` · **Ветка:** `main`

---

## 1. Продукт и архитектура

**Модель:** одна платформа → много КГ (`Community`). Пользователь привязан к КГ через `CommunityMember` (роли: `RESIDENT`, `CHAIR`, `MODERATOR`, `PLATFORM_ADMIN`).

**Основные модули:**

| Модуль | Описание |
|--------|----------|
| Новости | Публикации главы, комментарии |
| Заявки | Тикеты жителей, статусы, вложения |
| Голосования | Опросы совета |
| Соседи | Каталог домохозяйств |
| Платежи | Тарифы, счётчики (день/ночь), начисления, «отправлено» / «оплачено», **история изменений по дому** |
| Документы | Файлы КГ |
| Форум / ЛС | Обсуждения, личные сообщения |
| `/platform` | Суперадмин: КГ, коды регистрации |

**Стек:** Next.js 16 (App Router) · React 19 · Prisma · PostgreSQL (Neon) · Auth.js v5 · next-intl · Tailwind 4 · Capacitor 7.

**Хостинг (2026):** Coolify на Hetzner, не Vercel. Vercel можно оставить на паузе (отключить Git / `exit 0` в build) — Speed Insights на Coolify даёт 404, это нормально.

---

## 2. Локальная разработка

```powershell
cd e:\MyPyPro\HappyLife\web
npm install
copy .env.example .env
```

**Обязательные переменные (.env):**

| Переменная | Назначение |
|------------|------------|
| `DATABASE_URL` | Neon pooled connection |
| `DIRECT_URL` | Neon direct (миграции) |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` / `NEXTAUTH_URL` | `http://localhost:3000` локально |

```powershell
npx prisma db push
npm run db:seed
npm run dev
```

Локаль: [http://localhost:3000/uk](http://localhost:3000/uk).

**Seed-демо:** см. таблицу логинов в [README.md](../README.md). Пароли только для dev/demo — **не коммитить** реальные prod-секреты.

**Полезные команды:**

```powershell
npm run vercel-build   # production build (как на Coolify)
npm run lint
npx prisma migrate dev
npx prisma studio
```

---

## 3. Продакшен (Coolify)

**Приложение в Coolify:**

| Параметр | Значение |
|----------|----------|
| Base directory | `/web` |
| Build | `npm run vercel-build` |
| Start | `npm run start -- -p 3000` |
| Port | `3000` |
| Domain | `https://happylife.estate` |

**DNS:** A-запись на IP сервера Hetzner (не parking GoDaddy). Let's Encrypt через Coolify.

**Env на Coolify (минимум):**

```
DATABASE_URL=...
DIRECT_URL=...
AUTH_SECRET=...          # уникальный, длинный
AUTH_URL=https://happylife.estate
NEXTAUTH_URL=https://happylife.estate
NEXT_PUBLIC_APP_URL=https://happylife.estate

# R2 (S3-совместимый API Cloudflare)
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_PUBLIC_BASE_URL=https://...   # публичный URL bucket/custom domain
```

Не использовать Cloudflare API token `cfat_` для загрузки файлов — нужны **S3 Access Key + Secret**.

После изменений схемы Prisma: `npx prisma migrate deploy` в build или вручную на проде.

**Типичные ошибки:**

| Симптом | Решение |
|---------|---------|
| `npm ci` EUSAGE / missing package | Синхронизировать `package-lock.json`, push |
| `/api/auth/session` 500 | `AUTH_SECRET` + корректные `AUTH_URL` / `NEXTAUTH_URL` |
| Сайт «Launching Soon» / неверный IP | DNS A → Hetzner |
| Chrome «не защищено» при валидном LE | Очистить данные сайта / инкогнито (старый exception) |

---

## 4. Файлы и фото (R2)

Загрузки через S3 API к bucket R2. Публичные URL через `R2_PUBLIC_BASE_URL`. Локально без R2 загрузки могут не работать — настроить те же ключи в `.env` или тестировать на проде.

---

## 5. Android (Capacitor)

**Каталог:** `mobile/`

**Prod URL в конфиге:** `https://happylife.estate` (`capacitor.config.ts`, `web/src/lib/push/appUrl.ts`).

```powershell
cd mobile
npm install
npx cap sync android
# Android Studio → Build APK
```

**Публикация APK:**

1. Собрать в Android Studio.
2. Скопировать в `web/public/downloads/happylife.apk` и задеплоить **или** `cd web && npm run upload:apk` (R2) + `NEXT_PUBLIC_APK_URL`.
3. Сайт отдаёт `/api/download/apk`.

**Иконка:** `mobile/icon/icon-1024.png` → `cd mobile && npm run icons` (бренд `#2563eb`, `#0ea5e9`).

Push (FCM) — в бэклоге; сейчас APK = WebView на прод-URL.

---

## 6. Ключевые паттерны кода

- **Server Actions** в `web/src/app/actions/` — мутации, revalidate.
- **i18n:** `web/messages/{uk,ru,en}.json`, маршруты `[locale]`.
- **Деньги:** `web/src/lib/money.ts` — целые гривны, без копеек в UI (`1 101 ₴`).
- **Уведомления:** `web/src/lib/notifications.ts` — бейджи; у `CHAIR` нет счётчика платежей; жители — по `paymentSentAt`.
- **Аудит платежей:** `HouseholdBillingAuditLog`, модалка истории, логи в `chair.ts`, `billing.ts`, `electricity.ts`.

---

## 7. Бэклог (сжато)

### Сделано (недавно)

- [x] Пилот «Щасливе Життя» на **happylife.estate** (Coolify).
- [x] Платежи: бейджи «оплачено» / «отправлено», формат UAH без копеек.
- [x] История изменений по дому за месяц (audit log).
- [x] Уведомления: заявки с маркером; голова без payment-badge.
- [x] APK на прод-URL, ссылка в «Ещё».
- [x] Сворачиваемый блок счётчиков (как тарифы).

### В работе / следующее

- [~] Тесты: e2e регистрация; расширить platform/multi-tenant.
- [~] Пилот: подключить 2–3 КГ.
- [ ] Итерация UX по обратной связи.
- [ ] **Telegram-бот** (уведомления: заявки, новости, долги) — отдельный webhook-сервис, `telegramChatId`, opt-in (~2–3 дня).
- [~] Push FCM в APK (Firebase, токены в БД).
- [ ] Онлайн-оплата взносов (после пилота).
- [ ] Расширенная аналитика для совета.

**Уведомления:** для пилота приоритет **Telegram** (как у конкурентов); FCM в APK — фаза после бота.

---

## 8. Безопасность

- Секреты только в env (Coolify / локальный `.env`), **не в git**.
- При утечке в чате: ротировать `AUTH_SECRET`, R2 keys, сменить demo-пароли на проде если seed применялся.
- `.env.example` — шаблон без значений.

---

## 9. Заметки для AI-сессий

**Якорь:** прод `happylife.estate`, деплой Coolify `/web`, ветка `main`.

**Последние темы (май 2026):** lockfile для `npm ci`; DNS/HTTPS; auth env; R2; audit billing; notification badges; money format; APK URL; collapsible meter form.

**Не путать:** Vercel — legacy; основной прод — Coolify + Neon + R2.

При продолжении работы читать этот файл и [README.md](../README.md); не восстанавливать удалённые `TESTER_GUIDE.md`, `TODO_ROADMAP.md`, `PROJECT_OVERVIEW.md`, `DEVELOPMENT_CONTEXT.md`.

---

*Обновлено: май 2026. Вся документация проекта — README + этот handbook.*
