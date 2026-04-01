/**
 * iOS-only Expo config (merged in app.config.js).
 * Keep Apple-specific IDs, capabilities, and Info.plist strings here.
 *
 * Bundle ID: must match an App ID in Apple Developer and EAS credentials.
 * buildNumber: increment (or use EAS remote versioning) for each new build you upload
 *   to App Store Connect / TestFlight.
 *
 * Permissions align with app code: expo-image-picker (camera + library), expo-location
 * (foreground GPS on “Use GPS”), react-native-maps (map tiles; pin is manual/GPS only).
 */
module.exports = {
  bundleIdentifier: "gov.cabq.callpat.prototype",
  buildNumber: "1",
  /** Set false if you ship iPhone-only and want to skip iPad-specific store metadata. */
  supportsTablet: true,
  infoPlist: {
    NSCameraUsageDescription:
      "Call Pat uses the camera so you can attach a photo to your field report.",
    NSPhotoLibraryUsageDescription:
      "Call Pat needs access to your photo library so you can attach an existing image to your report.",
    NSLocationWhenInUseUsageDescription:
      "Your location is used to center the map and set the report pin when you choose Use GPS.",
    ITSAppUsesNonExemptEncryption: false,
  },
};
