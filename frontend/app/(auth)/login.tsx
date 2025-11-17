// app/(auth)/login.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { login as apiLogin } from "@/src/features/auth/api";
import { useAuth } from "@store/auth";

const COLORS = {
  bg: "#F7F9FB",
  card: "#FFFFFF",
  text: "#0F172A",
  sub: "#64748B",
  primary: "#10B981",
  primaryDark: "#059669",
  border: "#E2E8F0",
  error: "#EF4444",
};

export default function LoginScreen() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState<"id" | "pw" | null>(null);

  const router = useRouter();
  const doLogin = useAuth((s) => s.login);

  const handleLogin = async () => {
    const _id = id.trim();
    if (!_id || !pw) {
      return Alert.alert("확인", "아이디와 비밀번호를 모두 입력해주세요.");
    }

    try {
      setLoading(true);

      // 👇 백엔드 LoginRequest 타입이 { username, password } 라고 가정
      await apiLogin({
        username: _id,
        password: pw,
      });

      // 로그인 성공시 클라이언트 상태 업데이트
      doLogin(_id);
      router.replace("/(tabs)"); // 성공 후 홈 탭으로
    } catch (e: any) {
      Alert.alert("오류", e?.message ?? "로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.header}>
          <Text style={s.title}>로그인</Text>
          <Text style={s.caption}>사진으로 분리배출을 더 쉽게</Text>
        </View>

        <View style={s.card}>
          {/* 아이디 */}
          <View style={[s.inputWrap, focus === "id" && s.inputWrapActive]}>
            <Ionicons
              name="person-outline"
              size={20}
              color={focus === "id" ? COLORS.primaryDark : COLORS.sub}
              style={s.inputIcon}
            />
            <TextInput
              style={s.input}
              value={id}
              onChangeText={setId}
              placeholder="아이디"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              onFocus={() => setFocus("id")}
              onBlur={() => setFocus(null)}
              returnKeyType="next"
            />
          </View>

          {/* 비밀번호 */}
          <View
            style={[
              s.inputWrap,
              focus === "pw" && s.inputWrapActive,
              { marginTop: 14 },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={focus === "pw" ? COLORS.primaryDark : COLORS.sub}
              style={s.inputIcon}
            />
            <TextInput
              style={s.input}
              value={pw}
              onChangeText={setPw}
              placeholder="비밀번호"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              secureTextEntry
              onFocus={() => setFocus("pw")}
              onBlur={() => setFocus(null)}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </View>

          {/* 로그인 버튼 */}
          <TouchableOpacity
            style={[s.primaryBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.primaryText}>로그인</Text>
            )}
          </TouchableOpacity>

          {/* 보조 링크 */}
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity style={s.linkBtn}>
              <Text style={s.linkText}>아직 회원가입을 안하셨나요?</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  // 중앙 정렬 대신 ScrollView content에서 정렬
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  header: { alignItems: "center", marginBottom: 14 },
  brand: {
    fontFamily: "Jua_400Regular",
    color: COLORS.text,
    fontSize: 18,
    letterSpacing: 0.3,
  },
  title: {
    fontFamily: "Jua_400Regular",
    color: COLORS.text,
    fontSize: 30,
    marginTop: 2,
  },
  caption: { color: COLORS.sub, marginTop: 4, fontSize: 13 },

  card: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },

  inputWrap: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFF",
    paddingLeft: 44,
    paddingRight: 14,
    justifyContent: "center",
  },
  inputWrapActive: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  inputIcon: { position: "absolute", left: 14 },
  input: { fontSize: 16, color: COLORS.text },

  primaryBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  linkBtn: { paddingVertical: 12, alignItems: "center" },
  linkText: {
    color: COLORS.primaryDark,
    textDecorationLine: "underline",
    fontSize: 13,
  },
});
