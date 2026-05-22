# Happy Life

Портал для **котеджних містечок і ОСМД** (Україна): [happylife.estate](https://happylife.estate)

**Як користуватися сайтом** → [docs/USER_GUIDE.md](docs/USER_GUIDE.md)

## Репозиторій

| | |
|---|---|
| Код веб-додатку | `web/` |
| Android (Capacitor) | `mobile/` |
| GitHub | [SjPn/HappyLifeManagement](https://github.com/SjPn/HappyLifeManagement) |

Внутрішня документація (деплой, seed, бэклог) **не в git** — лише локально у власника проєкту.

## Розробка (коротко)

```powershell
cd web
npm install
copy .env.example .env
npx prisma db push
npm run dev
```

Секрети та коди КГ — тільки в `web/.env` (див. `.env.example`).
