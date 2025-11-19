// app/analyze/preview.tsx
import React, { useCallback } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View, Text, Image, StyleSheet, TouchableOpacity, Platform, KeyboardAvoidingView,
} from "react-native";

type Params = { uri?: string };

const COLORS = {
  bg: "#F7F9FB",
  card: "#FFFFFF",
  text: "#0F172A",
  sub: "#64748B",
  primary: "#10B981",
  primaryDark: "#059669",
  border: "#E2E8F0",
};

export default function AnalyzePreview() {
  const router = useRouter();
  const { uri } = useLocalSearchParams<Params>();

  const onAnalyze = useCallback(() => {
    if (!uri) return;
    router.push({ pathname: "/(tabs)/analyze/progress", params: { uri, label: "소주병" } });
  }, [router, uri]);

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={s.centerWrap}>
        <View style={s.header}>
          <Text style={s.title}>미리보기</Text>
          <Text style={s.caption}>이미지를 확인하고 분석을 시작하세요</Text>
        </View>

        <View style={s.card}>
          <View style={s.previewWrap}>
            {uri ? (
              <Image source={{ uri }} style={s.preview} resizeMode="contain" />
            ) : (
              <View style={s.previewEmpty}>
                <Text style={s.previewEmptyText}>이미지 URI가 전달되지 않았습니다.</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={[s.primaryBtn, !uri && { opacity: 0.6 }]} onPress={onAnalyze} disabled={!uri}>
            <Text style={s.primaryText}>분석 시작</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.secondaryBtn} onPress={() => router.back()}>
            <Text style={s.secondaryText}>뒤로가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centerWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  header: { alignItems: "center", marginBottom: 14 },
  title: { fontFamily: "Jua_400Regular", color: COLORS.text, fontSize: 30, marginTop: 2 },
  caption: { color: COLORS.sub, marginTop: 4, fontSize: 13 },
  card: {
    width: "100%", maxWidth: 520, backgroundColor: COLORS.card, borderRadius: 16, padding: 18,
    shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 2,
  },
  previewWrap: {
    width: "100%", height: 380, backgroundColor: "#F5F7FA", borderRadius: 12, overflow: "hidden",
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 14,
  },
  preview: { width: "100%", height: "100%" },
  previewEmpty: { flex: 1, alignItems: "center", justifyContent: "center" },
  previewEmptyText: { color: COLORS.sub },
  primaryBtn: {
    height: 52, borderRadius: 14, backgroundColor: COLORS.primary,
    alignItems: "center", justifyContent: "center", marginTop: 4,
  },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  secondaryBtn: {
    height: 48, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: COLORS.border,
    alignItems: "center", justifyContent: "center", marginTop: 10,
  },
  secondaryText: { color: COLORS.text, fontWeight: "600", fontSize: 15 },
});
