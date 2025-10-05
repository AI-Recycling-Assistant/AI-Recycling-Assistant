// app/(tabs)/_layout.tsx
console.log("[TabsLayout] loaded"); 
import { Tabs } from 'expo-router';
import HeaderLogo from '@components/HeaderLogo';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,               // ✅ 탭 내부 화면 헤더 숨김
        tabBarStyle: { display: 'none' }, // ✅ 하단 탭바 완전 숨김
      }}
    >
      {/* 홈 탭 (헤더/로고는 app/_layout.tsx의 Stack에서 보여줌) */}
      <Tabs.Screen name="index" options={{
        headerShown: true,
          headerTitle: '',               // 가운데 타이틀 제거
          headerTitleAlign: 'left',      // 안전하게 왼쪽 정렬
          headerLeft: () => <HeaderLogo height={36} />, // ✅ 왼쪽 로고
      }} />

      {/* 실제 사용하는 탭들만 남기세요. 예시: */}
      <Tabs.Screen name="faq" options={{}} />
      <Tabs.Screen name="analyze" options={{}} />
      <Tabs.Screen name="community" options={{}} />

      {/* 템플릿에 있던 'two' 스크린은 쓰지 않으면 지우세요. */}
      {/* <Tabs.Screen name="two" options={{}} /> */}
    </Tabs>
  );
}
