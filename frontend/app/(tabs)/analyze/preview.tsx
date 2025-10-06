import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from "react-native";

type Params = { uri?: string };

export default function AnalyzePreview() {
  const router = useRouter();
  const { uri } = useLocalSearchParams<Params>();

  const onAnalyze = async () => {
    if (!uri) {
      Alert.alert("오류", "이미지 URI가 전달되지 않았습니다.");
      return;
    }
    // TODO: 분석 로직 연결(서버 업로드 / 온디바이스 추론)
    Alert.alert("안내", "여기에 분석 로직을 연결하세요.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>선택한 이미지</Text>
      {uri ? (
        <Image source={{ uri }} style={styles.preview} resizeMode="contain" />
      ) : (
        <Text style={{ color: "#999" }}>이미지 URI가 전달되지 않았습니다.</Text>
      )}

      <TouchableOpacity style={styles.analyzeBtn} onPress={onAnalyze}>
        <Text style={styles.analyzeText}>분석 시작</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>뒤로가기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  preview: { width: "100%", height: 380, backgroundColor: "#f5f5f5", borderRadius: 12 },
  analyzeBtn: {
    marginTop: 16, width: "100%", paddingVertical: 14, borderRadius: 12, backgroundColor: "#111827", alignItems: "center",
  },
  analyzeText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  backBtn: {
    marginTop: 10, width: "100%", paddingVertical: 12, borderRadius: 12, backgroundColor: "#e5e7eb", alignItems: "center",
  },
  backText: { color: "#111827", fontSize: 15, fontWeight: "600" },
});
