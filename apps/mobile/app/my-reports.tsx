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
import { theme } from "../lib/theme";

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
      {loading ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
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
            <Text style={styles.muted}>No reports yet.</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/report/${item.id}`)}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.muted}>
                {item.category} · {item.status}
              </Text>
              <Text style={styles.muted}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </Pressable>
          )}
        />
      )}
      {err ? <Text style={styles.err}>{err}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.md },
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.radius.sm,
    padding: 12,
    marginBottom: 10,
  },
  cardTitle: { fontSize: theme.font.body, fontWeight: "600", color: theme.colors.text },
  muted: { color: theme.colors.muted, marginTop: theme.spacing.xs },
  err: { color: theme.colors.error, marginTop: theme.spacing.sm },
});
