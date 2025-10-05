import { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Link, useRouter } from "expo-router";

export default function LoginScreen() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    if (!id.trim() || !pw) {
      return Alert.alert("확인", "아이디와 비밀번호를 모두 입력해주세요.");
    }
    // ★ API 없이 임시 성공 처리
    Alert.alert("로그인", "프론트 전용 데모입니다. 홈으로 이동합니다.", [
      { text: "확인", onPress: () => router.replace("/") },
    ]);
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

      <TouchableOpacity style={s.primaryBtn} onPress={handleLogin}>
        <Text style={s.primaryText}>로그인</Text>
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
