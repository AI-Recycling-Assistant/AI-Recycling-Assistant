// app/(tabs)/analyze/confirm.tsx
import React, { useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Params = { uri?: string; label?: string; score?: string };

const COLORS = {
  bg: "#F7F9FB",
  card: "#FFFFFF",
  text: "#0F172A",
  sub: "#64748B",
  primary: "#10B981",
  border: "#E2E8F0",
};

export default function AnalyzeConfirm() {
  const router = useRouter();
  const { uri, label = "소주병", score } = useLocalSearchParams<Params>();

  const parsedScore = useMemo(() => {
    const n = Number(score);
    if (Number.isNaN(n)) return null;
    return Math.max(0, Math.min(100, Math.round(n)));
  }, [score]);

  const titleLabel = label || "물체";

  const onRetry = () => {
    router.replace("/(tabs)/analyze" as never);
  };

  const onGoHome = () => {
    router.replace("/(tabs)/home" as never); // 실제 홈 탭 경로에 맞게 조정
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* 상단 헤더 (커스텀만 사용) */}
        <View style={s.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>AI 사진 분석</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* 본문 */}
        <ScrollView
          contentContainerStyle={s.body}
          bounces
          showsVerticalScrollIndicator={false}
        >
          <View style={s.card}>
            {/* 제목 / 요약 */}
            <View style={s.header}>
              <Text style={s.title}>단계별 가이드</Text>
              <Text style={s.subTitle}>
                {parsedScore !== null
                  ? `이 물체는 "${titleLabel}"일 확률 약 ${parsedScore}%로 추정돼요.`
                  : `"${titleLabel}"으로 분류되었어요.`}
              </Text>
            </View>

            {/* 4단계 가이드 */}
            <View style={s.stepsGrid}>
              <View style={s.stepRow}>
                <View style={s.stepBox}>
                  <View style={s.stepBadge}>
                    <Text style={s.stepBadgeText}>1단계</Text>
                  </View>
                  <Text style={s.stepText}>라벨 및 뚜껑 제거</Text>
                </View>

                <Text style={s.arrow}>➜</Text>

                <View style={s.stepBox}>
                  <View style={s.stepBadge}>
                    <Text style={s.stepBadgeText}>2단계</Text>
                  </View>
                  <Text style={s.stepText}>내용물 비우고 가볍게 헹구기</Text>
                </View>
              </View>

              <View style={s.stepRow}>
                <View style={s.stepBox}>
                  <View style={s.stepBadge}>
                    <Text style={s.stepBadgeText}>3단계</Text>
                  </View>
                  <Text style={s.stepText}>깨진 병은 신문지 등으로 포장</Text>
                </View>

                <Text style={s.arrow}>➜</Text>

                <View style={s.stepBox}>
                  <View style={s.stepBadge}>
                    <Text style={s.stepBadgeText}>4단계</Text>
                  </View>
                  <Text style={s.stepText}>유리병 전용 수거함에 배출</Text>
                </View>
              </View>
            </View>

            {/* 지역 규정 안내 */}
            <View style={s.infoBox}>
              <Text style={s.infoText}>
                지역별 세부 분리배출 규정은 추후 연동될 예정입니다.
                {"\n"}지자체 안내 스티커나 환경부 분리배출 안내도 함께
                확인해 주세요.
              </Text>
            </View>

            {/* 버튼들 */}
            <View style={s.buttonRow}>
              <TouchableOpacity style={s.secondaryBtn} onPress={onRetry}>
                <Text style={s.secondaryText}>다시 분석</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.primaryBtn} onPress={onGoHome}>
                <Text style={s.primaryText}>홈으로</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.bg },

  // 상단 헤더
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontFamily: "Jua_400Regular",
    fontSize: 18,
    color: COLORS.text,
  },

  // 본문 영역
  body: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 32,
  },

  // 카드
  card: {
    borderRadius: 28,
    backgroundColor: COLORS.card,
    paddingHorizontal: 24,
    paddingVertical: 26,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },

  header: { marginBottom: 22 },
  title: {
    fontFamily: "Jua_400Regular",
    fontSize: 30,
    color: COLORS.text,
    marginBottom: 6,
  },
  subTitle: {
    color: COLORS.sub,
    fontSize: 14,
    lineHeight: 20,
  },

  // 단계 박스들
  stepsGrid: {
    gap: 18,
    marginBottom: 22,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
  },
  stepBox: {
    flex: 1,
    minHeight: 110,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 14,
  },
  stepBadge: {
    position: "absolute",
    top: 8,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#111827",
  },
  stepBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  stepText: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
  },
  arrow: {
    alignSelf: "center",
    marginHorizontal: 12,
    fontSize: 20,
    color: COLORS.sub,
  },

  // 안내 박스
  infoBox: {
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    marginBottom: 24,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.text,
  },

  // 버튼들
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    color: COLORS.text,
    fontWeight: "600",
    fontSize: 16,
  },
  primaryBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
