# Where to see EAS build progress and reports

EAS **does not** show build logs only in this repo. All cloud builds are tracked on **Expo’s servers**, and you use the **Expo dashboard** plus the **CLI**.

## Web dashboard (primary)

1. Sign in at **[expo.dev](https://expo.dev)** (same account as `eas login`).
2. Open **Dashboard** → **Projects** → select the project linked to this app (slug from `app.json`: **`call-pat-mobile`** after `eas init` links it).
3. Open the **Builds** tab.  
   - You’ll see each **iOS** and **Android** build, status (queued / in progress / finished / failed), duration, and logs.
   - Click a build row for the **full log**, artifact download (**IPA** / **AAB** / **APK**), and shareable URL.

**URL pattern** (after the project exists under your account):

`https://expo.dev/accounts/<your-expo-username>/projects/call-pat-mobile/builds`

Replace `<your-expo-username>` with your Expo account slug (visible in the dashboard URL when you’re logged in).

## Terminal (when you start a build)

Running:

```bash
cd apps/mobile
npm run eas -- build --platform ios --profile production
# or
npm run eas -- build --platform android --profile production
```

prints a line like **“Build details:”** with a **direct link** to that build’s page. Keep that terminal open for high-level status; open the link for full logs.

## CLI without the browser

From `apps/mobile`, after logging in:

```bash
npm run eas -- build:list
npm run eas -- build:view
```

Use `eas build:view --help` for options (e.g. viewing a specific build ID).

## Email / notifications

In **[expo.dev](https://expo.dev)** → account **Settings**, you can enable notifications for failed or finished builds (options depend on Expo’s current UI).

## Store-side status (after submit)

- **iOS:** [App Store Connect](https://appstoreconnect.apple.com) → your app → **TestFlight** or **App Store** tab (processing, review, release).
- **Android:** [Google Play Console](https://play.google.com/console) → **Release** / **Testing** (processing, rollout).

These are separate from Expo; EAS only **uploads** artifacts when you run `eas submit` or manual upload.
