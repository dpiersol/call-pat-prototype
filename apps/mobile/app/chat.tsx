import { Redirect, router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { REPORT_CATEGORY_OPTIONS, type ReportCategoryOption } from "@call-pat/shared";
import { AppButton } from "../components/ui/AppButton";
import { useAuth } from "../lib/auth";
import { theme } from "../lib/theme";

type Phase = "welcome" | "category" | "title" | "description" | "done";

type Msg = { id: string; from: "pat" | "you"; text: string };

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ChatGuidedScreen() {
  const { token } = useAuth();
  const [phase, setPhase] = useState<Phase>("welcome");
  const [category, setCategory] = useState<ReportCategoryOption | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: uid(),
      from: "pat",
      text: "Hey — I’m Pat. In a few taps we’ll shape your report so the photo + map step is faster.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  const pushPat = useCallback((text: string) => {
    setMessages((m) => [...m, { id: uid(), from: "pat", text }]);
  }, []);

  const pushYou = useCallback((text: string) => {
    setMessages((m) => [...m, { id: uid(), from: "you", text }]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
      return () => clearTimeout(t);
    }, []),
  );

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [messages, phase]);

  if (!token) return <Redirect href="/login" />;

  function goPhotoStep() {
    if (!category || !title.trim() || !description.trim()) return;
    router.push({
      pathname: "/new-report",
      params: {
        prefillCategory: category,
        prefillTitle: title.trim(),
        prefillDescription: description.trim(),
      },
    });
  }

  function onSendDraft() {
    const t = draft.trim();
    if (!t) return;
    setDraft("");
    pushYou(t);
    if (phase === "title") {
      setTitle(t);
      pushPat("Got it. Last one: in a sentence or two, what should dispatch know?");
      setPhase("description");
      return;
    }
    if (phase === "description") {
      setDescription(t);
      pushPat("Here’s what I’ll carry into the form. Tap below when you’re ready for camera + map.");
      setPhase("done");
    }
  }

  function pickCategory(c: ReportCategoryOption) {
    setCategory(c);
    pushYou(c);
    pushPat("Nice. Short title — what should we call this on the queue?");
    setPhase("title");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={72}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollInner}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((m) => (
            <View
              key={m.id}
              style={[styles.row, m.from === "you" ? styles.rowYou : styles.rowPat]}
            >
              <View style={[styles.bubble, m.from === "you" ? styles.bubbleYou : styles.bubblePat]}>
                {m.from === "pat" ? <Text style={styles.bubbleLabel}>Pat</Text> : null}
                <Text style={m.from === "you" ? styles.bubbleTextYou : styles.bubbleTextPat}>{m.text}</Text>
              </View>
            </View>
          ))}

          {phase === "welcome" ? (
            <View style={styles.ctaRow}>
              <AppButton
                variant="accent"
                onPress={() => {
                  pushPat("What are you seeing? Pick the closest bucket.");
                  setPhase("category");
                }}
              >
                Let’s go
              </AppButton>
            </View>
          ) : null}

          {phase === "category" ? (
            <View style={styles.chipsWrap}>
              {REPORT_CATEGORY_OPTIONS.map((c) => (
                <Pressable key={c} style={styles.chip} onPress={() => pickCategory(c)}>
                  <Text style={styles.chipText}>{c}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          {phase === "done" && category ? (
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Summary</Text>
              <Text style={styles.summaryLine}>
                <Text style={styles.summaryKey}>Category · </Text>
                {category}
              </Text>
              <Text style={styles.summaryLine}>
                <Text style={styles.summaryKey}>Title · </Text>
                {title}
              </Text>
              <Text style={styles.summaryBody}>{description}</Text>
              <AppButton variant="accent" onPress={() => goPhotoStep()}>
                Continue to photo & map
              </AppButton>
            </View>
          ) : null}
        </ScrollView>

        {(phase === "title" || phase === "description") && (
          <View style={styles.composer}>
            <TextInput
              style={styles.input}
              placeholder={phase === "title" ? "e.g. Sharp debris near playground" : "What happened? Any safety notes?"}
              placeholderTextColor={theme.colors.muted}
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={() => onSendDraft()}
              returnKeyType="send"
            />
            <Pressable style={styles.sendBtn} onPress={() => onSendDraft()}>
              <Text style={styles.sendBtnText}>Send</Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.canvas },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  scrollInner: { padding: theme.spacing.md, paddingBottom: theme.spacing.xl, gap: theme.spacing.sm },
  row: { width: "100%" },
  rowPat: { alignItems: "flex-start" },
  rowYou: { alignItems: "flex-end" },
  bubble: {
    maxWidth: "88%",
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: theme.spacing.sm,
  },
  bubblePat: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  bubbleYou: { backgroundColor: theme.colors.primary },
  bubbleLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: theme.colors.accent,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  bubbleTextPat: { color: theme.colors.text, fontSize: theme.font.body, lineHeight: 22 },
  bubbleTextYou: { color: theme.colors.textInverse, fontSize: theme.font.body, lineHeight: 22, fontWeight: "600" },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: theme.spacing.sm },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  chipText: { fontWeight: "700", color: theme.colors.primaryDeep },
  summary: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    gap: theme.spacing.sm,
  },
  summaryTitle: { fontSize: theme.font.section, fontWeight: "800", color: theme.colors.text },
  summaryLine: { fontSize: theme.font.small, color: theme.colors.text, lineHeight: 20 },
  summaryKey: { fontWeight: "800", color: theme.colors.muted },
  summaryBody: { fontSize: theme.font.body, color: theme.colors.text, lineHeight: 22 },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: theme.font.body,
    color: theme.colors.text,
    backgroundColor: theme.colors.canvas,
  },
  sendBtn: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: theme.radius.sm,
    marginBottom: 2,
  },
  sendBtnText: { color: theme.colors.textInverse, fontWeight: "800", fontSize: theme.font.small },
  ctaRow: { width: "100%", marginTop: theme.spacing.sm },
});
