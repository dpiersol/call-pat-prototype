/**
 * Single design system for iOS and Android (Expo / React Native).
 * All screens should import from here so both platforms stay visually aligned.
 */
export const theme = {
  colors: {
    primary: "#1d4ed8",
    text: "#0f172a",
    muted: "#64748b",
    border: "#cbd5e1",
    borderLight: "#e2e8f0",
    error: "#b91c1c",
    surface: "#ffffff",
    onPrimary: "#ffffff",
    timelineBorder: "#e2e8f0",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    sectionBottom: 40,
  },
  radius: {
    sm: 8,
    pill: 999,
  },
  font: {
    titleLarge: 26,
    title: 22,
    section: 18,
    body: 16,
    small: 14,
  },
} as const;

export type Theme = typeof theme;

/** Stack / header chrome — same on iOS and Android */
export const navigationTheme = {
  headerStyle: { backgroundColor: theme.colors.surface },
  headerTintColor: theme.colors.primary,
  headerTitleStyle: { fontWeight: "600" as const, color: theme.colors.text },
  headerShadowVisible: true,
  contentStyle: { backgroundColor: theme.colors.surface },
};
