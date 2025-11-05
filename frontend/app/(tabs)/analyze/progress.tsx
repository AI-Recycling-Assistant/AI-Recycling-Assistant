// app/(tabs)/analyze/progress.tsx
import React, { useEffect, useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View, Text, StyleSheet, Platform, KeyboardAvoidingView,
  Animated, Easing, Image,
} from "react-native";

// ❗️경로 별칭(@)이 프로젝트 최상단을 가리킨다고 가정했어요.
// 별칭이 없으면 아래 import 대신 require("../../../../frontend/assets/characters/ssdamy.png") 처럼 상대경로로 바꿔주세요.
// app/(tabs)/analyze/progress.tsx 기준 예시
const logo = require("../../../../frontend/assets/characters/ssdamy.png");


type Params = { uri?: string; label?: string };

const COLORS = {
  bg: "#F7F9FB",
  card: "#FFFFFF",
  text: "#0F172A",
  sub: "#64748B",
  primary: "#10B981",
  border: "#E2E8F0",
};

export default function AnalyzeProgress() {
  const router = useRouter();
  const { uri, label = "소주병" } = useLocalSearchParams<Params>();

  // 4초 후 결과 화면으로 이동 (데모: 72~96%)
  useEffect(() => {
    const score = Math.round(72 + Math.random() * 24);
    const t = setTimeout(() => {
      router.replace(
  `/(tabs)/analyze/confirm?uri=${encodeURIComponent(uri ?? "")}&label=${encodeURIComponent(label)}&score=${score}`
);
    }, 4000);
    return () => clearTimeout(t);
  }, [router, uri, label]);

  // 회전 애니메이션 (바깥 링만)
  const spin = useMemo(() => new Animated.Value(0), []);
  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spin]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={s.centerWrap}>
        <View style={s.card}>
          <View style={s.content}>
            <Text style={s.title}>사진을 분석 중입니다</Text>

            {/* 회전 링(1개) + 가운데 로고 */}
            <Animated.View style={[s.spinnerWrap, { transform: [{ rotate }] }]}>
              <View style={s.spinnerRing} />
              <Image source={logo} style={s.logo} resizeMode="contain" />
            </Animated.View>

            <Text style={s.caption}>잠시만 기다려 주세요…</Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const SIZE = 160; // 링 지름

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centerWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  card: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  content: { alignItems: "center" },
  title: { fontFamily: "Jua_400Regular", color: COLORS.text, fontSize: 24, marginBottom: 18 },

  spinnerWrap: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  // 바깥 링 1개만 보이도록: 전체 테두리는 옅은 회색, 위쪽만 primary로 칠해서 회전 효과
  spinnerRing: {
    position: "absolute",
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 8,
    borderColor: COLORS.border,
    borderTopColor: COLORS.primary, // 회전하며 보이는 포인트
  },
  // 로고는 중앙에
  logo: {
    width: SIZE * 0.46,
    height: SIZE * 0.46,
  },

  caption: { color: COLORS.sub, marginTop: 8 },
});
