# APK downloads

Після зміни **іконки** або `versionCode` у `mobile/android` — знову скопіювати APK сюди й задеплоїти (або `npm run upload:apk` → R2).

1. Build APK from `mobile/` (see `mobile/README.md` — розділ «Іконка и брендинг»).
2. Copy to `happylife.apk` in this folder **or** upload to R2:

```bash
cd web
npm run upload:apk
```

3. Set `NEXT_PUBLIC_APK_URL` in Vercel to the printed URL (if using R2).

The site serves downloads via `/api/download/apk`.
