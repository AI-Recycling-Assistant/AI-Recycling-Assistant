// app/(tabs)/_layout.tsx
console.log("[TabsLayout] loaded");
import { Tabs } from "expo-router";
import HeaderLogo from "@components/HeaderLogo";
// 수정
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,               // 기본: 숨김
        tabBarStyle: { display: "none" }, // 탭바 숨김
      }}
    >
      {/* ✅ 홈만 헤더 ON */}
      <Tabs.Screen
        name="index"
        options={{
          headerShown: true,

        // ⬇️ 핵심: 타이틀을 직접 로고로, 왼쪽 정렬 강제
        headerTitle: () => <HeaderLogo height={40} />, // 크기는 여기서 조절 (예: 40~48)
        headerTitleAlign: 'left',
        headerTitleContainerStyle: {
          alignItems: 'flex-start',  // 컨테이너 내부 정렬을 왼쪽으로
          justifyContent: 'center',
          marginLeft: 0,
          paddingLeft: 0,          // 좌측 여백 원치 않으면 0
        },

        // 왼쪽/오른쪽 슬롯은 비우기 (공간 예약 방지)
        headerLeft: () => null,
        headerRight: () => null,
        }}
      />

      {/* 나머지는 헤더/탭바 없음 */}
      <Tabs.Screen name="faq" options={{}} />
      <Tabs.Screen name="analyze" options={{}} />
      <Tabs.Screen name="community" options={{}} />
    </Tabs>
  );
}
