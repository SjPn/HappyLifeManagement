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
Пароли після seed — `docs/TEST_CREDENTIALS.local.md` (не в git).

## Розробка

```powershell
cd web
npm install
copy .env.example .env
# заповнити DATABASE_URL, DIRECT_URL, AUTH_SECRET, INVITE_CODE, SEED_*_PASSWORD, DEMO_AUTO_LOGIN_PASSWORD
npx prisma db push
npm run db:seed
npm run seed:verify
npm run dev
```

Секрети — тільки в `web/.env`.

## Публичное демо

На **главной** и на **/login** — кнопка **«Попробовать демо»** → страница `/demo` (по умолчанию кабинет **собственника**).

**Прод (один раз после деплоя):**

```powershell
cd web
npm run db:seed
npm run demo:verify
```

В **Coolify**: `DEMO_AUTO_LOGIN_PASSWORD` — **то же значение**, что в `.env` при seed (Runtime, затем Redeploy). `DEMO_ENABLED=false` только чтобы выключить демо.

Подробно — `web/.env.example`, локально `docs/HANDBOOK.md` (§3 прод, **§8–10** безопасность / бэкапы / логи, §11 для AI).
