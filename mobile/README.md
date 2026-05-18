# Happy Life — Android (Capacitor)

Оболочка открывает продакшен-сайт в WebView.

## Сборка APK

1. Установите [Android Studio](https://developer.android.com/studio) и JDK 17+.
2. В `mobile/`:

```bash
npm install
npx cap add android   # первый раз
export CAPACITOR_SERVER_URL=https://hlm-nu.vercel.app
npm run sync
npm run open:android
```

В Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.

3. Скопируйте APK в веб-приложение:

```bash
cp android/app/build/outputs/apk/debug/app-debug.apk ../web/public/downloads/happylife.apk
```

Или задайте `NEXT_PUBLIC_APK_URL` на внешний URL (GitHub Releases).

## Локальная отладка

```bash
CAPACITOR_SERVER_URL=http://10.0.2.2:3000 npm run sync
```

(эмулятор Android → хост `10.0.2.2`)
