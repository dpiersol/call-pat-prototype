import type { ReactNode } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, type ViewStyle } from "react-native";
import { theme } from "../../lib/theme";

type Variant = "primary" | "secondary" | "accent";

const variantStyles: Record<
  Variant,
  { container: ViewStyle; text: { color: string }; indicator: string }
> = {
  primary: {
    container: { backgroundColor: theme.colors.primary },
    text: { color: theme.colors.textInverse },
    indicator: theme.colors.textInverse,
  },
  secondary: {
    container: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },
    text: { color: theme.colors.text },
    indicator: theme.colors.primary,
  },
  accent: {
    container: { backgroundColor: theme.colors.accent },
    text: { color: theme.colors.textInverse },
    indicator: theme.colors.textInverse,
  },
};

type Props = {
  children: ReactNode;
  onPress: () => void | Promise<void>;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function AppButton({
  children,
  onPress,
  variant = "primary",
  disabled,
  loading,
  style,
}: Props) {
  const v = variantStyles[variant];
  const isPrimaryish = variant === "primary" || variant === "accent";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={() => void onPress()}
      android_ripple={
        isPrimaryish
          ? { color: "rgba(255,255,255,0.25)", foreground: true }
          : { color: "rgba(52,152,219,0.18)" }
      }
      style={({ pressed }) => [
        styles.base,
        v.container,
        (pressed || loading) && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.indicator} />
      ) : typeof children === "string" ? (
        <Text style={[styles.label, v.text]}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.sm,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    ...Platform.select({
      ios: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {},
    }),
  },
  label: { fontSize: theme.font.body, fontWeight: "700", letterSpacing: 0.2 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.55 },
});
