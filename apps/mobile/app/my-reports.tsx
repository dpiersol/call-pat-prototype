import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchMyReports } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useFocusEffect } from "@react-navigation/native";
import { cardShadow, theme } from "../lib/theme";

export default function MyReportsScreen() {
  const { token } = useAuth();
  const [reports, setReports] = useState<Awaited<ReturnType<typeof fetchMyReports>>["reports"]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setErr(null);
    try {
      const res = await fetchMyReports(token);
      setReports(res.reports);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (!token) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.listHead}>Your submissions</Text>
      <Text style={styles.listSub}>Pull down to refresh. Tap a card for timeline and photo.</Text>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          contentContainerStyle={reports.length === 0 ? styles.emptyGrow : undefined}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void load();
              }}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyTitle}>No reports yet</Text>
              <Text style={styles.emptyBody}>
                When you file your first issue, it will show up here with live status from dispatch.
              </Text>
              <Pressable style={styles.emptyCta} onPress={() => router.push("/new-report")}>
                <Text style={styles.emptyCtaText}>Start a report</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => router.push(`/report/${item.id}`)}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.cardMeta}>
                <Text style={styles.pill}>{item.category}</Text>
                <Text style={styles.status}>{item.status}</Text>
              </View>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
            </Pressable>
          )}
        />
      )}
      {err ? <Text style={styles.err}>{err}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.md, backgroundColor: theme.colors.canvas },
  listHead: { fontSize: theme.font.section, fontWeight: "800", color: theme.colors.text },
  listSub: { fontSize: theme.font.small, color: theme.colors.muted, marginTop: 4, marginBottom: theme.spacing.md },
  center: { flex: 1, justifyContent: "center", alignItems: "center", minHeight: 200 },
  emptyGrow: { flexGrow: 1, justifyContent: "center" },
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...cardShadow,
  },
  cardPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  cardTitle: { fontSize: theme.font.body, fontWeight: "800", color: theme.colors.text },
  cardMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: theme.spacing.sm, alignItems: "center" },
  pill: {
    fontSize: theme.font.caption,
    fontWeight: "700",
    color: theme.colors.primaryDeep,
    backgroundColor: theme.colors.canvasAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    overflow: "hidden",
  },
  status: { fontSize: theme.font.caption, fontWeight: "800", color: theme.colors.accent, textTransform: "uppercase" },
  date: { color: theme.colors.muted, marginTop: theme.spacing.sm, fontSize: theme.font.small },
  empty: { alignItems: "center", paddingVertical: theme.spacing.xl, paddingHorizontal: theme.spacing.md },
  emptyEmoji: { fontSize: 40, marginBottom: theme.spacing.sm },
  emptyTitle: { fontSize: theme.font.title, fontWeight: "800", color: theme.colors.text },
  emptyBody: { textAlign: "center", color: theme.colors.muted, marginTop: theme.spacing.sm, lineHeight: 22 },
  emptyCta: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.accent,
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.sm,
  },
  emptyCtaText: { color: theme.colors.textInverse, fontWeight: "800", fontSize: theme.font.body },
  err: { color: theme.colors.error, marginTop: theme.spacing.sm, fontWeight: "600" },
});
