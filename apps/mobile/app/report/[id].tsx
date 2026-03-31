import { Image } from "expo-image";
import { useLocalSearchParams, router } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { attachmentImageSource, fetchReport } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { useFocusEffect } from "@react-navigation/native";

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const [report, setReport] = useState<Awaited<ReturnType<typeof fetchReport>> | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || !id) return;
    setErr(null);
    try {
      const r = await fetchReport(token, id);
      setReport(r);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    }
  }, [token, id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (!token) return null;

  const attId = report?.attachments?.[0]?.id;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!report && !err ? <ActivityIndicator /> : null}
      {err ? <Text style={styles.err}>{err}</Text> : null}
      {report && (
        <>
          <Text style={styles.title}>{report.title}</Text>
          <Text style={styles.muted}>
            {report.category} · <Text style={styles.badge}>{report.status}</Text>
          </Text>
          <Text style={styles.body}>{report.description}</Text>
          <Text style={styles.muted}>
            {report.addressText ??
              `${report.lat?.toFixed(5) ?? "—"}, ${report.lng?.toFixed(5) ?? "—"}`}{" "}
            ({report.locationSource})
          </Text>
          {attId && token ? (
            <Image
              source={attachmentImageSource(token, attId)}
              style={styles.image}
              contentFit="cover"
            />
          ) : null}

          <Text style={styles.h2}>Status timeline</Text>
          {(report.statusEvents ?? []).map((ev) => (
            <View key={ev.id} style={styles.ev}>
              <Text style={styles.evTitle}>{ev.toStatus}</Text>
              <Text style={styles.muted}>
                {new Date(ev.createdAt).toLocaleString()}
              </Text>
              {ev.note ? <Text style={styles.muted}>{ev.note}</Text> : null}
            </View>
          ))}

          <Pressable style={styles.linkBtn} onPress={() => router.push("/my-reports")}>
            <Text style={styles.link}>Back to My reports</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: "700" },
  body: { fontSize: 16, lineHeight: 22, marginTop: 8 },
  muted: { color: "#64748b", marginTop: 4 },
  badge: { fontWeight: "700", color: "#1d4ed8" },
  image: { width: "100%", height: 220, borderRadius: 8, marginTop: 12 },
  h2: { marginTop: 16, fontSize: 18, fontWeight: "700" },
  ev: {
    borderLeftWidth: 3,
    borderLeftColor: "#e2e8f0",
    paddingLeft: 12,
    marginTop: 8,
  },
  evTitle: { fontWeight: "600" },
  err: { color: "#b91c1c" },
  linkBtn: { marginTop: 20 },
  link: { color: "#1d4ed8", fontWeight: "600" },
});
