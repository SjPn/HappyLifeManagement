# Happy Life

Веб-платформа и Android-оболочка для **КГ / ОСМД** (Украина, UAH). Код: **`web/`** (Next.js), **`mobile/`** (Capacitor APK).

| | |
|---|---|
| **Прод** | [https://happylife.estate](https://happylife.estate) |
| **Репо** | [github.com/SjPn/HappyLifeManagement](https://github.com/SjPn/HappyLifeManagement) |
| **Ветка** | `main` |
| **Документация** | этот файл + [docs/HANDBOOK.md](docs/HANDBOOK.md) (разработка, деплой, бэклог) |

## Что это

Единый портал КГ: новости, заявки, голосования, соседи, платежи по дому (счётчики день/ночь), документы, форум, ЛС. Не замена Telegram/WhatsApp — **официальный вход** в жизнь КГ.

**Роли:** житель · глава · модератор · суперадмин платформы (`/platform`).

**Языки:** UA / RU / EN.

## Быстрый старт (разработка)

```powershell
cd web
npm install
copy .env.example .env
# DATABASE_URL, DIRECT_URL (Neon), AUTH_SECRET, AUTH_URL=http://localhost:3000
npx prisma db push
npm run db:seed
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000) → `/uk`.

Подробнее: [docs/HANDBOOK.md](docs/HANDBOOK.md).

## Тестирование (прод)

**Сайт:** [happylife.estate](https://happylife.estate) · **Код КГ:** `HAPPY2026`

| Роль | Email | Пароль |
|------|-------|--------|
| Глава | `chair@hlm.kiev.ua` | `H@ppYL!fe` |
| Житель | `neighbor@happylife.demo` | `demo123` |
| Модератор | `mod@hlm.kiev.ua` | `M0deR@toR$` |

> Демо-логины работают, если seed применялся к продовой БД. Иначе — регистрация с кодом `HAPPY2026`.

**Навигация:** Главная · Заявки · Сообщество · Ещё. Красные цифры на иконках — новое с прошлого визита (у **головы нет** уведомлений по платежам — он сам их вносит).

**Сценарий 30 мин (голова):** подтвердить жителя → новость → заявка «В работе» → «Решено» → платежи: тарифы, показания счётчика, **«Отправить»** жителю.

**APK:** Ещё → «Скачать приложение». Сборка с `https://happylife.estate` (см. handbook). Push в APK выключен до Firebase.

**Ограничения:** нет онлайн-оплаты; Telegram-бот в планах; фото — Cloudflare R2 на проде.

Обратная связь: роль, шаги, ожидание/факт, скриншот → issues на GitHub.

## Стек (кратко)

Next.js 16 · React 19 · Prisma · Postgres (Neon) · Auth.js · next-intl · Tailwind · Capacitor 7 · деплой **Coolify** (Hetzner) · фото **R2**.

## Структура репозитория

```
HappyLife/
  web/           # приложение
  mobile/        # Android (Capacitor)
  docs/
    HANDBOOK.md  # единый справочник разработчика
```

Старые файлы `docs/TESTER_GUIDE.md`, `TODO_ROADMAP.md`, … объединены в **README** и **HANDBOOK** (май 2026).
