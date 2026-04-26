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
import { cardShadow, theme } from "../../lib/theme";

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
          <View style={styles.metaCard}>
            <Text style={styles.title}>{report.title}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.pillCat}>{report.category}</Text>
              <Text style={styles.pillStatus}>{report.status}</Text>
            </View>
          </View>
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
          {(report.statusEvents ?? []).map((ev, idx) => (
            <View key={ev.id} style={[styles.ev, idx === (report.statusEvents?.length ?? 1) - 1 && styles.evLatest]}>
              <Text style={styles.evTitle}>{ev.toStatus}</Text>
              <Text style={styles.muted}>
                {new Date(ev.createdAt).toLocaleString()}
              </Text>
              {ev.note ? <Text style={styles.evNote}>{ev.note}</Text> : null}
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
  container: { padding: theme.spacing.md, gap: theme.spacing.md, paddingBottom: 40 },
  metaCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...cardShadow,
  },
  title: { fontSize: theme.font.title, fontWeight: "800", color: theme.colors.text, letterSpacing: -0.2 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: theme.spacing.sm },
  pillCat: {
    fontSize: theme.font.caption,
    fontWeight: "700",
    color: theme.colors.primaryDeep,
    backgroundColor: theme.colors.canvasAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    overflow: "hidden",
  },
  pillStatus: {
    fontSize: theme.font.caption,
    fontWeight: "800",
    color: theme.colors.textInverse,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    overflow: "hidden",
    textTransform: "uppercase",
  },
  body: { fontSize: theme.font.body, lineHeight: 24, color: theme.colors.text },
  muted: { color: theme.colors.muted, marginTop: 4, fontSize: theme.font.small },
  image: { width: "100%", height: 220, borderRadius: theme.radius.md, marginTop: 4, ...cardShadow },
  h2: { marginTop: theme.spacing.sm, fontSize: theme.font.section, fontWeight: "800", color: theme.colors.text },
  ev: {
    marginTop: theme.spacing.sm,
    paddingLeft: theme.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.timelineTrack,
    gap: 4,
  },
  evLatest: { borderLeftColor: theme.colors.timeline },
  evTitle: { fontWeight: "800", color: theme.colors.text, fontSize: theme.font.body },
  evNote: { color: theme.colors.muted, marginTop: 6, fontSize: theme.font.small, lineHeight: 20 },
  err: { color: theme.colors.error },
  linkBtn: { marginTop: theme.spacing.md },
  link: { color: theme.colors.primaryDeep, fontWeight: "700", fontSize: theme.font.body },
});
