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
import { theme } from "../../lib/theme";

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
      {!report && !err ? <ActivityIndicator color={theme.colors.primary} /> : null}
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
  container: { padding: theme.spacing.md, gap: theme.spacing.sm, paddingBottom: 32 },
  title: { fontSize: theme.font.title, fontWeight: "700", color: theme.colors.text },
  body: { fontSize: theme.font.body, lineHeight: 22, marginTop: theme.spacing.sm, color: theme.colors.text },
  muted: { color: theme.colors.muted, marginTop: theme.spacing.xs },
  badge: { fontWeight: "700", color: theme.colors.primary },
  image: { width: "100%", height: 220, borderRadius: theme.radius.sm, marginTop: 12 },
  h2: { marginTop: theme.spacing.md, fontSize: theme.font.section, fontWeight: "700", color: theme.colors.text },
  ev: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.timelineBorder,
    paddingLeft: 12,
    marginTop: theme.spacing.sm,
  },
  evTitle: { fontWeight: "600", color: theme.colors.text },
  err: { color: theme.colors.error },
  linkBtn: { marginTop: 20 },
  link: { color: theme.colors.primary, fontWeight: "600" },
});
