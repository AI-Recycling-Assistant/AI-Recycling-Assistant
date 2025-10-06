// app/(tabs)/analyze/index.tsx
import { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AnalyzeEntry() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const ensureCameraPerm = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "카메라 권한을 허용해주세요.");
      return false;
    }
    return true;
  }, []);

  const ensureLibraryPerm = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "갤러리 접근 권한을 허용해주세요.");
      return false;
    }
    return true;
  }, []);

  const goPreview = (uri: string) => {
    router.push(`/analyze/preview?uri=${encodeURIComponent(uri)}` as never);
  };

  const onTakePhoto = useCallback(async () => {
    try {
      setBusy(true);
      if (!(await ensureCameraPerm())) return;
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.9,
      });
      if (!result.canceled && result.assets?.[0]?.uri) goPreview(result.assets[0].uri);
    } finally {
      setBusy(false);
    }
  }, [ensureCameraPerm]);

  const onPickFromGallery = useCallback(async () => {
    try {
      setBusy(true);
      if (!(await ensureLibraryPerm())) return;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        allowsEditing: true,
        quality: 0.9,
      });
      if (!result.canceled && result.assets?.[0]?.uri) goPreview(result.assets[0].uri);
    } finally {
      setBusy(false);
    }
  }, [ensureLibraryPerm]);

  return (
    <View style={styles.container}>
      <View style={styles.centerWrap}>
        <View style={styles.titleWrap}>
          <Text style={styles.brand}>분리배출</Text>
          <Text style={styles.mainTitle}>AI 사진 분석</Text>
          <Text style={styles.subtitle}>"사진으로 분리배출 방법 알아보기"</Text>
        </View>

        <View style={{ height: 20 }} />

        <TouchableOpacity style={[styles.button, styles.btnGreen]} onPress={onTakePhoto} disabled={busy} activeOpacity={0.85}>
          <Ionicons name="camera-outline" size={22} color="#0b2b17" style={styles.iconLeft} />
          <Text style={[styles.btnText]}>촬영</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.btnYellow]} onPress={onPickFromGallery} disabled={busy} activeOpacity={0.85}>
          <Ionicons name="image-outline" size={22} color="#3a2a00" style={styles.iconLeft} />
          <Text style={[styles.btnText]}>갤러리</Text>
        </TouchableOpacity>

        {busy && <ActivityIndicator size="large" style={{ marginTop: 16 }} />}
      </View>
    </View>
  );
}

const COLORS = {
  green: "#A7F3D0",
  yellow: "#FDE68A",
  textDark: "#0F172A",
  caption: "#6B7280",
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 20 },
  centerWrap: { flex: 1, justifyContent: "center", alignItems: "center" }, // ✅ 세로/가로 중앙
  titleWrap: { alignItems: "center", gap: 6, marginBottom: 8 },

  // ✅ Jua 적용 (홈과 동일 키 사용)
  brand: {
    fontFamily: "Jua_400Regular",
    fontSize: 18,
    color: COLORS.textDark,
    letterSpacing: 0.3,
  },
  mainTitle: {
    fontFamily: "Jua_400Regular",
    fontSize: 30,
    color: COLORS.textDark,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontFamily: "Jua_400Regular",
    marginTop: 4,
    fontSize: 14,
    color: COLORS.caption,
  },

  button: {
    width: "70%",
    height: 56,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  btnGreen: { backgroundColor: COLORS.green },
  btnYellow: { backgroundColor: COLORS.yellow },
  iconLeft: { position: "absolute", left: 18 },
  btnText: {
    fontFamily: "Jua_400Regular",
    fontSize: 18,
    color: "#111827",
  },
});
