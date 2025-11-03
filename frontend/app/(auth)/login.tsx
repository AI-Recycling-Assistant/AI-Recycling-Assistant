// app/(auth)/login.tsx  또는 경로에 맞게 배치
import { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { login as apiLogin } from "@/src/features/auth/api";   // ✅ POST /login { id, pw }
import { useAuth } from "@store/auth";                     // ✅ Zustand: { isLoggedIn, username, login(name), logout() }

export default function LoginScreen() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const doLogin = useAuth(s => s.login); // login(name: string)

  const handleLogin = async () => {
    const _id = id.trim();
    if (!_id || !pw) {
      return Alert.alert("확인", "아이디와 비밀번호를 모두 입력해주세요.");
    }

    try {
      setLoading(true);

      // 🔐 백엔드 로그인 요청: POST /login  (payload: { id, pw })
      const res = await apiLogin({ id: _id, pw });

      // 응답 스펙은 팀 명세에 맞춰 사용 (예: res.ok, res.token 등)
      if (res?.ok === false) {
        return Alert.alert("로그인 실패", "아이디 또는 비밀번호를 확인해주세요.");
      }

      // (선택) 토큰 저장이 필요하면 여기서 SecureStore 등으로 저장
      // if (res.token) await SecureStore.setItemAsync("accessToken", res.token);

      // ✅ 전역 상태에 로그인 반영 (임시로 id를 표시 이름으로 사용)
      doLogin(_id);

      // 홈으로 이동
      router.replace("/");
    } catch (e: any) {
      Alert.alert("오류", e?.message ?? "로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.label}>아이디</Text>
      <TextInput
        style={s.input}
        placeholder="아이디"
        placeholderTextColor="#6a8f81"
        autoCapitalize="none"
        value={id}
        onChangeText={setId}
      />

      <Text style={s.label}>비밀번호</Text>
      <TextInput
        style={s.input}
        placeholder="비밀번호"
        placeholderTextColor="#6a8f81"
        autoCapitalize="none"
        secureTextEntry
        value={pw}
        onChangeText={setPw}
      />

      <TouchableOpacity
        style={[s.primaryBtn, loading && { opacity: 0.6 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? <ActivityIndicator /> : <Text style={s.primaryText}>로그인</Text>}
      </TouchableOpacity>

      <Link href="/(auth)/register" asChild>
        <TouchableOpacity style={s.linkBtn}>
          <Text style={s.linkText}>아직 회원가입을 안하셨나요?</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 14, backgroundColor: "#FFFFFF" },
  label: { color: "#cfe8dd", fontSize: 14, marginTop: 8 },
  input: {
    height: 48, borderWidth: 1, borderColor: "#254638",
    borderRadius: 12, paddingHorizontal: 14, color: "#e9f7f0",
    backgroundColor: "#12211b",
  },
  primaryBtn: {
    height: 52, borderRadius: 14, backgroundColor: "#1aa179",
    alignItems: "center", justifyContent: "center", marginTop: 16,
  },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  linkBtn: { paddingVertical: 12, alignItems: "center" },
  linkText: { color: "#7bd7b7", textDecorationLine: "underline", fontSize: 13 },
});
