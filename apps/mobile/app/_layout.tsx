import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../lib/auth";
import { navigationTheme } from "../lib/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            ...navigationTheme,
            headerShown: true,
            headerBackTitle: "Back",
          }}
        >
          <Stack.Screen name="index" options={{ title: "311 Field" }} />
          <Stack.Screen name="login" options={{ title: "Sign in", headerShown: true }} />
          <Stack.Screen name="new-report" options={{ title: "New report" }} />
          <Stack.Screen name="chat" options={{ title: "Guided chat" }} />
          <Stack.Screen name="my-reports" options={{ title: "My reports" }} />
          <Stack.Screen name="report/[id]" options={{ title: "Report" }} />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
