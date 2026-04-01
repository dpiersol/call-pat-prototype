# Android adaptive icon (optional)

If you have not added a dedicated **adaptive icon foreground** yet, Expo falls back to the project **icon** from app configuration. For Play Store polish, you can add a full-size foreground asset and reference it from `config/expo.android.js` (see comments there).

## Safe zone

Adaptive icons are **masked** (circle, squircle, or rounded square depending on OEM). Treat the full 1024×1024 canvas as the **safe layer**, but keep critical logo or glyph content inside the **central safe zone** so nothing important is clipped:

- **Material Design guideline:** Important content should fit within a **circle with diameter ~66%** of the canvas (centered). Content can extend into the outer third for visual richness, but expect that outer band to be cropped on some devices.

When you add `foregroundImage` (e.g. `./assets/adaptive-icon.png`):

- Use **1024×1024** PNG (no transparency required for the foreground layer; transparency is supported where the mask should show the `backgroundColor` from config).
- Match `backgroundColor` in `config/expo.android.js` to `theme.colors.primary` in `lib/theme.ts` so the launcher matches the in-app brand color.
