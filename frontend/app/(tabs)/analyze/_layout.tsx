// app/(tabs)/analyze/_layout.tsx
import { Stack } from "expo-router";

export default function AnalyzeLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "left",
        headerShadowVisible: false,
        headerBackButtonDisplayMode: "minimal",
        animation: "slide_from_right",
      }}
    >
      {/* 루트는 헤더 숨김 */}
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />

      {/* 나머지는 기본 헤더 사용 */}
      <Stack.Screen name="editor"  options={{ title: "" }} />
      <Stack.Screen name="preview" options={{ title: "" }} />
      <Stack.Screen name="result"  options={{ title: "" }} />
      <Stack.Screen name="progress" options={{ title: "" }} />

      {/* ✅ confirm 은 커스텀 헤더만 사용하니까 Stack 헤더 숨김 */}
      <Stack.Screen
        name="confirm"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
