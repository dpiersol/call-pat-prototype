import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../lib/auth";
import { navigationTheme } from "../lib/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            ...navigationTheme,
            headerShown: true,
            headerBackTitle: "Back",
          }}
        />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
