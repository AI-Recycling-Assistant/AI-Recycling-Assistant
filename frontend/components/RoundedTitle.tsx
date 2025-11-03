// components/RoundedTitle.tsx
import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { useFonts, Jua_400Regular } from "@expo-google-fonts/jua";

type Props = {
  title?: string;          // 굵은 메인 텍스트
  subtitle?: string;       // 위에 얇은 보조 텍스트
  brand?: string;          // 메인 색
  subColor?: string;       // 서브 색
  center?: boolean;        // 가운데 정렬 여부
};

export default function RoundedTitle({
  title = "분리하자",
  subtitle = "버리지 말고,",
  brand = "#22C55E",
  subColor = "#6B7280",
  center = true,
}: Props) {
  const [loaded] = useFonts({ Jua_400Regular });
  if (!loaded) return null;

  return (
    <View style={[styles.wrap, center && { alignItems: "center" }]}>
      {subtitle ? <Text style={[styles.sub, { color: subColor }]}>{subtitle}</Text> : null}
      {title ? <Text style={[styles.main, { color: brand }]}>{title}</Text> : null}
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
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: 0.2,
    textShadowColor: "rgba(0,0,0,0.06)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
