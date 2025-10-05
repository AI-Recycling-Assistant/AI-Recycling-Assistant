// components/RoundedTitle.tsx
import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { useFonts, Jua_400Regular } from "@expo-google-fonts/jua";

type Props = {
  brand?: string;        // 로고색
  subColor?: string;     // 서브 텍스트 색
  center?: boolean;
};

export default function RoundedTitle({
  brand = "#22C55E",     // ← 로고 색상으로 교체!
  subColor = "#6B7280",
  center = true,
}: Props) {
  const [loaded] = useFonts({ Jua_400Regular });
  if (!loaded) return null;

  return (
    <View style={[styles.wrap, center && { alignItems: "center" }]}>
      <Text style={[styles.sub, { color: subColor }]}>버리지 말고,</Text>
      <Text style={[styles.main, { color: brand }]}>분리하자</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 6, marginBottom: 4 },
  sub: {
    fontFamily: "Jua_400Regular",
    fontSize: 18,
    letterSpacing: 0.2,
  },
  main: {
    fontFamily: "Jua_400Regular",
    fontSize: 30,           // 필요시 28~34로 조절
    lineHeight: 34,
    letterSpacing: 0.2,
    // 살짝 입체감(너무 세면 지워도 됨)
    textShadowColor: "rgba(0,0,0,0.06)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
