import { Redirect, router } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { AppButton } from "../components/ui/AppButton";
import { fetchMe } from "../lib/api";
import { useAuth } from "../lib/auth";
import { cardShadow, theme } from "../lib/theme";

export default function HomeScreen() {
  const { token, user, loading, logout } = useAuth();
  const [pointsTotal, setPointsTotal] = useState<number | null>(null);
  const [pointsErr, setPointsErr] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      let cancelled = false;
      setPointsErr(null);
      void (async () => {
        try {
          const me = await fetchMe(token);
          if (!cancelled) setPointsTotal(me.pointsTotal);
        } catch (e: unknown) {
          if (!cancelled) {
            setPointsErr(e instanceof Error ? e.message : "Could not load points");
            setPointsTotal(null);
          }
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [token]),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingHint}>Loading your session…</Text>
      </View>
    );
  }

  if (!token) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      <View style={styles.scrollContent}>
        <View style={styles.hero}>
          <Text style={styles.heroKicker}>CABQ · Employee tools</Text>
          <Text style={styles.heroTitle}>311 Field</Text>
          <Text style={styles.heroSub}>
            Report what you see on the ground — photo, pin, and details sync to dispatch in one flow.
          </Text>
          <View style={styles.heroAccent} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Signed in</Text>
          <Text style={styles.cardName}>{user?.displayName}</Text>
          <Text style={styles.cardRole}>{user?.role}</Text>
          {pointsTotal != null ? (
            <View style={styles.pointsRow}>
              <Text style={styles.pointsLabel}>Spotter points</Text>
              <Text style={styles.pointsValue}>{pointsTotal}</Text>
            </View>
          ) : pointsErr ? (
            <Text style={styles.pointsErr}>{pointsErr}</Text>
          ) : (
            <Text style={styles.pointsLoading}>Loading points…</Text>
          )}
        </View>

        <AppButton variant="accent" onPress={() => router.push("/new-report")}>
          New report
        </AppButton>
        <AppButton variant="primary" onPress={() => router.push("/chat")}>
          Guided chat
        </AppButton>
        <AppButton variant="secondary" onPress={() => router.push("/my-reports")}>
          My reports
        </AppButton>

        <AppButton variant="secondary" onPress={() => void logout()}>
          Sign out
        </AppButton>

        <Text style={styles.footer}>Built for Albuquerque crews · Demo sign-in</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.canvas },
  scrollContent: {
    flex: 1,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.canvas },
  loadingHint: { marginTop: theme.spacing.md, color: theme.colors.muted, fontSize: theme.font.small },
  hero: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    overflow: "hidden",
    ...cardShadow,
  },
  heroKicker: {
    color: theme.colors.mutedOnDark,
    fontSize: theme.font.caption,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  heroTitle: {
    fontSize: theme.font.hero,
    fontWeight: "800",
    color: theme.colors.textInverse,
    marginTop: theme.spacing.xs,
    letterSpacing: -0.5,
  },
  heroSub: {
    marginTop: theme.spacing.sm,
    fontSize: theme.font.small,
    lineHeight: 20,
    color: theme.colors.mutedOnDark,
    maxWidth: 340,
  },
  heroAccent: {
    position: "absolute",
    right: -24,
    top: -24,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...cardShadow,
  },
  cardLabel: { fontSize: theme.font.caption, color: theme.colors.muted, fontWeight: "600", textTransform: "uppercase" },
  cardName: { fontSize: theme.font.title, fontWeight: "800", color: theme.colors.text, marginTop: 4 },
  cardRole: { fontSize: theme.font.small, color: theme.colors.primaryDeep, fontWeight: "600", marginTop: 2 },
  pointsRow: {
    marginTop: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.canvasAlt,
    borderRadius: theme.radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  pointsLabel: { fontSize: theme.font.small, fontWeight: "700", color: theme.colors.text },
  pointsValue: { fontSize: 22, fontWeight: "900", color: theme.colors.accent },
  pointsLoading: { marginTop: theme.spacing.sm, fontSize: theme.font.caption, color: theme.colors.muted },
  pointsErr: { marginTop: theme.spacing.sm, fontSize: theme.font.caption, color: theme.colors.error },
  footer: {
    textAlign: "center",
    color: theme.colors.muted,
    fontSize: theme.font.caption,
    marginTop: theme.spacing.sm,
  },
});
