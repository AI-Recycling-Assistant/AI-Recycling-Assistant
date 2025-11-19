// app/(tabs)/index.tsx
import { Link } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useAuth } from "@store/auth";
import RecycleBinButton from "@components/RecycleBinButton";
import RoundedTitle from "@/components/RoundedTitle";

export default function Home() {
  const { isLoggedIn, username, logout, hydrated } = useAuth();
  const displayName = username ?? "사용자";

  // ✅ 아직 zustand persist가 localStorage/AsyncStorage에서 값을 못 읽어온 상태이면
  //    잠깐 로딩 화면만 보여준다.
  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={s.container}>
      {/* 헤더 타이포 */}
      <View style={s.headerWrap}>
        <RoundedTitle
          brand="#1AA179"
          subtitle="버리지 말고,"
          title="분리하자"
          center
        />
        <View style={s.ribbon} />
      </View>

      {/* 상단 메인 카드 */}
      <View style={s.tilesTop}>
        <RecycleBinButton
          title={"AI\n사진분석"}
          caption="사진으로 가이드"
          href="/analyze"
          tint="#9AC4B6"
          lidColor="#799a8fff"
          characterSource={require("@/assets/characters/ssdamy.png")}
          iconDiameter={56}
          iconCharacterSize={38}
          popCharacterSize={50}
          popOut={24}
          characterTopOffset={6}
          openMode="hold"
          navigateOnHoldRelease
          openPreviewMs={320}
        />
      </View>

      {/* 하단 두 카드 */}
      <View style={s.tilesBottom}>
        <RecycleBinButton
          title={"FAQ\n빠른가이드"}
          caption="분리배출 How-To"
          href="/faq"
          tint="#F6F1CA"
          lidColor="#dad5b2ff"
          characterSource={require("@/assets/characters/ssdamy2.png")}
          iconDiameter={48}
          iconCharacterSize={32}
          popCharacterSize={50}
          popOut={24}
          characterTopOffset={6}
          openMode="hold"
          navigateOnHoldRelease
          openPreviewMs={320}
        />
        <RecycleBinButton
          title={"쓰담이들\n커뮤니티"}
          caption="팁/정보 공유"
          href="/community"
          tint="#83A6B3"
          lidColor="#6b8993ff"
          characterSource={require("@/assets/characters/ssdamy3.png")}
          iconDiameter={48}
          iconCharacterSize={32}
          popCharacterSize={50}
          popOut={24}
          characterTopOffset={6}
          openMode="hold"
          navigateOnHoldRelease
          openPreviewMs={320}
        />
      </View>

      {/* 인증 영역 */}
      {!isLoggedIn ? (
        <View style={s.ctaWrap}>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={s.primaryBtn}>
              <Text style={s.primaryText}>로그인 / 회원가입</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ) : (
        <View style={s.authedWrap}>
          <Text style={s.welcome}>{displayName} 님, 반가워요 :)</Text>
          <View style={{ flexDirection: "row", marginTop: 12 }}>
            <TouchableOpacity onPress={logout} style={s.ghostBtn}>
              <Text style={s.ghostText}>로그아웃</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 하단 정보 */}
      <View style={s.footer}>
        <Text style={s.footerText}>약관 · 개인정보 · v0.1</Text>
      </View>
    </ScrollView>
  );
}

// 스타일은 그대로
const s = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  headerWrap: {
    width: "100%",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  ribbon: {
    width: 160,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#1AA179",
    opacity: 0.25,
    marginTop: 8,
  },
  tilesTop: {
    width: "100%",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 14,
  },
  tilesBottom: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  ctaWrap: { width: "100%", alignItems: "center", marginTop: 22 },
  primaryBtn: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 220,
  },
  primaryText: { color: "#fff", fontWeight: "700" },
  authedWrap: { width: "100%", alignItems: "center", marginTop: 22 },
  welcome: { fontSize: 18, fontWeight: "700" },
  ghostBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  ghostText: { fontWeight: "600", color: "#111827" },
  footer: {
    marginTop: 26,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
    alignItems: "center",
  },
  footerText: { color: "#6b7280" },
});
