import type { LocationSource } from "@call-pat/shared";
import { REPORT_CATEGORY_OPTIONS } from "@call-pat/shared";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { submitReport } from "../lib/api";
import { useAuth } from "../lib/auth";

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {step === 0 && (
        <View style={styles.section}>
          <Text style={styles.h}>1 · Photo</Text>
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
          <Text style={styles.h}>2 · Location</Text>
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
          <Text style={styles.h}>3 · Details</Text>
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
          <Pressable
            style={[styles.btn, busy && styles.btnDisabled]}
            disabled={busy}
            onPress={() => void submit()}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Submit report</Text>
            )}
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40, gap: 16 },
  section: { gap: 10 },
  h: { fontSize: 18, fontWeight: "700" },
  muted: { color: "#64748b" },
  map: { width: "100%", height: 220, borderRadius: 8 },
  label: { fontWeight: "600", marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  btn: {
    backgroundColor: "#1d4ed8",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  btnSecondary: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  btnSecondaryText: { fontWeight: "600", fontSize: 16, color: "#0f172a" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
  },
  chipOn: { backgroundColor: "#1d4ed8", borderColor: "#1d4ed8" },
  chipText: { color: "#0f172a" },
  chipTextOn: { color: "#fff", fontWeight: "600" },
});
