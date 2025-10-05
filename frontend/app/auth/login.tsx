// 간단한 로그인 폼 (데모): 이름만 입력해서 로그인. 실제로는 이메일/비번 + API 연동 예정.

import { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@store/auth";

export default function LoginScreen() {
  const [name, setName] = useState("지민");
  const login = useAuth((s) => s.login);
  const router = useRouter();

  const onSubmit = () => {
    // TODO: 실제 앱에선 서버에 로그인 요청 → 토큰 저장
    login(name.trim() || "사용자");
    router.replace("/(tabs)"); // 로그인 성공 후 홈으로
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="이름을 입력하세요"
        style={styles.input}
      />
      <TouchableOpacity onPress={onSubmit} style={styles.primaryBtn}>
        <Text style={styles.primaryText}>로그인하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12 },
  primaryBtn: { backgroundColor: "#111827", padding: 14, borderRadius: 12, alignItems: "center", marginTop: 8 },
  primaryText: { color: "#fff", fontWeight: "700" },
});
