// app/(tabs)/analyze/_layout.tsx
import { Stack } from "expo-router";

export default function AnalyzeLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "left",
        headerShadowVisible: false,
        headerBackButtonDisplayMode: "minimal", // 뒤로가기 텍스트 숨김(아이콘만)
        animation: "slide_from_right",
      }}
    >
      {/* 루트는 헤더 숨김 → 상단 '분석' 텍스트 사라짐 */}
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />

      {/* 하위 화면에서는 헤더 보이게 + 뒤로가기 표시 */}
      <Stack.Screen name="editor"  options={{ title: "" }} />
      <Stack.Screen name="preview" options={{ title: "" }} />
      <Stack.Screen name="result"  options={{ title: "" }} />
    </Stack>
  );
}
