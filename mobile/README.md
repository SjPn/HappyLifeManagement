# Happy Life — Android (Capacitor)

Оболочка открывает продакшен-сайт в WebView (`https://happylife.estate` по умолчанию).

## Иконка приложения

**Мастер:** `mobile/icon/icon-1024.png` (синий градиент, дом — бренд Happy Life).

Пересобрать все `mipmap-*` после замены мастера:

```bash
cd mobile
npm run icons
```

Фон adaptive icon: `#2563EB` (`values/ic_launcher_background.xml`).

Дальше: **Build APK** (ниже) → скопировать в `web/public/downloads/happylife.apk` или R2.

Опционально: splash в `res/drawable*/splash.png`, своя иконка через Android Studio → **Image Asset**.

## Сборка APK

1. Установите [Android Studio](https://developer.android.com/studio) и JDK 17+.
2. В `mobile/`:

```bash
npm install
npx cap add android   # первый раз
export CAPACITOR_SERVER_URL=https://happylife.estate   # Git Bash
npm run sync
npm run open:android
```

Открывать в Android Studio папку **`mobile/android`**, не `mobile/`.

В Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.

Альтернатива без Studio (из `mobile/android`):

```bash
./gradlew assembleDebug          # Git Bash / macOS
.\gradlew.bat assembleDebug      # PowerShell / CMD
```

3. Скопируйте APK в веб-приложение (имя файла в `outputs/apk/debug/` может быть `app-debug.apk` или кастомным, например `HappyLifeManagement.apk`):

```bash
cp android/app/build/outputs/apk/debug/*.apk ../web/public/downloads/happylife.apk
```

Или задайте `NEXT_PUBLIC_APK_URL` на внешний URL (Cloudflare R2, см. `web/public/downloads/README.md`).

**Сейчас на проде:** debug APK, скачивание с сайта — `/api/download/apk` (профиль → «Скачать приложение»).

## Локальная отладка

```bash
CAPACITOR_SERVER_URL=http://10.0.2.2:3000 npm run sync
```

(эмулятор Android → хост `10.0.2.2`)

## Push-уведомления (FCM)

1. [Firebase Console](https://console.firebase.google.com/) → проект → **Add app** → Android, package `ua.happylife.app`.
2. Скачайте `google-services.json` → положите в `mobile/android/app/google-services.json` (не коммитьте секреты в публичный репо при необходимости).
3. **Project settings → Service accounts** → Generate new private key → содержимое JSON одной строкой в Vercel: `FIREBASE_SERVICE_ACCOUNT_JSON`.
4. На сервере (Coolify): `NEXT_PUBLIC_APP_URL=https://happylife.estate`, `AUTH_URL` / `NEXTAUTH_URL` — тот же origin.
5. После добавления плагина:

```bash
cd mobile
npm install
npx cap sync android
```

Пересоберите APK и опубликуйте. В приложении: **Ще →** разрешить уведомления; настройки типов — в блоке «Сповіщення в додатку».

**События:** новая заявка → голова; смена статуса → автор; новость → жители с opt-in «Новини».

**Важно:** без `google-services.json` включение push **ломает APK** (вылет после разрешения). Пока Firebase не настроен, на Vercel **не** ставьте `NEXT_PUBLIC_ENABLE_NATIVE_PUSH=true`. После добавления `google-services.json` — пересобрать APK и включить переменную.

## Кнопка «Назад» Android

В `package.json` есть `@capacitor/app`. После обновления веб-кода:

```bash
cd mobile
npm install
npx cap sync android
```

Пересоберите APK. В приложении системная «Назад» идёт на предыдущий экран (или на логичный родительский, если истории нет).
