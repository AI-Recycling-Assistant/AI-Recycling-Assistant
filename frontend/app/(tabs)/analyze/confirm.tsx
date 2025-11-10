// app/analyze/confirm.tsx
import React, { useCallback } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform, KeyboardAvoidingView, Alert } from "react-native";

type Params = { uri?: string; label?: string; score?: string };

const COLORS = {
  bg: "#F7F9FB",
  card: "#FFFFFF",
  text: "#0F172A",
  sub: "#64748B",
  primary: "#10B981",
  primaryDark: "#059669",
  border: "#E2E8F0",
};

export default function AnalyzeConfirm() {
  const router = useRouter();
  const { uri, label = "소주병", score = "88" } = useLocalSearchParams<Params>();

  const onPick = useCallback((ok: boolean) => {
    Alert.alert("데모", ok ? "네: 확정했습니다." : "아니요: 다시 시도해 주세요.");
    router.replace("/"); // 데모용: 홈으로
  }, [router]);

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={s.centerWrap}>
        <View style={s.card}>
          {/* 프리뷰 */}
          <View style={s.previewWrap}>
            {uri ? (
              <Image source={{ uri }} style={s.preview} resizeMode="contain" />
            ) : (
              <View style={s.previewEmpty}><Text style={s.previewEmptyText}>이미지 없음</Text></View>
            )}
          </View>

          {/* 결과 텍스트 */}
          <View style={{ alignItems: "center", marginTop: 10 }}>
            <Text style={s.scoreText}>유사도 {score}%</Text>
            <Text style={s.question}>"{label}"이 맞나요?</Text>
          </View>

          {/* 버튼 2개 */}
          <View style={s.row}>
            <TouchableOpacity style={s.secondaryBtn} onPress={() => onPick(false)}>
              <Text style={s.secondaryText}>아니요</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.primaryBtn} onPress={() => onPick(true)}>
              <Text style={s.primaryText}>네</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centerWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  card: {
    width: "100%", maxWidth: 520, backgroundColor: COLORS.card, borderRadius: 16, padding: 18,
    shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 2,
  },
  previewWrap: {
    width: "100%", height: 260, backgroundColor: "#F5F7FA", borderRadius: 12, overflow: "hidden",
    borderWidth: 1, borderColor: COLORS.border,
  },
  preview: { width: "100%", height: "100%" },
  previewEmpty: { flex: 1, alignItems: "center", justifyContent: "center" },
  previewEmptyText: { color: COLORS.sub },

  scoreText: { fontSize: 18, color: COLORS.sub, marginTop: 6 },
  question: { fontFamily: "Jua_400Regular", fontSize: 24, color: COLORS.text, marginTop: 6 },

  row: { flexDirection: "row", gap: 10, marginTop: 14 },
  primaryBtn: {
    flex: 1, height: 52, borderRadius: 14, backgroundColor: COLORS.primary,
    alignItems: "center", justifyContent: "center",
  },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  secondaryBtn: {
    flex: 1, height: 52, borderRadius: 14, backgroundColor: "#fff",
    borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center",
  },
  secondaryText: { color: COLORS.text, fontWeight: "700", fontSize: 16 },
});
