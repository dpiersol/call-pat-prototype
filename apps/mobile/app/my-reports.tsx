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
        <ActivityIndicator />
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
  container: { flex: 1, padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  muted: { color: "#64748b", marginTop: 4 },
  err: { color: "#b91c1c", marginTop: 8 },
});
