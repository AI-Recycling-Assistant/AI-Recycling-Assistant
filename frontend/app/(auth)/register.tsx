// app/(auth)/register.tsx
import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Switch, KeyboardAvoidingView, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { register as apiRegister } from "@/src/features/auth/api";

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

const PW_RULE = /^(?=.*[a-z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]).{8,}$/;

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [nickname, setNickname] = useState("");
  const [agree, setAgree] = useState(false);

  const [idOk, setIdOk] = useState<null | boolean>(null);
  const [nickOk, setNickOk] = useState<null | boolean>(null);

  const [focus, setFocus] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const checkId = () => {
    if (!id.trim()) return Alert.alert("확인", "아이디를 입력해주세요.");
    const ok = id.trim().length >= 4;
    setIdOk(ok);
    Alert.alert("아이디 중복확인", ok ? "사용 가능(데모)" : "사용 불가(데모)");
  };

  const checkNick = () => {
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
      await apiRegister({ id: _id, pw, name: _name, nickname: _nickname });
      Alert.alert("가입 완료", "로그인 화면으로 이동합니다.", [
        { text: "확인", onPress: () => router.replace("/(auth)/login") },
      ]);
    } catch (e: any) {
      Alert.alert("오류", e?.message ?? "회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={s.centerWrap}>
        {/* 헤더 */}
        <View style={s.header}>
          <Text style={s.title}>회원가입</Text>
          <Text style={s.caption}>사진으로 분리배출을 더 쉽게</Text>
        </View>

        {/* 카드 */}
        <View style={s.card}>
          <InputWithIcon
            label="이름"
            icon="person-outline"
            value={name}
            onChangeText={setName}
            onFocus={() => setFocus("name")}
            onBlur={() => setFocus(null)}
            focused={focus === "name"}
          />

          <InputWithButton
            label="아이디"
            icon="at-outline"
            value={id}
            onChangeText={(t: string) => { setId(t); setIdOk(null); }}
            buttonText="중복확인"
            onPress={checkId}
            focused={focus === "id"}
            onFocus={() => setFocus("id")}
            onBlur={() => setFocus(null)}
          />
          {idOk !== null && (
            <Text style={[s.helper, { color: idOk ? COLORS.primaryDark : COLORS.error }]}>
              {idOk ? "사용 가능(데모)" : "사용 불가(데모)"}
            </Text>
          )}

          <InputWithIcon
            label="비밀번호"
            icon="lock-closed-outline"
            value={pw}
            onChangeText={setPw}
            secureTextEntry
            placeholder="영 소문자·특수문자 포함 8자리 이상"
            onFocus={() => setFocus("pw")}
            onBlur={() => setFocus(null)}
            focused={focus === "pw"}
          />
          <InputWithIcon
            label="비밀번호 확인"
            icon="lock-closed-outline"
            value={pw2}
            onChangeText={setPw2}
            secureTextEntry
            onFocus={() => setFocus("pw2")}
            onBlur={() => setFocus(null)}
            focused={focus === "pw2"}
          />

          <InputWithButton
            label="닉네임"
            icon="happy-outline"
            value={nickname}
            onChangeText={(t: string) => { setNickname(t); setNickOk(null); }}
            buttonText="중복확인"
            onPress={checkNick}
            focused={focus === "nick"}
            onFocus={() => setFocus("nick")}
            onBlur={() => setFocus(null)}
          />
          {nickOk !== null && (
            <Text style={[s.helper, { color: nickOk ? COLORS.primaryDark : COLORS.error }]}>
              {nickOk ? "사용 가능(데모)" : "사용 불가(데모)"}
            </Text>
          )}

          {/* 약관 동의 */}
          <View style={s.agreeRow}>
            <Switch
              value={agree}
              onValueChange={setAgree}
              trackColor={{ false: "#E5E7EB", true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
            <Text style={s.agreeText}>개인정보 약관 동의</Text>
          </View>

          {/* 제출 */}
          <TouchableOpacity style={[s.primaryBtn, loading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryText}>가입 완료</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

/* --- 재사용 입력 컴포넌트들 --- */
function InputWithIcon({
  label, icon, focused, style, ...rest
}: any) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.inputWrap, focused && s.inputWrapActive, style]}>
        <Ionicons name={icon} size={20} color={focused ? COLORS.primaryDark : COLORS.sub} style={s.inputIcon} />
        <TextInput {...rest} style={s.input} placeholderTextColor="#94A3B8" autoCapitalize="none" />
      </View>
    </View>
  );
}

function InputWithButton({
  label, icon, buttonText, onPress, focused, style, ...rest
}: any) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.row, style]}>
        <View style={[s.inputWrap, focused && s.inputWrapActive, { flex: 1 }]}>
          <Ionicons name={icon} size={20} color={focused ? COLORS.primaryDark : COLORS.sub} style={s.inputIcon} />
          <TextInput {...rest} style={s.input} placeholderTextColor="#94A3B8" autoCapitalize="none" />
        </View>
        <TouchableOpacity style={s.smallBtn} onPress={onPress}>
          <Text style={s.smallBtnText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* --- 스타일 --- */
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centerWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  header: { alignItems: "center", marginBottom: 14 },
  brand: { fontFamily: "Jua_400Regular", color: COLORS.text, fontSize: 18, letterSpacing: 0.3 },
  title: { fontFamily: "Jua_400Regular", color: COLORS.text, fontSize: 30, marginTop: 2 },
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

  label: { color: COLORS.sub, fontSize: 13, marginBottom: 6 },

  row: { flexDirection: "row", alignItems: "center", gap: 8 },

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
  inputWrapActive: { borderColor: COLORS.primary, shadowColor: COLORS.primary, shadowOpacity: 0.08, shadowRadius: 6 },
  inputIcon: { position: "absolute", left: 14 },
  input: { fontSize: 16, color: COLORS.text },

  helper: { fontSize: 12, marginTop: 4 },

  smallBtn: {
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.text,
    alignItems: "center",
    justifyContent: "center",
  },
  smallBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  agreeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6, marginBottom: 6 },
  agreeText: { color: COLORS.text },

  primaryBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
