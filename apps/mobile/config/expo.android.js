/**
 * Android-only Expo config (merged in app.config.js).
 *
 * Play Store
 * - `package`: Application ID; must match the app you create in Google Play Console.
 * - `versionCode`: Integer that must increase for every upload Google accepts (same `version` string can repeat if you fix a bad build — still bump `versionCode`).
 *
 * Adaptive icon
 * - `backgroundColor`: Keep in sync with `theme.colors.primary` in `lib/theme.ts` (launcher background ring).
 * - Optional `foregroundImage`: Full-bleed 1024×1024 PNG; see `docs/ASSETS_ANDROID.md`. Example:
 *     foregroundImage: "./assets/adaptive-icon.png"
 *   If omitted, Expo uses the root `icon` from app config (see app.json / Expo defaults).
 *
 * Permissions (Expo SDK 52, Android 13+)
 * - Location: `expo-location` (map pin / GPS).
 * - Camera: `expo-image-picker` (`launchCameraAsync`).
 * - Media: `READ_MEDIA_IMAGES` for gallery access on API 33+ (replaces broad storage for images).
 *   Native modules may still merge legacy storage permissions for older API levels via their manifests.
 */
module.exports = {
  package: "gov.cabq.callpat.prototype",
  /** Bump for each Play Store submission that changes the binary. */
  versionCode: 1,
  adaptiveIcon: {
    // Align with lib/theme.ts — primary brand color behind the icon mask.
    backgroundColor: "#1d4ed8",
    // foregroundImage: "./assets/adaptive-icon.png",
  },
  permissions: [
    "ACCESS_COARSE_LOCATION",
    "ACCESS_FINE_LOCATION",
    "CAMERA",
    "READ_MEDIA_IMAGES",
  ],
};
