// 홈 탭: 로그인 전/후에 따라 다른 UI를 보여준다.

import { Link } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useAuth } from "@store/auth";
// 기존 FeatureCard는 사용 안 함: import 제거
import RecycleBinButton from "@components/RecycleBinButton"; // ✅ default import

export default function Home() {
  const { isLoggedIn, username, login, logout } = useAuth();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 화면에 따옴표가 찍히지 않도록 수정 */}
      <Text style={styles.title}>버리지 말고, 분리하자</Text>

      <View style={styles.tilesTop}>
        <RecycleBinButton
          title={"AI\n사진분석"}
          caption="사진으로 가이드"
          href="/(tabs)/analyze"
          tint="#93c5fd"
          lidColor="#60a5fa"
        />
      </View>

      <View style ={styles.tilesBottom}>
        <RecycleBinButton
          title={"FAQ\n빠른가이드"}
          caption="분리배출 How-To"
          href="/(tabs)/faq"
          tint="#fdba74"
          lidColor="#fb923c"
        />
        <RecycleBinButton
          title={"쓰담이들\n커뮤니티"}
          caption="팁/정보 공유"
          href="/(tabs)/community"
          tint="#c4b5fd"
          lidColor="#a78bfa"
        />
      </View>

      {/* 로그인 전 */}
      {!isLoggedIn && (
        <View style={{ marginTop: 20 }}>
          <Link href="/auth/login" asChild>
            <TouchableOpacity style={styles.primaryBtn}>
              <Text style={styles.primaryText}>로그인 / 회원가입</Text>
            </TouchableOpacity>
          </Link>

          {/* 데모 로그인 (실서비스 제거) */}
          <TouchableOpacity onPress={() => login("지민")} style={[styles.primaryBtn, { backgroundColor: "#e5e7eb", marginTop: 12 }]}>
            <Text style={[styles.primaryText, { color: "#111827" }]}>(데모) 지민으로 로그인</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 로그인 후 */}
      {isLoggedIn && (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.welcome}>{username} 님, 반가워요 :)</Text>
          <View style={{ flexDirection: "row", marginTop: 12 }}>
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
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 18,
    textAlign: "center",
  },
  tiles: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    // RN 버전에 따라 gap 미지원이면 각 버튼 margin으로 대체됨
    // 여기선 버튼 자체 margin: 6을 줬으니 OK
  },
   tilesTop: {
    width: "100%",
    alignItems: "center",     // 가운데에 하나
    marginBottom: 12,
  },
  tilesBottom: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center", // 가운데로 두 개
    gap: 12,                  // RN 버전에 따라 미지원이면 각 버튼 margin으로 대체
  },
  primaryBtn: { backgroundColor: "#111827", padding: 14, borderRadius: 12, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "700" },
  welcome: { fontSize: 18, fontWeight: "700" },
  ghostBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: "#e5e7eb" },
  ghostText: { fontWeight: "600", color: "#111827" },
  footer: { marginTop: 24, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#e5e7eb", paddingTop: 12, alignItems: "center" },
  footerText: { color: "#6b7280" },
});
