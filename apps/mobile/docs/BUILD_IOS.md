# Building and releasing iOS (TestFlight / App Store)

This document covers **EAS Build** and **EAS Submit** for `apps/mobile` (Expo SDK 52, React Native 0.76).

## Prerequisites

1. **Apple Developer Program** membership (paid account) to create certificates, identifiers, and App Store Connect records.

2. **App Store Connect**: an app record with the same **bundle identifier** as in `config/expo.ios.js` (`gov.cabq.callpat.prototype` unless you change it everywhere consistently).

3. **Expo account**: sign up at [expo.dev](https://expo.dev) and install EAS CLI globally if you prefer (`npm install -g eas-cli`), or use `npx eas-cli`.

4. **Node.js 20+** (aligned with `eas.json` production `node` version).

## Install dependencies

From the **repository root** (`call-pat-prototype`):

```bash
npm run install:mobile
```

This installs `apps/mobile` separately (the Expo app is not hoisted in the root workspace).

```bash
cd apps/mobile
```

## Log in to EAS

```bash
eas login
```

Ensure `apps/mobile/eas.json` exists and the `production` profile is the one you use for store builds (it already sets Node 20.18.3 and iOS `resourceClass`).

## Configure project ID (first time)

If the app is not yet linked to an Expo project, run from `apps/mobile`:

```bash
eas init
```

Commit any updates EAS writes (for example `extra.eas.projectId` in config) so CI and teammates share the same project.

## Environment and API URL

- For **development**, copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` as documented in the root README.

- For **production/TestFlight builds**, set `EXPO_PUBLIC_API_URL` to your deployed API URL via **EAS Secrets** or **`.env` for build** (see [EAS Environment variables](https://docs.expo.dev/build-reference/variables/)) so the binary does not point at localhost.

Example (EAS secret for production profile):

```bash
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://api.example.com --type string
```

Adjust naming to match how your app reads env at build time (`app.config.js` can expose `extra` if you prefer non-public vars).

## Signing and credentials

EAS can create and store **distribution certificates** and **provisioning profiles** for you (`eas build` prompts on first iOS build). For teams, document who owns the Apple account and use [EAS credentials](https://docs.expo.dev/app-signing/app-credentials/) as the single source of truth.

Secrets commonly used for automation (optional):

- **App Store Connect API key** (for `eas submit` non-interactive): `ASC_API_KEY_ID`, `ASC_API_KEY_ISSUER_ID`, `ASC_API_KEY_PATH` (or paste key content per EAS docs), plus Apple ID / app-specific password if using alternate flows.

Store these in EAS or your CI secrets manager—never commit keys.

## Production build

From `apps/mobile`:

```bash
eas build --platform ios --profile production
```

- **Versioning**: root `eas.json` uses `"appVersionSource": "remote"`, so **version** / **build number** can be managed in App Store Connect / EAS rather than only in `app.config.js`. Still bump `config/expo.ios.js` `buildNumber` when you want the native project to reflect a new build, or rely on EAS auto-increment if you add that to the profile.

- Wait for the build to finish; download the `.ipa` from the Expo dashboard if needed.

## Submit to App Store Connect / TestFlight

### Option A: EAS Submit

```bash
eas submit -p ios --profile production
```

Follow prompts to pick the latest build or a specific artifact. With App Store Connect API credentials configured, this can run in CI.

### Option B: Manual upload

1. Download the **.ipa** from EAS.
2. Use **Transporter** (Mac) or **altool**/**notary** workflows, or **Xcode Organizer** if you export from Xcode, to upload to App Store Connect.
3. In App Store Connect, open the build, complete **export compliance** (the app sets `ITSAppUsesNonExemptEncryption` to `false` for standard HTTPS-only crypto), add **TestFlight** testers, then submit for review when ready.

## Quick checklist

- [ ] Bundle ID matches Apple Developer App ID and `config/expo.ios.js`.
- [ ] Icons/splash: see `docs/ASSETS_IOS.md` before enabling `icon` / `splash` in config.
- [ ] `EXPO_PUBLIC_API_URL` (or equivalent) points at production for release builds.
- [ ] Privacy usage strings in `config/expo.ios.js` match actual features (camera, photo library, location when in use).
