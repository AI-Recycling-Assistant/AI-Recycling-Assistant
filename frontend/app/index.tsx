// app/index.tsx
import { Redirect } from "expo-router";


export default function Index() {
  // 앱 켜면 무조건 탭(홈) 그룹으로
  return <Redirect href="/(tabs)" />;
    
}
