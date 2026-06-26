import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return <SafeAreaProvider>
    <Stack screenOptions={{
      contentStyle: { backgroundColor: "transparent" }
    }}>
      <Stack.Screen name="index" options={{
        headerShown: false,
      }} />
      <Stack.Screen name="search" options={{
        headerShown: false
      }} />
      <Stack.Screen name="auth" options={{
        headerShown: false
      }} />
    </Stack>
  </SafeAreaProvider>
    ;
}
