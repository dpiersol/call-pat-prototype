import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../lib/auth";
import { theme } from "../lib/theme";

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
    <View style={styles.container}>
      <Text style={styles.title}>Employee sign-in (demo)</Text>
      <Text style={styles.muted}>
        Uses reporter@demo.local — no real SSO in this prototype.
      </Text>
      {err ? <Text style={styles.err}>{err}</Text> : null}
      <Pressable
        style={[styles.btn, busy && styles.btnDisabled]}
        disabled={busy}
        onPress={() => void signIn()}
      >
        {busy ? (
          <ActivityIndicator color={theme.colors.onPrimary} />
        ) : (
          <Text style={styles.btnText}>Sign in as demo reporter</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    gap: theme.spacing.sm + 4,
    justifyContent: "center",
  },
  title: { fontSize: theme.font.title, fontWeight: "700", color: theme.colors.text },
  muted: { color: theme.colors.muted },
  err: { color: theme.colors.error },
  btn: {
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: theme.radius.sm,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: theme.colors.onPrimary, fontWeight: "600", fontSize: theme.font.body },
});
