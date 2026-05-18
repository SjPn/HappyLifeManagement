-- Название и код приглашения поселка «Щасливе Життя»
UPDATE "Community"
SET
    "name" = 'Щасливе Життя',
    "slug" = 'shchaslyve-zhyttya',
    "inviteCode" = 'HAPPY2026',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" IN ('cm_default_community', 'cm_shchaslyve_zhyttya')
   OR "slug" IN ('default', 'shchaslyve-zhyttya', 'lesnaya-demo');

-- Целевой поселок, если таблица пустая
INSERT INTO "Community" ("id", "slug", "name", "inviteCode", "defaultLocale", "updatedAt")
SELECT 'cm_shchaslyve_zhyttya', 'shchaslyve-zhyttya', 'Щасливе Життя', 'HAPPY2026', 'uk', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Community");

-- Перенос строк со старого cm_default_community (скрипт migrate_shchaslyve_zhyttya.ts доделает при необходимости)
