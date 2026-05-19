# Happy Life — Android (Capacitor)

Оболочка открывает продакшен-сайт в WebView (`https://hlm-nu.vercel.app` по умолчанию).

## Иконка и брендинг (TODO)

Сейчас в APK стоят **стандартные иконки Capacitor** (зелёный «C»). Перед пилотом для жителей нужно:

1. **Придумать иконку** Happy Life (узнаваемый символ, читается в 48×48 dp).
2. Подготовить **мастер** 1024×1024 PNG (без прозрачности для adaptive foreground — или отдельно foreground + фон).
3. Заменить ресурсы в Android-проекте:
   - `android/app/src/main/res/mipmap-*/ic_launcher.png`
   - `android/app/src/main/res/mipmap-*/ic_launcher_round.png`
   - `android/app/src/main/res/mipmap-*/ic_launcher_foreground.png` (adaptive)
   - `android/app/src/main/res/drawable/ic_launcher_background.xml` или цвет в `values/ic_launcher_background.xml`
   - splash: `android/app/src/main/res/drawable*/splash.png` (опционально)
4. Удобно: Android Studio → **File → New → Image Asset** (тип *Launcher Icons*), выбрать PNG/SVG, сгенерировать все плотности.
5. Поднять версию в `android/app/build.gradle` (`versionCode`, `versionName`), затем пересобрать APK и опубликовать (см. ниже).

После смены иконки **обязательно** новый APK в `web/public/downloads/happylife.apk` (или R2) и деплой — иначе на сайте останется старый файл.

## Сборка APK

1. Установите [Android Studio](https://developer.android.com/studio) и JDK 17+.
2. В `mobile/`:

```bash
npm install
npx cap add android   # первый раз
export CAPACITOR_SERVER_URL=https://hlm-nu.vercel.app   # Git Bash
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
4. На Vercel также: `NEXT_PUBLIC_APP_URL=https://hlm-nu.vercel.app`.
5. После добавления плагина:

```bash
cd mobile
npm install
npx cap sync android
```

Пересоберите APK и опубликуйте. В приложении: **Ще →** разрешить уведомления; настройки типов — в блоке «Сповіщення в додатку».

**События:** новая заявка → голова; смена статуса → автор; новость → жители с opt-in «Новини».
