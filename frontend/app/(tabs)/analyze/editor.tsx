import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View, Text, Image, StyleSheet, TouchableOpacity, Alert,
  LayoutChangeEvent, PanResponder, PanResponderInstance,
} from "react-native";
import * as ImageManipulator from "expo-image-manipulator";

/**
 * 기능
 *  - 90도 회전
 *  - 자유 크롭(드래그/리사이즈)
 * 구현
 *  - <Image resizeMode="contain" />에 맞춘 렌더 사각형 기준 좌표 변환
 */

type Params = { uri?: string };
type Size = { width: number; height: number };
type Rect = { x: number; y: number; w: number; h: number };

const MIN_CROP = 50;

export default function AnalyzeEditor() {
  const router = useRouter();
  const { uri: paramUri } = useLocalSearchParams<Params>();

  const [imgUri, setImgUri] = useState<string | undefined>();
  const [imgSize, setImgSize] = useState<Size | null>(null);     // 원본 크기
  const [frameSize, setFrameSize] = useState<Size | null>(null); // 프리뷰 박스 크기
  const [crop, setCrop] = useState<Rect | null>(null);           // 화면 좌표 크롭박스

  const dragRef = useRef<{ kind: "move"|"nw"|"ne"|"sw"|"se"|null; start:{x:number;y:number}; orig:Rect|null; }>({
    kind: null, start:{x:0,y:0}, orig: null,
  });

  useEffect(() => {
    if (typeof paramUri === "string") setImgUri(paramUri);
  }, [paramUri]);

  // 메타에서 원본 크기
  useEffect(() => {
    (async () => {
      if (!imgUri) return;
      const meta = await ImageManipulator.manipulateAsync(imgUri, [], { compress: 1, format: ImageManipulator.SaveFormat.JPEG });
      if (meta.width && meta.height) setImgSize({ width: meta.width, height: meta.height });
    })();
  }, [imgUri]);

  const toast = (m: string) => Alert.alert("안내", m);

  /** contain 기준 실제 렌더 사각형 */
  const getRenderedRect = (imgW: number, imgH: number, frameW: number, frameH: number) => {
    const scale = Math.min(frameW / imgW, frameH / imgH);
    const w = imgW * scale, h = imgH * scale;
    const x = (frameW - w) / 2, y = (frameH - h) / 2;
    return { x, y, w, h };
  };

  /** 초기 크롭 생성 – imgSize & frameSize 준비되면 1회 실행 */
  useEffect(() => {
    if (!imgSize || !frameSize || crop) return;
    const r = getRenderedRect(imgSize.width, imgSize.height, frameSize.width, frameSize.height);
    const size = Math.max(MIN_CROP, Math.min(r.w, r.h) * 0.7);
    setCrop({ x: r.x + (r.w - size) / 2, y: r.y + (r.h - size) / 2, w: size, h: size });
  }, [imgSize, frameSize, crop]);

  /** 90도 회전 */
  const rotate = useCallback(async () => {
    if (!imgUri) return;
    const out = await ImageManipulator.manipulateAsync(imgUri, [{ rotate: 90 }], { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG });
    setImgUri(out.uri);
    setCrop(null); // 회전하면 초기화 → 위 useEffect가 새로 만들어 줌
  }, [imgUri]);

  /** 프리뷰 박스 크기만 저장 */
  const onImageLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setFrameSize({ width, height });
  }, []);

  /** 렌더 사각형 내부로 클램프 */
  const clampCrop = useCallback((r: Rect): Rect => {
    if (!frameSize || !imgSize) return r;
    const rr = getRenderedRect(imgSize.width, imgSize.height, frameSize.width, frameSize.height);
    const x = Math.max(rr.x, Math.min(r.x, rr.x + rr.w - MIN_CROP));
    const y = Math.max(rr.y, Math.min(r.y, rr.y + rr.h - MIN_CROP));
    const maxW = rr.x + rr.w - x;
    const maxH = rr.y + rr.h - y;
    const w = Math.max(MIN_CROP, Math.min(r.w, maxW));
    const h = Math.max(MIN_CROP, Math.min(r.h, maxH));
    return { x, y, w, h };
  }, [frameSize, imgSize]);

  /** 제스처: 이동/리사이즈 */
  const responder = useMemo<PanResponderInstance | null>(() => {
    if (!crop) return null;
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, g) => {
        const hit = hitHandle(crop, evt.nativeEvent.locationX, evt.nativeEvent.locationY);
        dragRef.current.kind = hit ?? "move";
        dragRef.current.start = { x: g.x0, y: g.y0 };
        dragRef.current.orig = { ...crop };
      },
      onPanResponderMove: (_, g) => {
        if (!dragRef.current.orig) return;
        const dx = g.dx, dy = g.dy;
        const kind = dragRef.current.kind;
        let next = { ...dragRef.current.orig } as Rect;
        if (kind === "move") { next.x += dx; next.y += dy; }
        else if (kind === "nw") { next.x += dx; next.y += dy; next.w -= dx; next.h -= dy; }
        else if (kind === "ne") { next.y += dy; next.w += dx; next.h -= dy; }
        else if (kind === "sw") { next.x += dx; next.w -= dx; next.h += dy; }
        else if (kind === "se") { next.w += dx; next.h += dy; }
        setCrop(clampCrop(next));
      },
      onPanResponderRelease: () => { dragRef.current.kind = null; dragRef.current.orig = null; },
      onPanResponderTerminationRequest: () => false,
    });
  }, [crop, clampCrop]);

  /** 화면 → 이미지 좌표 (여백 보정) */
  const toImageRect = useCallback((r: Rect) => {
    if (!imgSize || !frameSize) return null;
    const rr = getRenderedRect(imgSize.width, imgSize.height, frameSize.width, frameSize.height);
    const px = r.x - rr.x, py = r.y - rr.y;
    if (px + r.w <= 0 || py + r.h <= 0 || px >= rr.w || py >= rr.h) return null;
    const sx = imgSize.width / rr.w, sy = imgSize.height / rr.h;
    return {
      originX: Math.round(Math.max(0, px) * sx),
      originY: Math.round(Math.max(0, py) * sy),
      width:   Math.round(Math.min(r.w, rr.w - Math.max(0, px)) * sx),
      height:  Math.round(Math.min(r.h, rr.h - Math.max(0, py)) * sy),
    };
  }, [imgSize, frameSize]);

  /** 크롭 적용 */
  const applyCrop = useCallback(async () => {
    if (!imgUri || !crop) return toast("크롭할 이미지가 없습니다.");
    const c = toImageRect(crop);
    if (!c) return toast("크롭 좌표 계산 실패");
    const out = await ImageManipulator.manipulateAsync(imgUri, [{ crop: c }], { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG });
    setImgUri(out.uri);
    setCrop(null); // 새 이미지 → 초기화(위 effect가 다시 세팅)
  }, [imgUri, crop, toImageRect]);

  const done = useCallback(() => {
    if (!imgUri) return toast("이미지 없음");
    router.replace(`/analyze/preview?uri=${encodeURIComponent(imgUri)}` as never);
  }, [imgUri, router]);

  return (
    <View style={s.container}>
      <Text style={s.title}>사진 편집</Text>

      <View style={s.previewWrap} onLayout={onImageLayout} {...(responder ? responder.panHandlers : {})}>
        {imgUri ? <Image source={{ uri: imgUri }} style={s.preview} resizeMode="contain" /> : <Text>이미지 없음</Text>}
        {crop && (
          <View pointerEvents="none" style={[s.cropBox, { left: crop.x, top: crop.y, width: crop.w, height: crop.h }]}>
            <GridLines />
            <View style={[s.handle, s.nw]} /><View style={[s.handle, s.ne]} />
            <View style={[s.handle, s.sw]} /><View style={[s.handle, s.se]} />
          </View>
        )}
        {crop && <DarkMask rect={crop} frame={frameSize} />}
      </View>

      <View style={s.row}>
        <TouchableOpacity style={[s.btn, s.gray]} onPress={rotate}><Text style={s.btnText}>회전 90°</Text></TouchableOpacity>
        <TouchableOpacity style={[s.btn, s.gray]} onPress={applyCrop}><Text style={s.btnText}>크롭 적용</Text></TouchableOpacity>
      </View>

      <TouchableOpacity style={s.doneBtn} onPress={done}><Text style={s.doneText}>편집 완료</Text></TouchableOpacity>
    </View>
  );
}

/** 코너 핸들 히트테스트 */
function hitHandle(r: Rect, x: number, y: number): "nw"|"ne"|"sw"|"se"|null {
  const SIZE = 24;
  const inBox = (bx:number, by:number) => Math.abs(x - bx) <= SIZE && Math.abs(y - by) <= SIZE;
  if (inBox(r.x, r.y)) return "nw";
  if (inBox(r.x + r.w, r.y)) return "ne";
  if (inBox(r.x, r.y + r.h)) return "sw";
  if (inBox(r.x + r.w, r.y + r.h)) return "se";
  return null;
}

/** 바깥 마스킹 */
function DarkMask({ rect, frame }: { rect: Rect; frame: Size | null }) {
  if (!frame) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <View style={{ position:"absolute", left:0, top:0, right:0, bottom: frame.height - rect.y, backgroundColor:"rgba(0,0,0,0.35)" }} />
      <View style={{ position:"absolute", left:0, top:rect.y, width:rect.x, height:rect.h, backgroundColor:"rgba(0,0,0,0.35)" }} />
      <View style={{ position:"absolute", left:rect.x + rect.w, top:rect.y, right:0, height:rect.h, backgroundColor:"rgba(0,0,0,0.35)" }} />
      <View style={{ position:"absolute", left:0, top:rect.y + rect.h, right:0, bottom:0, backgroundColor:"rgba(0,0,0,0.35)" }} />
    </View>
  );
}

/** 3×3 그리드 */
function GridLines() {
  return (
    <View style={StyleSheet.absoluteFillObject}>
      <View style={[s.gridLine, { left: "33.33%" }]} />
      <View style={[s.gridLine, { left: "66.66%" }]} />
      <View style={[s.gridLineH, { top: "33.33%" }]} />
      <View style={[s.gridLineH, { top: "66.66%" }]} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },

  previewWrap: { width: "100%", height: 380, backgroundColor: "#f5f5f5", borderRadius: 12, overflow: "hidden", position: "relative" },
  preview: { width: "100%", height: "100%" },

  row: { flexDirection: "row", gap: 10, width: "100%", justifyContent: "space-between", marginTop: 12 },
  btn: { flexGrow: 1, flexBasis: "48%", alignItems: "center", paddingVertical: 12, borderRadius: 10 },
  gray: { backgroundColor: "#e5e7eb" },
  btnText: { color: "#111827", fontSize: 14, fontWeight: "600" },

  doneBtn: { marginTop: 16, width: "100%", paddingVertical: 14, borderRadius: 12, backgroundColor: "#111827", alignItems: "center" },
  doneText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  cropBox: { position: "absolute", borderWidth: 2, borderColor: "#fff", shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 4 },
  handle: { position: "absolute", width: 16, height: 16, backgroundColor: "#fff", borderRadius: 8, borderWidth: 1, borderColor: "#111827" },
  nw: { left: -8, top: -8 }, ne: { right: -8, top: -8 }, sw: { left: -8, bottom: -8 }, se: { right: -8, bottom: -8 },

  gridLine: { position: "absolute", top: 0, bottom: 0, width: 1, backgroundColor: "rgba(255,255,255,0.75)" },
  gridLineH: { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: "rgba(255,255,255,0.75)" },
});
