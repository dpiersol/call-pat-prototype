import { Redirect, router } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../lib/auth";

export default function HomeScreen() {
  const { token, user, loading, logout } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
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
  container: { flex: 1, padding: 20, gap: 12 },
  title: { fontSize: 26, fontWeight: "700" },
  sub: { color: "#64748b", marginBottom: 8 },
  btn: {
    backgroundColor: "#1d4ed8",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  btnSecondary: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  btnSecondaryText: { fontWeight: "600", fontSize: 16, color: "#0f172a" },
  link: { color: "#1d4ed8", marginTop: 16, textAlign: "center" },
});
