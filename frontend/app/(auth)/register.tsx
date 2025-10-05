import { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Switch } from "react-native";
import { useRouter } from "expo-router";

const PW_RULE = /^(?=.*[a-z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]).{8,}$/;

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [nickname, setNickname] = useState("");
  const [agree, setAgree] = useState(false);

  // 프론트만: 중복확인은 임시 표시용
  const [idOk, setIdOk] = useState<null | boolean>(null);
  const [nickOk, setNickOk] = useState<null | boolean>(null);

  const router = useRouter();

  const fakeCheckId = () => {
    if (!id.trim()) return Alert.alert("확인", "아이디를 입력해주세요.");
    // 데모: 길이 4자 이상이면 가능으로 표시
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

  const handleSubmit = () => {
    if (!name.trim()) return Alert.alert("확인", "이름을 입력해주세요.");
    if (!id.trim()) return Alert.alert("확인", "아이디를 입력해주세요.");
    if (!PW_RULE.test(pw)) {
      return Alert.alert("비밀번호 규칙", "영 소문자와 특수문자를 포함해 8자리 이상이어야 합니다.");
    }
    if (pw !== pw2) return Alert.alert("확인", "비밀번호가 일치하지 않습니다.");
    if (!nickname.trim()) return Alert.alert("확인", "닉네임을 입력해주세요.");
    if (!agree) return Alert.alert("확인", "개인정보 약관에 동의해주세요.");

    // ★ API 없이 성공 플로우
    Alert.alert("가입 완료", "회원가입이 완료되었습니다. 로그인 화면으로 이동합니다.", [
      { text: "확인", onPress: () => router.replace("/(auth)/login") },
    ]);
  };

  return (
    <View style={s.container}>
      <LabeledInput label="이름" value={name} onChangeText={setName} />

      <RowWithButton
        label="아이디"
        value={id}
        onChangeText={(t: string) => { setId(t); setIdOk(null); }}
        buttonText="중복확인"
        onPress={fakeCheckId}
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
        onPress={fakeCheckNick}
        checked={nickOk}
      />

      <View style={s.agreeRow}>
        <Switch value={agree} onValueChange={setAgree} />
        <Text style={s.agreeText}>개인정보 약관 동의</Text>
      </View>

      <TouchableOpacity style={s.primaryBtn} onPress={handleSubmit}>
        <Text style={s.primaryText}>완료</Text>
      </TouchableOpacity>
    </View>
  );
}

/* 공용 컴포넌트들 */
function LabeledInput(props: any) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.label}>{props.label}</Text>
      <TextInput
        {...props}
        style={[s.input, props.style]}
        placeholderTextColor="#6a8f81"
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
          placeholderTextColor="#6a8f81"
          autoCapitalize="none"
        />
        <TouchableOpacity style={s.smallBtn} onPress={onPress}>
          <Text style={s.smallBtnText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
      {checked !== null && (
        <Text style={{ color: checked ? "#7bd7b7" : "#ff8a8a", fontSize: 12 }}>
          {checked ? "사용 가능(데모)" : "사용 불가(데모)"}
        </Text>
      )}
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
  row: { flexDirection: "row", gap: 8, alignItems: "center" },
  smallBtn: {
    paddingHorizontal: 12, height: 44, borderRadius: 12,
    backgroundColor: "#1f8a6a", alignItems: "center", justifyContent: "center",
  },
  smallBtnText: { color: "#fff", fontWeight: "700" },
  agreeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  agreeText: { color: "#cfe8dd" },
  primaryBtn: {
    height: 52, borderRadius: 14, backgroundColor: "#1aa179",
    alignItems: "center", justifyContent: "center", marginTop: 10,
  },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
