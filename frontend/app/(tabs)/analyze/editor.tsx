import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from "react-native";
import * as ImageManipulator from "expo-image-manipulator";

type Params = { uri?: string };

export default function AnalyzeEditor() {
  const router = useRouter();
  const { uri: paramUri } = useLocalSearchParams<Params>();
  const [imgUri, setImgUri] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof paramUri === "string") setImgUri(paramUri);
  }, [paramUri]);

  const toast = (msg: string) => Alert.alert("안내", msg);

  const rotate = useCallback(async () => {
    if (!imgUri) return;
    const out = await ImageManipulator.manipulateAsync(imgUri, [{ rotate: 90 }], { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG });
    setImgUri(out.uri);
  }, [imgUri]);

  const flipH = useCallback(async () => {
    if (!imgUri) return;
    const out = await ImageManipulator.manipulateAsync(imgUri, [{ flip: ImageManipulator.FlipType.Horizontal }], { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG });
    setImgUri(out.uri);
  }, [imgUri]);

  const cropSquare = useCallback(async () => {
    if (!imgUri) return;
    const meta = await ImageManipulator.manipulateAsync(imgUri, [], { compress: 1, format: ImageManipulator.SaveFormat.JPEG });
    const { width, height, uri } = meta;
    if (!width || !height) { toast("이미지 크기를 확인할 수 없습니다."); return; }
    const size = Math.min(width, height);
    const originX = Math.floor((width - size) / 2);
    const originY = Math.floor((height - size) / 2);
    const out = await ImageManipulator.manipulateAsync(
      uri,
      [{ crop: { originX, originY, width: size, height: size } }],
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
    );
    setImgUri(out.uri);
  }, [imgUri]);

  const resize1024 = useCallback(async () => {
    if (!imgUri) return;
    const meta = await ImageManipulator.manipulateAsync(imgUri, [], { compress: 1, format: ImageManipulator.SaveFormat.JPEG });
    const { width, height, uri } = meta;
    if (!width || !height) return;
    const isLandscape = width >= height;
    const out = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: isLandscape ? { width: 1024 } : { height: 1024 } }],
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
    );
    setImgUri(out.uri);
  }, [imgUri]);

  const done = useCallback(() => {
    if (!imgUri) { toast("이미지 없음"); return; }
    // 편집 종료 → preview로 넘기거나 바로 분석 페이지로
    // 여기서는 preview로 넘김
    router.replace(`/analyze/preview?uri=${encodeURIComponent(imgUri)}` as never);
  }, [imgUri, router]);

  return (
    <View style={s.container}>
      <Text style={s.title}>사진 편집</Text>
      {imgUri ? <Image source={{ uri: imgUri }} style={s.preview} resizeMode="contain" /> : <Text>이미지 없음</Text>}

      <View style={s.row}>
        <TouchableOpacity style={[s.btn, s.gray]} onPress={rotate}><Text style={s.btnText}>회전 90°</Text></TouchableOpacity>
        <TouchableOpacity style={[s.btn, s.gray]} onPress={flipH}><Text style={s.btnText}>좌우 뒤집기</Text></TouchableOpacity>
        <TouchableOpacity style={[s.btn, s.gray]} onPress={cropSquare}><Text style={s.btnText}>정사각 크롭</Text></TouchableOpacity>
        <TouchableOpacity style={[s.btn, s.gray]} onPress={resize1024}><Text style={s.btnText}>리사이즈 1024</Text></TouchableOpacity>
      </View>

      <TouchableOpacity style={s.doneBtn} onPress={done}>
        <Text style={s.doneText}>편집 완료</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  preview: { width: "100%", height: 380, backgroundColor: "#f5f5f5", borderRadius: 12 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 10, width: "100%", justifyContent: "space-between", marginTop: 12 },
  btn: { flexGrow: 1, flexBasis: "48%", alignItems: "center", paddingVertical: 12, borderRadius: 10 },
  gray: { backgroundColor: "#e5e7eb" },
  btnText: { color: "#111827", fontSize: 14, fontWeight: "600" },
  doneBtn: { marginTop: 16, width: "100%", paddingVertical: 14, borderRadius: 12, backgroundColor: "#111827", alignItems: "center" },
  doneText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
