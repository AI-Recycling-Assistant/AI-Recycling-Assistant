// 홈 탭: 로그인 전/후에 따라 다른 UI를 보여준다.

import { Link, type Href } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useAuth } from "@store/auth";
import FeatureCard from "@components/FeatureCard";

export default function Home() {
  const { isLoggedIn, username, login, logout } = useAuth();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>"버리지 말고, 분리하자"</Text>

      <View style={styles.row}>
        <FeatureCard title={"FAQ\n빠른가이드"} caption="분리배출 How-To" href={"/(tabs)/faq" as Href} tint="#93c5fd" />
        <FeatureCard title={"AI\n사진분석"} caption="사진으로 가이드" href={"/(tabs)/analyze" as Href} tint="#fdba74" />
        <FeatureCard title={"쓰담이들\n커뮤니티"} caption="팁/정보 공유" href={"/(tabs)/community" as Href} tint="#c4b5fd" />
      </View>

      {/* 로그인 전 (왼쪽 스케치) */}
      {!isLoggedIn && (
        <View style={{ marginTop: 20, gap: 12 }}>
          {/* 진짜 로그인 화면으로 이동 */}
          <Link href="/auth/login" asChild>
            <TouchableOpacity style={styles.primaryBtn}>
              <Text style={styles.primaryText}>로그인 / 회원가입</Text>
            </TouchableOpacity>
          </Link>

          {/* 데모용: 버튼 한 번으로 로그인 (실서비스에선 제거) */}
          <TouchableOpacity onPress={() => login("지민")} style={[styles.primaryBtn, { backgroundColor: "#e5e7eb" }]}>
            <Text style={[styles.primaryText, { color: "#111827" }]}>(데모) 지민으로 로그인</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 로그인 후 (오른쪽 스케치) */}
      {isLoggedIn && (
        <View style={{ marginTop: 20, gap: 12 }}>
          <Text style={styles.welcome}>{username} 님, 반가워요 :)</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity onPress={logout} style={styles.ghostBtn}>
              <Text style={styles.ghostText}>로그아웃</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 하단 약관/버전 자리 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>약관 · 개인정보 · v0.1</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#fff", // 선택 사항
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  tiles: {
  width: "100%",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  flexWrap: "wrap", // 화면이 좁으면 자동 줄바꿈
},
  row: { flexDirection: "row", gap: 12 },
  primaryBtn: { backgroundColor: "#111827", padding: 14, borderRadius: 12, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "700" },
  welcome: { fontSize: 18, fontWeight: "700" },
  ghostBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: "#e5e7eb" },
  ghostText: { fontWeight: "600", color: "#111827" },
  footer: { marginTop: 24, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#e5e7eb", paddingTop: 12, alignItems: "center" },
  footerText: { color: "#6b7280" },
});
