# Android builds (Google Play)

Internal steps for producing an **Android App Bundle (AAB)** with **EAS Build** and uploading to **Google Play** (e.g. internal testing). The production profile is configured in `eas.json` with `android.buildType: "app-bundle"`, which is what Play requires.

## 1. EAS account

1. Create an [Expo](https://expo.dev) account if you do not have one.
2. Install EAS CLI globally (once per machine): `npm install -g eas-cli`
3. Log in: `eas login`

Link the project on first use from `apps/mobile` (EAS will prompt): `eas build:configure` if you have not already generated `eas.json` (this repo already includes it).

## 2. Install dependencies

From the **monorepo root** (`call-pat-prototype`):

```bash
npm run install:mobile
```

This installs `apps/mobile` in isolation (required because the Expo app is not part of the root npm workspaces).

## 3. Build the AAB

```bash
cd apps/mobile
eas build --platform android --profile production
```

- The **production** profile uses Node 20 and produces an **AAB** suitable for Play Console.
- Versioning: `app.json` supplies `expo.version` (user-visible). Each Play upload must use a higher **`versionCode`** in `config/expo.android.js` than the last uploaded build.

## 4. Download the artifact

When the build finishes, download the **.aab** from the Expo dashboard or the link printed in the terminal.

## 5. Upload to Play Console (internal testing)

1. Open [Google Play Console](https://play.google.com/console) and select the app (create it first if needed; the **application id** must match `package` in `config/expo.android.js`).
2. **Release** → **Testing** → **Internal testing** → create or open a release.
3. Upload the AAB under **App bundles**.
4. Complete release notes and rollout steps as prompted.

Use internal testing to verify installs and signing before promoting to closed/open production tracks.

## 6. Play App Signing

- **Google Play App Signing** is recommended: Google holds the **app signing key** used to sign what users install; you upload builds signed with an **upload key** (EAS manages keystores when you use EAS credentials, or you provide your own).
- First-time setup in Play Console will walk you through upload key registration and optional export of a PEPK if you migrate an existing app.
- Keep backup of upload keystore/credentials in line with your org policy; losing the upload key complicates updates.

## Related

- Adaptive icon assets and safe zone: `docs/ASSETS_ANDROID.md`
- Android-only config: `config/expo.android.js`
