// app/(tabs)/analyze/index.tsx
import { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AnalyzeEntry() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  /** editor로 안전하게 이동 (객체 라우팅) */
  const goEditor = useCallback((uri: string) => {
    router.push({ pathname: "/analyze/editor", params: { uri } });
  }, [router]);

  /** 권한 헬퍼 */
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

  /** 촬영 */
  const onTakePhoto = useCallback(async () => {
    try {
      setBusy(true);
      if (!(await ensureCameraPerm())) return;

      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.9,
      });
      console.log("[takePhoto]", res);

      if (!res.canceled && res.assets?.[0]?.uri) {
        goEditor(res.assets[0].uri);
      }
    } catch (e) {
      console.error(e);
      Alert.alert("오류", "사진 촬영 중 문제가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  }, [ensureCameraPerm, goEditor]);

  /** 갤러리 */
  const onPickFromGallery = useCallback(async () => {
    try {
      setBusy(true);
      if (!(await ensureLibraryPerm())) return;

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        allowsEditing: false,
        quality: 0.9,
      });
      console.log("[pickFromGallery]", res);

      if (!res.canceled && res.assets?.[0]?.uri) {
        goEditor(res.assets[0].uri);
      }
    } catch (e) {
      console.error(e);
      Alert.alert("오류", "갤러리에서 불러오는 중 문제가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  }, [ensureLibraryPerm, goEditor]);

  return (
    <View style={styles.container}>
      <View style={styles.centerWrap}>
        <View style={styles.titleWrap}>
          <Text style={styles.brand}>분리배출</Text>
          <Text style={styles.mainTitle}>AI 사진 분석</Text>
          <Text style={styles.subtitle}>"사진으로 분리배출 방법 알아보기"</Text>
        </View>

        <View style={{ height: 20 }} />

        <TouchableOpacity
          style={[styles.button, styles.btnGreen]}
          onPress={onTakePhoto}
          disabled={busy}
          activeOpacity={0.85}
        >
          <Ionicons name="camera-outline" size={22} color="#0b2b17" style={styles.iconLeft} />
          <Text style={styles.btnText}>촬영</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.btnYellow]}
          onPress={onPickFromGallery}
          disabled={busy}
          activeOpacity={0.85}
        >
          <Ionicons name="image-outline" size={22} color="#3a2a00" style={styles.iconLeft} />
          <Text style={styles.btnText}>갤러리</Text>
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
  centerWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  titleWrap: { alignItems: "center", gap: 6, marginBottom: 8 },

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
