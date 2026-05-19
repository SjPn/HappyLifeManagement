# Happy Life — внутренний контекст (для преемственности в разработке и ИИ)

Этот файл — **не пользовательская документация**, а рабочая память: решения, риски, расхождения с исходным DOC. **Обновлять в конце каждой сессии.**

## Старт следующей сессии (читать первым)

**Последняя дата апдейта:** 2026-05-19 · Ветка: `main` @ `0b3cef5` · Репо: [SjPn/HappyLifeManagement](https://github.com/SjPn/HappyLifeManagement) · Прод: [hlm-nu.vercel.app](https://hlm-nu.vercel.app) (Vercel + Neon).

**Последние коммиты (`git log -5`):** `0b3cef5` · `3460380` · `bebf269` · `e345407` · `1f4ac97`.

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
| Главная | `DashboardGlance` («Сейчас важно»), баннер долга, новости |
| Заявки | CRUD, модалка, таймлайн, оценка 1–5 после «Решено», push-хуки на сервере |
| Платежи | `HouseholdBilling` по месяцу/дому, реквизиты КГ, копирование с прошлого месяца |
| Сообщество | новости, доска, форум, документы, жители, ЛС 1-на-1 |
| Профиль | модалки «логин/пароль» и «редактировать»; APK в **Ещё** |
| Android | Capacitor WebView → прод; APK `web/public/downloads/happylife.apk` |
| Аналитика | Vercel Speed Insights в `layout.tsx` |

### Push (FCM) — важно

- **Код готов:** `DevicePushToken`, `/api/push/register`, `lib/push/notify.ts`, события в `tickets.ts` / `news.ts`.
- **В APK сейчас выключено:** `NEXT_PUBLIC_ENABLE_NATIVE_PUSH` не `true` → без запроса разрешений (иначе **вылет** без `google-services.json`).
- **Включение:** Firebase → `google-services.json` в `mobile/android/app/` + `FIREBASE_SERVICE_ACCOUNT_JSON` на Vercel + `NEXT_PUBLIC_ENABLE_NATIVE_PUSH=true` + пересборка APK.
- **Telegram-бот:** не реализован; в roadmap (`docs/TODO_ROADMAP.md`).

### Android / APK

- Иконка: `mobile/icon/icon-1024.png`, `npm run icons` в `mobile/`.
- Опубликованный APK: `3460380` (бренд-иконка, ~5 МБ).
- `capacitor.config.ts` → `https://hlm-nu.vercel.app` (исправления UI подтягиваются **без** пересборки APK).

### Схема и деплой

- Prisma + миграции, в т.ч. `20260525120000_push_notifications`.
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

### Быстрые команды (PowerShell)

```powershell
cd e:\MyPyPro\HappyLife\web
npm run build
cd ..\mobile
npm run icons
git -C .. log --oneline -5
```

### Источники истины

| Документ | Назначение |
|----------|------------|
| `docs/TESTER_GUIDE.md` | Гайд для внешних тестировщиков (RU) |
| `docs/PROJECT_OVERVIEW.md` | Видение продукта |
| `docs/PROJECT_EVALUATION.md` | Сравнение с рынком / ДАХ |
| `docs/TODO_ROADMAP.md` | Бэклог |
| `mobile/README.md` | APK, Firebase, иконка |
| `web/README.md` | Локальный запуск |

---

## Источник видения

`e:\MVP_happyLife.docx` — Dashboard, заявки, голосования, доска, форум; роли житель / модератор / председатель.

## Зафиксированные уточнения

1. Нижнее меню: **Главная | Заявки | Сообщество | Ещё**.
2. Чат MVP: форум + ЛС, не замена Telegram-чата КГ.
3. Конфиденциальные обращения: автора видит только модератор.
4. Верификация: invite + адрес из справочника + апрув главы.

## Технические риски

- Push без Firebase → краш нативного слоя (обход: флаг `NEXT_PUBLIC_ENABLE_NATIVE_PUSH`).
- Смена invite-кода → старый сразу недействителен.
- JWT: `AUTH_URL` = фактический origin.

## Деплой

- `AUTH_URL` / `NEXTAUTH_URL` = origin (иначе Auth.js ClientFetchError).
- Git push с Windows: `git -c http.sslBackend=schannel push` при ошибках SSL.
