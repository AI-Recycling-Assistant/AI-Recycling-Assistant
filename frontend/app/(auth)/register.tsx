import { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Switch, ActivityIndicator,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { register as apiRegister } from "@/src/features/auth/api"; // ✅ 백엔드 회원가입 API

const PW_RULE = /^(?=.*[a-z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]).{8,}$/;

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [nickname, setNickname] = useState("");
  const [agree, setAgree] = useState(false);

  // 데모 중복확인(실제 API 연결 시 이 부분만 교체)
  const [idOk, setIdOk] = useState<null | boolean>(null);
  const [nickOk, setNickOk] = useState<null | boolean>(null);

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fakeCheckId = () => {
    if (!id.trim()) return Alert.alert("확인", "아이디를 입력해주세요.");
    const ok = id.trim().length >= 4;
    setIdOk(ok);
    Alert.alert("아이디 중복확인", ok ? "사용 가능(데모)" : "사용 불가(데모)");
  };

  const fakeCheckNick = () => {
    if (!nickname.trim()) return Alert.alert("확인", "닉네임을 입력해주세요.");
    const ok = nickname.trim().length >= 2;
    setNickOk(ok);
    Alert.alert("닉네임 중복확인", ok ? "사용 가능(데모)" : "사용 불가(데모)");
  };

  const handleSubmit = async () => {
    const _name = name.trim();
    const _id = id.trim();
    const _nickname = nickname.trim();

    if (!_name) return Alert.alert("확인", "이름을 입력해주세요.");
    if (!_id) return Alert.alert("확인", "아이디를 입력해주세요.");
    if (!PW_RULE.test(pw)) {
      return Alert.alert("비밀번호 규칙", "영 소문자와 특수문자를 포함해 8자리 이상이어야 합니다.");
    }
    if (pw !== pw2) return Alert.alert("확인", "비밀번호가 일치하지 않습니다.");
    if (!_nickname) return Alert.alert("확인", "닉네임을 입력해주세요.");
    if (!agree) return Alert.alert("확인", "개인정보 약관에 동의해주세요.");

    try {
      setLoading(true);
      // ✅ 백엔드 회원가입 호출
      // 요청 예시: { id, pw, name, nickname }
      // 응답 예시: { ok: true } 또는 { user: {...} }
      await apiRegister({ username: _id, password: pw, nickname: _nickname });

      Alert.alert("가입 완료", "로그인 화면으로 이동합니다.", [
        { text: "확인", onPress: () => router.replace("/(auth)/login") },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "회원가입 중 오류가 발생했습니다.";
      Alert.alert("오류", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      {/* 상단 헤더 완전 제거(루트/그룹에서 꺼뒀으면 생략 가능) */}
      <Stack.Screen options={{ headerShown: false }} />

      <Text style={s.title}>회원가입</Text>

      <LabeledInput label="이름" value={name} onChangeText={setName} />

      <RowWithButton
        label="아이디"
        value={id}
        onChangeText={(t: string) => { setId(t); setIdOk(null); }}
        buttonText="중복확인"
        onPress={fakeCheckId}   // ← 실제 API 있으면 여기만 바꾸면 됨
        checked={idOk}
      />

      <LabeledInput
        label="비밀번호"
        value={pw}
        onChangeText={setPw}
        secureTextEntry
        placeholder="영 소문자·특수문자 포함 8자리 이상"
      />
      <LabeledInput
        label="비밀번호 확인"
        value={pw2}
        onChangeText={setPw2}
        secureTextEntry
      />

      <RowWithButton
        label="닉네임"
        value={nickname}
        onChangeText={(t: string) => { setNickname(t); setNickOk(null); }}
        buttonText="중복확인"
        onPress={fakeCheckNick} // ← 실제 API 있으면 교체
        checked={nickOk}
      />

      <View style={s.agreeRow}>
        <Switch
          value={agree}
          onValueChange={setAgree}
          trackColor={{ false: "#E5E7EB", true: "#1AA179" }}
          thumbColor="#FFFFFF"
        />
        <Text style={s.agreeText}>개인정보 약관 동의</Text>
      </View>

      <TouchableOpacity style={[s.primaryBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator /> : <Text style={s.primaryText}>완료</Text>}
      </TouchableOpacity>
    </View>
  );
}

/* 공용 컴포넌트들 – 로그인 톤과 동일 */
function LabeledInput(props: any) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.label}>{props.label}</Text>
      <TextInput
        {...props}
        style={[s.input, props.style]}
        placeholderTextColor="#6B7280"
        autoCapitalize="none"
      />
    </View>
  );
}

function RowWithButton({
  label, value, onChangeText, buttonText, onPress, checked,
}: any) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.label}>{label}</Text>
      <View style={s.row}>
        <TextInput
          style={[s.input, { flex: 1 }]}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor="#6B7280"
          autoCapitalize="none"
        />
        <TouchableOpacity style={s.smallBtn} onPress={onPress}>
          <Text style={s.smallBtnText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
      {checked !== null && (
        <Text style={{ color: checked ? "#059669" : "#EF4444", fontSize: 12 }}>
          {checked ? "사용 가능(데모)" : "사용 불가(데모)"}
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 14, backgroundColor: "#FFFFFF" },
  title: { fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 12 },
  label: { color: "#6B7280", fontSize: 14, marginTop: 8, marginBottom: 2 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E5E7EB",          // 연한 보더
    backgroundColor: "#FFFFFF",      // 밝은 입력창
    borderRadius: 12,
    paddingHorizontal: 14,
    color: "#111827",                // 입력 텍스트
  },
  row: { flexDirection: "row", gap: 8, alignItems: "center" },
  smallBtn: {
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#111827",      // 홈/로그인과 동일 톤
    alignItems: "center",
    justifyContent: "center",
  },
  smallBtnText: { color: "#fff", fontWeight: "700" },
  agreeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  agreeText: { color: "#111827" },
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#111827",      // 메인 액션 버튼 컬러 통일
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
