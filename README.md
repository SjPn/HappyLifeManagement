# Happy Life

Веб-платформа и Android-оболочка для **КГ / ОСМД** (Украина, UAH). Код в **`web/`**, APK в **`mobile/`**.

**Прод:** [hlm-nu.vercel.app](https://hlm-nu.vercel.app) · **Репо:** [github.com/SjPn/HappyLifeManagement](https://github.com/SjPn/HappyLifeManagement) · ветка `main` @ `4df7e07`

## Документация

| Документ | Для кого |
|----------|----------|
| [Гайд для тестировщиков](docs/TESTER_GUIDE.md) | Внешние тесты, бизнес-логика |
| [Контекст разработки](docs/DEVELOPMENT_CONTEXT.md) | ИИ / следующая сессия |
| [Обзор продукта](docs/PROJECT_OVERVIEW.md) | Видение |
| [Дорожная карта](docs/TODO_ROADMAP.md) | Бэклог |
| [Оценка vs рынок](docs/PROJECT_EVALUATION.md) | ДАХ, конкуренты |
| [Android APK](mobile/README.md) | Сборка, Firebase, кнопка «Назад» |
| [Запуск web](web/README.md) | Локальная разработка |

## Сейчас в проде (кратко)

- Multi-tenant: несколько КГ, invite-коды, роли житель / глава / модератор / суперадмин.
- Заявки, голосования, платежи по дому, документы, форум, доска, ЛС.
- **Платежи (голова):** счётчик день/ночь, тарифы КГ (один раз), **«Отправить»** жителю, бейдж «Отправлено»; тарифы и реквизиты — сворачиваемый блок на `/payments`.
- **Навигация:** кнопка «← Назад» на вложенных экранах; тарифы/меморандум с нижним меню; в **новом APK** — системная кнопка «Назад» Android.
- Главная: блок **«Сейчас важно»**, реквизиты оплаты.
- **APK** (`4df7e07`): бренд-иконка, `@capacitor/app` — скачивание в **Ещё** → `/api/download/apk`.
- **Push в APK:** код на сервере есть, в приложении **выключен** до Firebase (см. `mobile/README.md`).
- **Telegram-бот:** в планах, не в коде.

## Быстрый старт (разработка)

```powershell
cd web
npm install
cp .env.example .env
npx prisma db push
npm run db:seed
npm run dev
```
