# Happy Life — внутренний контекст (для преемственности в разработке и ИИ)

Этот файл — **не пользовательская документация**, а рабочая память: решения, риски, расхождения с исходным DOC. **Обновлять в конце каждой сессии.**

## Старт следующей сессии (читать первым)

**Последняя дата апдейта:** 2026-05-20 · Ветка: `main` @ `4df7e07` · Репо: [SjPn/HappyLifeManagement](https://github.com/SjPn/HappyLifeManagement) · Прод: [hlm-nu.vercel.app](https://hlm-nu.vercel.app) (Vercel + Neon).

**Последние коммиты (`git log -8`):** `4df7e07` · `12d7248` · `bf251a8` · `55032ba` · `6ca9cb3` · `5a940a0` · `7214568` · `aaabe6f`.

### Архитектура (актуально)

- **Multi-tenant SaaS:** `Community`, `communityId`. Один деплой — много КГ.
- **Роли:** `RESIDENT`, `MODERATOR`, `CHAIR`, `PLATFORM_ADMIN`.
- **Онбординг КГ:** `/register-community` → апрув суперадмином (`Community.approvedAt`).
- **Регистрация жителя:** только с **кодом приглашения**; код меняет глава в **Ещё**.
- **Суперадмин:** `/platform/communities` — CRUD КГ, блокировка, председатели (подтверждение кодом поселка).

### Что работает (функционально)

| Область | Заметки |
|--------|---------|
| Локали | `/uk`, `/ru`, `/en`; переключатель **UA / RU / EN** |
| Главная | `DashboardGlance` («Сейчас важно»), баннер долга, новости; safe-area для названия КГ в `AppShell` |
| Заявки | CRUD, модалка, таймлайн, оценка 1–5 после «Решено», push-хуки на сервере |
| Платежи | `HouseholdBilling` по месяцу/дому; реквизиты; копирование с прошлого месяца |
| **Счётчики (голова)** | `HouseholdMeterReading` по периоду; тарифы на `Community` (`electricityDayRateUah` / `electricityNightRateUah`); авторасчёт → `electricityUah`; кнопка **«Отправить»** → `paymentSentAt` + модалка |
| **Тарифы/реквизиты UI** | Сворачиваемый блок «Тарифи та реквізити» на `/payments` (не отдельная страница) |
| Инфо-страницы | `/info/tariffs`, `/info/memorandum` в группе `(app)` — **есть нижнее меню** + `PageBackLink` → профиль |
| Сообщество | новости, доска, форум, документы, жители, ЛС 1-на-1 |
| Профиль | модалки «логин/пароль» и «редактировать»; APK в **Ещё** |
| **Навигация** | `PageBackLink` + `backHref` в `PageTitle`; `getBackFallback()`; `AndroidBackButtonHandler` в `AppShell` |
| Android | Capacitor WebView → прод; APK `web/public/downloads/happylife.apk`; плагины `@capacitor/app`, `@capacitor/push-notifications` |
| Аналитика | Vercel Speed Insights в `layout.tsx` |

### Платежи / счётчики (детали для кода)

- **Тарифы:** поля на `Community`, не по месяцам. Миграция `20260528120000_community_electricity_rates` (удалена `CommunityElectricityTariff`).
- **Показания:** `HouseholdMeterReading` — накопительные day/night за `periodYear`/`periodMonth`; разница с прошлым месяцем.
- **Отправка жителю:** `setHouseholdPayments` ставит `paymentSentAt`; при смене сумм — сброс `paymentSentAt` (и `paidAt` при изменении сумм).
- **UI:** `HouseholdPaymentEditor` синхронизирует поле «Електроенергія» после «Рассчитать и сохранить».
- **Ключевые файлы:** `lib/electricity.ts`, `actions/electricity.ts`, `PaymentsTariffsRequisitesPanel.tsx`, `PaymentEditForm.tsx`.

### Навигация / Android back (детали)

- `web/src/lib/backNavigation.ts` — fallback-маршруты без history.
- `web/src/lib/capacitorApp.ts` — `registerPlugin('App')` без отдельного npm-пакета в web (нативный плагин в APK).
- На табах (`/dashboard`, `/profile`, …) при пустой history → `App.minimizeApp()`.
- После `cap sync` в APK: `@capacitor/app@7.1.2`.

### Push (FCM) — важно

- **Код готов:** `DevicePushToken`, `/api/push/register`, `lib/push/notify.ts`, события в `tickets.ts` / `news.ts`.
- **В APK сейчас выключено:** `NEXT_PUBLIC_ENABLE_NATIVE_PUSH` не `true` → без запроса разрешений (иначе **вылет** без `google-services.json`).
- **Включение:** Firebase → `google-services.json` в `mobile/android/app/` + `FIREBASE_SERVICE_ACCOUNT_JSON` на Vercel + `NEXT_PUBLIC_ENABLE_NATIVE_PUSH=true` + пересборка APK.
- **Telegram-бот:** не реализован; в roadmap (`docs/TODO_ROADMAP.md`).

### Android / APK

- Иконка: `mobile/icon/icon-1024.png`, `npm run icons` в `mobile/`.
- Опубликованный APK: `4df7e07` (~5.2 МБ, back button + App plugin).
- `capacitor.config.ts` → `https://hlm-nu.vercel.app` (исправления UI на сайте подтягиваются **без** пересборки APK; **новый APK** нужен для системной «Назад»).

### Схема и деплой

- Prisma + миграции, в т.ч.:
  - `20260526120000_electricity_meter_readings`
  - `20260527120000_household_payment_sent` (`paymentSentAt`)
  - `20260528120000_community_electricity_rates`
- **Neon:** при расхождении `_prisma_migrations` и схемы — `prisma migrate resolve --applied <name>` (см. историю сессии).
- Vercel: `vercel-build` = migrate + `next build`.
- Фото: R2 (env в `.env.example`); `public/uploads` эфемерен на Vercel.

### Известные не-блокеры

- Нет онлайн-оплаты, SMS, Telegram-бота.
- `middleware.ts` → позже `proxy.ts` (Next 16 warning).
- Release APK (keystore) — в бэклоге.
- `docs/PROJECT_EVALUATION.md` — обновлять дату/коммит после крупных релизов.

### Паттерны UI

- Список → модалка; при модалке `body.hl-modal-open` скрывает нижний таб-бар (`modalOverlay.ts`).
- Опасные действия суперадмина → модалка + код приглашения.
- Вложенные экраны: `PageTitle` + `backHref`; не полагаться только на текстовую ссылку внизу.

### Быстрые команды (PowerShell)

```powershell
cd e:\MyPyPro\HappyLife\web
npm run build
cd ..\mobile
npm install
npx cap sync android
# APK → web/public/downloads/happylife.apk, затем git push
git -C .. log --oneline -8
```

### Источники истины

| Документ | Назначение |
|----------|------------|
| `docs/TESTER_GUIDE.md` | Гайд для внешних тестировщиков (RU) |
| `docs/PROJECT_OVERVIEW.md` | Видение продукта |
| `docs/PROJECT_EVALUATION.md` | Сравнение с рынком / ДАХ |
| `docs/TODO_ROADMAP.md` | Бэклог |
| `mobile/README.md` | APK, Firebase, иконка, back button |
| `web/README.md` | Локальный запуск |

---

## Источник видения

`e:\MVP_happyLife.docx` — Dashboard, заявки, голосования, доска, форум; роли житель / модератор / председатель.

## Зафиксированные уточнения

1. Нижнее меню: **Главная | Заявки | Сообщество | Ещё**.
2. Чат MVP: форум + ЛС, не замена Telegram-чата КГ.
3. Конфиденциальные обращения: автора видит только модератор.
4. Верификация: invite + адрес из справочника + апрув главы.
5. Тарифы на свет — **на уровне КГ**, не пересоздавать каждый месяц.

## Технические риски

- Push без Firebase → краш нативного слоя (обход: флаг `NEXT_PUBLIC_ENABLE_NATIVE_PUSH`).
- Смена invite-кода → старый сразу недействителен.
- JWT: `AUTH_URL` = фактический origin.
- Prisma migrate на Neon: дубли колонок → `migrate resolve`, не `reset`.

## Деплой

- `AUTH_URL` / `NEXTAUTH_URL` = origin (иначе Auth.js ClientFetchError).
- Git push с Windows: `git -c http.sslBackend=schannel push` при ошибках SSL.
- Обновление APK: `mobile/android/.../happylife.apk` → `web/public/downloads/happylife.apk` → commit → Vercel.
