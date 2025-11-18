// login.tsx
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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { login as apiLogin } from "@/src/features/auth/api";
import { useAuth } from "@store/auth"; // ✅ 전역 로그인 상태

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

  const [focus, setFocus] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false); // ✅ 로그인 성공 화면 전환용

  const router = useRouter();
  const { login } = useAuth(); // ✅ 전역 store에서 login 액션 가져오기

  const handleLogin = async () => {
    const _id = id.trim();
    const _pw = pw;

    setFormError(null);

    if (!_id) {
      const msg = "아이디를 입력해주세요.";
      setFormError(msg);
      Alert.alert("확인", msg);
      return;
    }
    if (!_pw) {
      const msg = "비밀번호를 입력해주세요.";
      setFormError(msg);
      Alert.alert("확인", msg);
      return;
    }

    try {
      setLoading(true);

      const res = await apiLogin({
        username: _id,
        password: _pw,
      });
      console.log("로그인 성공 응답:", res);

      // ✅ 1) 전역 상태 업데이트 (홈에서 쓸 이름 저장)
      //    여기서는 일단 로그인 아이디(_id)를 이름으로 사용
      login(_id);

      // ✅ 2) 로그인 성공 화면으로 전환
      setSuccess(true);
    } catch (e: any) {
      console.log("로그인 에러:", e);

      let msg: string;
      if (e?.message === "Network request failed") {
        msg = "서버와 통신할 수 없습니다. 네트워크 상태를 확인해주세요.";
      } else {
        msg = "아이디 또는 비밀번호가 잘못되었습니다.";
      }

      setFormError(msg);
      Alert.alert("로그인 실패", msg);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 로그인 성공 화면
  if (success) {
    return (
      <KeyboardAvoidingView
        style={s.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={s.centerWrap}>
          <View style={s.card}>
            <Text style={s.title}>로그인에 성공하셨습니다! 🎉</Text>
            <Text style={[s.caption, { marginTop: 10 }]}>
              홈 화면으로 이동합니다.
            </Text>

            <TouchableOpacity
              style={[s.primaryBtn, { marginTop: 24 }]}
              onPress={() => router.replace("/(tabs)")} // ✅ tabs/index 가 홈
            >
              <Text style={s.primaryText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ✅ 기본 로그인 폼 화면
  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={s.centerWrap}>
        {/* 헤더 */}
        <View style={s.header}>
          <Text style={s.title}>로그인</Text>
          {/* "다시 오셨군요 😊" 제거 */}
        </View>

        {/* 카드 */}
        <View style={s.card}>
          {/* 에러 박스 */}
          {formError && (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{formError}</Text>
            </View>
          )}

          <InputWithIcon
            label="아이디"
            icon="at-outline"
            value={id}
            onChangeText={setId}
            onFocus={() => setFocus("id")}
            onBlur={() => setFocus(null)}
            focused={focus === "id"}
          />

          <InputWithIcon
            label="비밀번호"
            icon="lock-closed-outline"
            value={pw}
            onChangeText={setPw}
            secureTextEntry
            onFocus={() => setFocus("pw")}
            onBlur={() => setFocus(null)}
            focused={focus === "pw"}
          />

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

          {/* 회원가입 이동 */}
          <TouchableOpacity
            style={s.linkBtn}
            onPress={() => router.push("/(auth)/register")}
          >
            <Text style={s.linkText}>아직 계정이 없으신가요? 회원가입하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

/* --- 재사용 입력 컴포넌트 --- */
function InputWithIcon({ label, icon, focused, style, ...rest }: any) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.inputWrap, focused && s.inputWrapActive, style]}>
        <Ionicons
          name={icon}
          size={20}
          color={focused ? COLORS.primaryDark : COLORS.sub}
          style={s.inputIcon}
        />
        <TextInput
          {...rest}
          style={s.input}
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
        />
      </View>
    </View>
  );
}

/* --- 스타일 --- */
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: { alignItems: "center", marginBottom: 14 },
  title: {
    fontFamily: "Jua_400Regular",
    color: COLORS.text,
    fontSize: 30,
    marginTop: 2,
  },
  caption: { color: COLORS.sub, marginTop: 4, fontSize: 13 },

  card: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },

  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
  },

  label: { color: COLORS.sub, fontSize: 13, marginBottom: 6 },

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
    marginTop: 10,
  },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  linkBtn: {
    marginTop: 14,
    alignItems: "center",
  },
  linkText: {
    color: COLORS.sub,
    fontSize: 13,
    textDecorationLine: "underline",
  },
});
