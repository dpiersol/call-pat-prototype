/**
 * CABQ 311 — design tokens aligned with web-admin CSS (--cabq-*).
 * Single source for spacing, radii, and semantic colors on iOS + Android.
 */
import { Platform } from "react-native";

export const theme = {
  colors: {
    /** Primary actions — matches --cabq-blue */
    primary: "#3498db",
    primaryLight: "#5dade2",
    primaryDeep: "#2e86c2",
    /** Accent — matches --cabq-red */
    accent: "#d4183d",
    accentDark: "#b01530",
    text: "#1a2b1e",
    textInverse: "#ffffff",
    muted: "#5c6b73",
    mutedOnDark: "rgba(255,255,255,0.88)",
    border: "#cfd8e3",
    borderLight: "#e4edf5",
    error: "#b91c1c",
    success: "#0d9488",
    surface: "#ffffff",
    /** Page canvas — --cabq-sand */
    canvas: "#eef5fb",
    canvasAlt: "#e8f4fc",
    overlay: "rgba(15, 23, 42, 0.45)",
    timeline: "#3498db",
    timelineTrack: "#e4edf5",
    chipInactive: "#f1f5f9",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    sectionBottom: 48,
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 20,
    pill: 999,
  },
  font: {
    hero: 30,
    titleLarge: 26,
    title: 22,
    section: 18,
    body: 16,
    small: 14,
    caption: 12,
  },
} as const;

export type Theme = typeof theme;

export const cardShadow = Platform.select({
  ios: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  android: { elevation: 4 },
  default: {},
});

export const navigationTheme = {
  headerStyle: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  headerTintColor: theme.colors.primaryDeep,
  headerTitleStyle: {
    fontWeight: "700" as const,
    color: theme.colors.text,
    fontSize: theme.font.body,
  },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: theme.colors.canvas },
};
