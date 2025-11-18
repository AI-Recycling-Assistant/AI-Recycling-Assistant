// app/community/_layout.tsx
import { Stack } from "expo-router";

export default function CommunityLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="community-main"
        options={{ headerShown: false }}   // ✅ 윗 헤더 숨기기
      />
      <Stack.Screen
        name="community-feed"
        options={{ headerShown: false }}   // ✅ 여기!
      />
      <Stack.Screen
        name="community-upload"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="community-report"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
