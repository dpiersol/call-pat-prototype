# iOS / Expo image assets

The mobile app does not yet include bitmap icons under `assets/`. **Do not** add `icon` or `splash` paths in `app.config.js` until those files exist, or EAS/local prebuild will fail.

When you add artwork, use the following so Expo SDK 52 can generate the iOS icon set and splash screen.

## App icon (required for store builds)

1. Create a **1024×1024** PNG (no alpha for the main App Store asset; Expo can use a single master for dev builds—follow [Expo app icons](https://docs.expo.dev/develop/user-interface/app-icons/) for current rules).

2. Save as e.g. `apps/mobile/assets/icon.png`.

3. In `app.config.js` (or `app.json` under `expo`), set:

   - `icon`: `./assets/icon.png`

4. Optional iOS marketing icon: under `expo.ios`, set `icon` to the same path or a dedicated `./assets/ios-icon.png` if you need platform-specific cropping (same 1024×1024 baseline).

Expo generates `@1x`/`@2x`/`@3x` sizes during prebuild from the single source image.

## Splash screen (recommended)

1. Create a **splash image** (often **1284×2778** or a square **2048×2048** centered logo on a solid background—match your brand).

2. Save as e.g. `apps/mobile/assets/splash.png`.

3. Under `expo`, add a `splash` object, for example:

   ```json
   "splash": {
     "image": "./assets/splash.png",
     "resizeMode": "contain",
     "backgroundColor": "#ffffff"
   }
   ```

   Use `backgroundColor` aligned with `lib/theme.ts` (`theme.colors.surface` is `#ffffff`) for a consistent launch experience with the rest of the UI.

## Adaptive / Android note

Android adaptive icon guidance is documented separately in `config/expo.android.js` comments. iOS uses the `icon` (and optional `ios.icon`) entries above.
