import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../components/ui/AppButton";
import { useAuth } from "../lib/auth";
import { cardShadow, theme } from "../lib/theme";

export default function LoginScreen() {
  const { login } = useAuth();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setErr(null);
    setBusy(true);
    try {
      await login("reporter@demo.local");
      router.replace("/");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Demo · Entra SSO later</Text>
          </View>
          <Text style={styles.title}>CABQ 311 Field</Text>
          <Text style={styles.lede}>
            Employee reporting for the Duke City. Production will use your{" "}
            <Text style={styles.emph}>@cabq.gov</Text> account.
          </Text>
          <Text style={styles.es}>
            Español: la versión final incluirá idioma completo. Esta vista es inglés para el piloto.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Try the flow</Text>
            <Text style={styles.cardMuted}>Signs in as the demo field reporter (no password).</Text>
            {err ? <Text style={styles.err}>{err}</Text> : null}
            <AppButton variant="accent" loading={busy} onPress={() => void signIn()}>
              Continue as demo reporter
            </AppButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.canvas },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: "center",
    gap: theme.spacing.md,
  },
  badge: {
    alignSelf: "center",
    backgroundColor: theme.colors.canvasAlt,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  badgeText: { fontSize: theme.font.caption, fontWeight: "700", color: theme.colors.primaryDeep },
  title: {
    fontSize: theme.font.hero,
    fontWeight: "800",
    color: theme.colors.text,
    textAlign: "center",
    letterSpacing: -0.6,
  },
  lede: {
    textAlign: "center",
    color: theme.colors.muted,
    fontSize: theme.font.body,
    lineHeight: 22,
    paddingHorizontal: theme.spacing.sm,
  },
  emph: { fontWeight: "700", color: theme.colors.text },
  es: {
    textAlign: "center",
    fontSize: theme.font.caption,
    color: theme.colors.muted,
    fontStyle: "italic",
    paddingHorizontal: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...cardShadow,
  },
  cardTitle: { fontSize: theme.font.section, fontWeight: "800", color: theme.colors.text },
  cardMuted: { fontSize: theme.font.small, color: theme.colors.muted, marginTop: -theme.spacing.xs },
  err: { color: theme.colors.error, fontSize: theme.font.small, fontWeight: "600" },
});
