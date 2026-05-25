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

**Демо на головній (прод):** після деплою коду з кнопками «Председатель / Собственник / Арендатор» один раз:

```powershell
cd web
# у .env або в Coolify: DEMO_AUTO_LOGIN_PASSWORD=<довгий-секрет>
# також INVITE_CODE, SEED_ADMIN_PASSWORD, SEED_CHAIR_PASSWORD, SEED_MOD_PASSWORD, SEED_RESIDENT_PASSWORD
npm run db:seed
```

Той самий `DEMO_AUTO_LOGIN_PASSWORD` має бути в Coolify (`DEMO_ENABLED` не `false`). Деталі — `web/.env.example`, локально `docs/HANDBOOK.md`.
