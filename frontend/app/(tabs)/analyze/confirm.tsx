import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function AnalyzeConfirm() {
  const router = useRouter();
  const { uri, objectName, label, instruction } = useLocalSearchParams();

  const imageUri = Array.isArray(uri) ? uri[0] : uri;

  return (
    <View style={s.container}>
      <View style={s.card}>
        <Text style={s.title}>분석 결과</Text>

        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={s.image}
          />
        )}

        <View style={s.resultBox}>
          <Text style={s.resultText}>📄 물체 이름: {objectName}</Text>
          <Text style={s.resultText}>🗑️ 분리수거 분류: {label}</Text>
        </View>

        <View style={s.methodWrap}>
          <Text style={s.methodTitle}>📌 처리 방법</Text>
          <Text style={s.methodContent}>{instruction}</Text>
        </View>

        {/* 다시 분석하기 */}
        <TouchableOpacity
          style={s.button}
          onPress={() => router.replace("/(tabs)/analyze")}
        >
          <Text style={s.buttonText}>다시 분석하기</Text>
        </TouchableOpacity>

        {/* 홈으로 이동 버튼 */}
        <TouchableOpacity
          style={s.homeButton}
          onPress={() => router.replace("/")}   // index.tsx 로 이동
        >
          <Text style={s.homeButtonText}>홈으로</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F9FB",
  },
  card: {
    width: "90%",
    maxWidth: 500,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
    minHeight: 560,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: "Jua_400Regular",
    textAlign: "center",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 260,
    borderRadius: 12,
    marginBottom: 16,
    resizeMode: "contain",
  },
  resultBox: {
    backgroundColor: "#EAF2FF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  resultText: {
    fontSize: 18,
    marginBottom: 4,
    color: "#1E293B",
  },
  methodWrap: { marginBottom: 24 },
  methodTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 6 },
  methodContent: { fontSize: 16, color: "#475569" },
  button: {
    backgroundColor: "#34C38F",
    padding: 16,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    fontFamily: "Jua_400Regular",   // 🔹 제목과 같은 글씨체
  },
  homeButton: {
    marginTop: 10,
    backgroundColor: "#E5E7EB",
    padding: 16,
    borderRadius: 10,
  },
  homeButtonText: {
    color: "#111827",
    fontSize: 18,
    textAlign: "center",
    fontFamily: "Jua_400Regular",   // 🔹 제목과 같은 글씨체
  },
});
