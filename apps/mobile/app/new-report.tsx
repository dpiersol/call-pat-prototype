import type { LocationSource } from "@call-pat/shared";
import { REPORT_CATEGORY_OPTIONS } from "@call-pat/shared";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { AppButton } from "../components/ui/AppButton";
import { submitReport } from "../lib/api";
import { useAuth } from "../lib/auth";
import { cardShadow, theme } from "../lib/theme";

export default function NewReportScreen() {
  const { token } = useAuth();
  const [step, setStep] = useState(0);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [mime, setMime] = useState("image/jpeg");
  const [lat, setLat] = useState(35.0844);
  const [lng, setLng] = useState(-106.6504);
  const [locSource, setLocSource] = useState<LocationSource>("manual");
  const [address, setAddress] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(REPORT_CATEGORY_OPTIONS[0]);
  const [region, setRegion] = useState({
    latitude: 35.0844,
    longitude: -106.6504,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });
  const [busy, setBusy] = useState(false);

  async function pickCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission", "Camera access is needed for a photo.");
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.72 });
    if (!res.canceled && res.assets[0]) {
      setPhotoUri(res.assets[0].uri);
      setMime(res.assets[0].mimeType ?? "image/jpeg");
      setStep(1);
    }
  }

  async function pickLibrary() {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.72 });
    if (!res.canceled && res.assets[0]) {
      setPhotoUri(res.assets[0].uri);
      setMime(res.assets[0].mimeType ?? "image/jpeg");
      setLocSource("exif");
      setStep(1);
    }
  }

  async function useGps() {
    const fg = await Location.requestForegroundPermissionsAsync();
    if (!fg.granted) {
      Alert.alert("Permission", "Location is used to pre-fill the pin.");
      return;
    }
    const pos = await Location.getCurrentPositionAsync({});
    const la = pos.coords.latitude;
    const lo = pos.coords.longitude;
    setLat(la);
    setLng(lo);
    setLocSource("gps");
    setRegion((r) => ({
      ...r,
      latitude: la,
      longitude: lo,
    }));
  }

  function onMarkerDrag(e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setLat(latitude);
    setLng(longitude);
    setLocSource("manual");
    setRegion((r) => ({ ...r, latitude, longitude }));
  }

  async function submit() {
    if (!token || !photoUri) {
      Alert.alert("Missing fields", "Photo is required.");
      return;
    }
    if (!title.trim() || !description.trim()) {
      Alert.alert("Missing fields", "Title and description are required.");
      return;
    }
    setBusy(true);
    try {
      const r = await submitReport(
        token,
        {
          title: title.trim(),
          description: description.trim(),
          category,
          lat,
          lng,
          addressText: address.trim() || null,
          locationSource: locSource,
        },
        photoUri,
        mime,
      );
      router.replace(`/report/${r.id}`);
    } catch (e: unknown) {
      Alert.alert("Could not submit", e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  if (!token) return null;

  const stepIndex = step === 0 ? 0 : step === 1 ? 1 : 2;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.stepsRow}>
        {["Photo", "Pin", "Details"].map((label, i) => (
          <View key={label} style={styles.stepItem}>
            <View style={[styles.stepDot, i <= stepIndex && styles.stepDotOn]}>
              <Text style={[styles.stepNum, i <= stepIndex && styles.stepNumOn]}>{i + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, i <= stepIndex && styles.stepLabelOn]}>{label}</Text>
          </View>
        ))}
      </View>

      {step === 0 && (
        <View style={styles.section}>
          <Text style={styles.h}>Photo</Text>
          <Text style={styles.muted}>Take a picture or choose from the library.</Text>
          <Pressable style={styles.btn} onPress={() => void pickCamera()}>
            <Text style={styles.btnText}>Use camera</Text>
          </Pressable>
          <Pressable style={styles.btnSecondary} onPress={() => void pickLibrary()}>
            <Text style={styles.btnSecondaryText}>Choose from library</Text>
          </Pressable>
        </View>
      )}

      {step >= 1 && (
        <View style={styles.section}>
          <Text style={styles.h}>Location</Text>
          <Text style={styles.muted}>
            Source: {locSource}. Drag the pin to override.
          </Text>
          <Pressable style={styles.btnSecondary} onPress={() => void useGps()}>
            <Text style={styles.btnSecondaryText}>Use GPS</Text>
          </Pressable>
          <MapView style={styles.map} region={region} onRegionChangeComplete={setRegion}>
            <Marker
              coordinate={{ latitude: lat, longitude: lng }}
              draggable
              onDragEnd={onMarkerDrag}
            />
          </MapView>
          <TextInput
            style={styles.input}
            placeholder="Cross streets / address (optional)"
            value={address}
            onChangeText={setAddress}
          />
          <Pressable
            style={styles.btn}
            onPress={() => {
              setStep(2);
            }}
          >
            <Text style={styles.btnText}>Continue</Text>
          </Pressable>
        </View>
      )}

      {step >= 2 && (
        <View style={styles.section}>
          <Text style={styles.h}>Details</Text>
          <Text style={styles.label}>Category</Text>
          <View style={styles.chips}>
            {REPORT_CATEGORY_OPTIONS.map((c) => (
              <Pressable
                key={c}
                style={[styles.chip, category === c && styles.chipOn]}
                onPress={() => setCategory(c)}
              >
                <Text style={category === c ? styles.chipTextOn : styles.chipText}>{c}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Short title</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} />
          <Text style={styles.label}>What did you see?</Text>
          <TextInput
            style={[styles.input, { minHeight: 100 }]}
            multiline
            value={description}
            onChangeText={setDescription}
          />
          <AppButton variant="accent" loading={busy} disabled={busy} onPress={() => void submit()}>
            Submit report
          </AppButton>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.md, paddingBottom: theme.spacing.sectionBottom, gap: theme.spacing.md },
  stepsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  stepItem: { alignItems: "center", flex: 1 },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.chipInactive,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  stepDotOn: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  stepNum: { fontSize: theme.font.caption, fontWeight: "800", color: theme.colors.muted },
  stepNumOn: { color: theme.colors.textInverse },
  stepLabel: { marginTop: 6, fontSize: 11, color: theme.colors.muted, fontWeight: "600" },
  stepLabelOn: { color: theme.colors.primaryDeep },
  section: {
    gap: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...cardShadow,
  },
  h: { fontSize: theme.font.section, fontWeight: "800", color: theme.colors.text, letterSpacing: -0.2 },
  muted: { color: theme.colors.muted, lineHeight: 20 },
  map: { width: "100%", height: 220, borderRadius: theme.radius.md, overflow: "hidden" },
  label: { fontWeight: "600", marginTop: theme.spacing.xs, color: theme.colors.text },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: 10,
    fontSize: theme.font.body,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  btn: {
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: theme.radius.sm,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: theme.colors.textInverse, fontWeight: "700", fontSize: theme.font.body },
  btnSecondary: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    borderRadius: theme.radius.sm,
    alignItems: "center",
  },
  btnSecondaryText: { fontWeight: "600", fontSize: theme.font.body, color: theme.colors.text },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.chipInactive,
  },
  chipOn: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { color: theme.colors.text },
  chipTextOn: { color: theme.colors.textInverse, fontWeight: "700" },
});
