import { Redirect, router } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../lib/auth";
import { theme } from "../lib/theme";

export default function HomeScreen() {
  const { token, user, loading, logout } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (!token) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Call Pat</Text>
      <Text style={styles.sub}>
        Signed in as {user?.displayName} ({user?.role})
      </Text>
      <Pressable style={styles.btn} onPress={() => router.push("/new-report")}>
        <Text style={styles.btnText}>New report</Text>
      </Pressable>
      <Pressable style={styles.btnSecondary} onPress={() => router.push("/my-reports")}>
        <Text style={styles.btnSecondaryText}>My reports</Text>
      </Pressable>
      <Pressable onPress={() => void logout()}>
        <Text style={styles.link}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: theme.spacing.md, gap: theme.spacing.sm + 4 },
  title: { fontSize: theme.font.titleLarge, fontWeight: "700", color: theme.colors.text },
  sub: { color: theme.colors.muted, marginBottom: theme.spacing.sm },
  btn: {
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: theme.radius.sm,
    alignItems: "center",
  },
  btnText: { color: theme.colors.onPrimary, fontWeight: "600", fontSize: theme.font.body },
  btnSecondary: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    borderRadius: theme.radius.sm,
    alignItems: "center",
  },
  btnSecondaryText: { fontWeight: "600", fontSize: theme.font.body, color: theme.colors.text },
  link: { color: theme.colors.primary, marginTop: theme.spacing.md, textAlign: "center" },
});
