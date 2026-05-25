# Happy Life

Портал для **котеджних містечок і ОСМД**: [happylife.estate](https://happylife.estate)

**Для мешканців і голови** — у застосунку: **Ще → Як користуватися**.  
Коротка копія для чату КГ: [docs/USER_GUIDE.md](docs/USER_GUIDE.md)

## Репозиторій

| | |
|---|---|
| Код | `web/` |
| Android (Capacitor) | `mobile/` |
| GitHub | [SjPn/HappyLifeManagement](https://github.com/SjPn/HappyLifeManagement) |

Внутрішній справочник розробника — локально `docs/HANDBOOK.md` (не в git).

## Розробка

```powershell
cd web
npm install
copy .env.example .env
npx prisma db push
npm run dev
```

Секрети — тільки в `web/.env`.
