// app/analyze/editor.tsx (예시 경로)
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View, Text, Image, StyleSheet, TouchableOpacity, Alert,
  LayoutChangeEvent, PanResponder, PanResponderInstance, Platform, KeyboardAvoidingView
} from "react-native";
import * as ImageManipulator from "expo-image-manipulator";

type Params = { uri?: string };
type Size = { width: number; height: number };
type Rect = { x: number; y: number; w: number; h: number };

const COLORS = {
  bg: "#F7F9FB",
  card: "#FFFFFF",
  text: "#0F172A",
  sub: "#64748B",
  primary: "#10B981",     // emerald-500
  primaryDark: "#059669", // emerald-600
  border: "#E2E8F0",
  error: "#EF4444",
};

const MIN_CROP = 50;

export default function AnalyzeEditor() {
  const router = useRouter();
  const { uri: paramUri } = useLocalSearchParams<Params>();

  const [imgUri, setImgUri] = useState<string | undefined>();
  const [imgSize, setImgSize] = useState<Size | null>(null);
  const [frameSize, setFrameSize] = useState<Size | null>(null);
  const [crop, setCrop] = useState<Rect | null>(null);

  const dragRef = useRef<{ kind: "move"|"nw"|"ne"|"sw"|"se"|null; start:{x:number;y:number}; orig:Rect|null; }>({
    kind: null, start:{x:0,y:0}, orig: null,
  });

  // 최신 상태 ref (PanResponder 재생성 방지용)
  const cropRef = useRef<Rect | null>(null);
  const imgSizeRef = useRef<Size | null>(null);
  const frameSizeRef = useRef<Size | null>(null);
  useEffect(() => { cropRef.current = crop; }, [crop]);
  useEffect(() => { imgSizeRef.current = imgSize; }, [imgSize]);
  useEffect(() => { frameSizeRef.current = frameSize; }, [frameSize]);

  useEffect(() => {
    if (typeof paramUri === "string") setImgUri(paramUri);
  }, [paramUri]);

  // 원본 크기 취득
  useEffect(() => {
    (async () => {
      if (!imgUri) return;

      let got = false;
      try {
        Image.getSize(
          imgUri,
          (width, height) => { setImgSize({ width, height }); got = true; },
          () => {}
        );
      } catch {}

      // fallback
      setTimeout(async () => {
        if (got) return;
        try {
          const meta = await ImageManipulator.manipulateAsync(imgUri, [], {
            compress: 1,
            format: ImageManipulator.SaveFormat.JPEG,
          });
          if (meta.width && meta.height) setImgSize({ width: meta.width, height: meta.height });
        } catch {}
      }, 0);
    })();
  }, [imgUri]);

  const toast = (m: string) => Alert.alert("안내", m);

  /** contain 기준 실제 렌더 사각형 */
  const getRenderedRect = (imgW: number, imgH: number, frameW: number, frameH: number): Rect => {
    const scale = Math.min(frameW / imgW, frameH / imgH);
    const w = imgW * scale, h = imgH * scale;
    const x = (frameW - w) / 2, y = (frameH - h) / 2;
    return { x, y, w, h };
  };

  /** 초기 크롭 생성 */
  useEffect(() => {
    if (!imgSize || !frameSize || crop) return;
    const r = getRenderedRect(imgSize.width, imgSize.height, frameSize.width, frameSize.height);
    const size = Math.max(MIN_CROP, Math.min(r.w, r.h) * 0.7);
    setCrop({ x: r.x + (r.w - size) / 2, y: r.y + (r.h - size) / 2, w: size, h: size });
  }, [imgSize, frameSize, crop]);

  /** 90도 회전 */
  const rotate = useCallback(async () => {
    if (!imgUri) return;
    const out = await ImageManipulator.manipulateAsync(
      imgUri,
      [{ rotate: 90 }],
      { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG }
    );
    setImgUri(out.uri);
    setCrop(null);
  }, [imgUri]);

  /** 프리뷰 박스 크기만 저장 */
  const onImageLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setFrameSize({ width, height });
  }, []);

  /** 화면 → 이미지 좌표 */
  const toImageRect = useCallback((r: Rect) => {
    if (!imgSize || !frameSize) return null;
    const rr = getRenderedRect(imgSize.width, imgSize.height, frameSize.width, frameSize.height);
    const sx = imgSize.width / rr.w, sy = imgSize.height / rr.h;

    const px = Math.max(0, r.x - rr.x);
    const py = Math.max(0, r.y - rr.y);
    const pw = Math.min(r.w, rr.w - px);
    const ph = Math.min(r.h, rr.h - py);

    const originX = Math.max(0, Math.round(px * sx));
    const originY = Math.max(0, Math.round(py * sy));
    const width   = Math.max(1, Math.round(pw * sx));
    const height  = Math.max(1, Math.round(ph * sy));
    if (width < 1 || height < 1) return null;
    return { originX, originY, width, height };
  }, [imgSize, frameSize]);

  /** PanResponder (한 번만 생성) */
  const responder = useMemo<PanResponderInstance>(() => {
    const clampMove = (r: Rect, b: Rect): Rect => {
      let x = r.x, y = r.y;
      if (x < b.x) x = b.x;
      if (y < b.y) y = b.y;
      if (x + r.w > b.x + b.w) x = b.x + b.w - r.w;
      if (y + r.h > b.y + b.h) y = b.y + b.h - r.h;
      return { x, y, w: r.w, h: r.h };
    };
    const resizeFromNW = (o: Rect, dx: number, dy: number, b: Rect): Rect => {
      const maxX = o.x + o.w, maxY = o.y + o.h;
      let x = o.x + dx, y = o.y + dy, w = maxX - x, h = maxY - y;
      if (w < MIN_CROP) { x = maxX - MIN_CROP; w = MIN_CROP; }
      if (h < MIN_CROP) { y = maxY - MIN_CROP; h = MIN_CROP; }
      if (x < b.x) { x = b.x; w = maxX - x; if (w < MIN_CROP) { x = maxX - MIN_CROP; w = MIN_CROP; } }
      if (y < b.y) { y = b.y; h = maxY - y; if (h < MIN_CROP) { y = maxY - MIN_CROP; h = MIN_CROP; } }
      return { x, y, w, h };
    };
    const resizeFromNE = (o: Rect, dx: number, dy: number, b: Rect): Rect => {
      const minX = o.x, maxY = o.y + o.h;
      let y = o.y + dy, w = o.w + dx, h = maxY - y;
      if (w < MIN_CROP) w = MIN_CROP;
      if (h < MIN_CROP) { y = maxY - MIN_CROP; h = MIN_CROP; }
      const right = b.x + b.w, top = b.y;
      if (minX + w > right) w = right - minX;
      if (y < top) { y = top; h = maxY - y; if (h < MIN_CROP) { y = maxY - MIN_CROP; h = MIN_CROP; } }
      return { x: minX, y, w, h };
    };
    const resizeFromSW = (o: Rect, dx: number, dy: number, b: Rect): Rect => {
      const maxX = o.x + o.w, minY = o.y;
      let x = o.x + dx, w = maxX - x, h = o.h + dy;
      if (w < MIN_CROP) { x = maxX - MIN_CROP; w = MIN_CROP; }
      if (h < MIN_CROP) h = MIN_CROP;
      if (x < b.x) { x = b.x; w = maxX - x; if (w < MIN_CROP) { x = maxX - MIN_CROP; w = MIN_CROP; } }
      const bottom = b.y + b.h;
      if (minY + h > bottom) h = bottom - minY;
      return { x, y: minY, w, h };
    };
    const resizeFromSE = (o: Rect, dx: number, dy: number, b: Rect): Rect => {
      const minX = o.x, minY = o.y;
      let w = o.w + dx, h = o.h + dy;
      if (w < MIN_CROP) w = MIN_CROP;
      if (h < MIN_CROP) h = MIN_CROP;
      const right = b.x + b.w, bottom = b.y + b.h;
      if (minX + w > right) w = right - minX;
      if (minY + h > bottom) h = bottom - minY;
      return { x: minX, y: minY, w, h };
    };

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, g) => {
        const cur = cropRef.current;
        if (!cur) return;
        const hit = hitHandle(cur, evt.nativeEvent.locationX, evt.nativeEvent.locationY);
        dragRef.current.kind = hit ?? "move";
        dragRef.current.start = { x: g.x0, y: g.y0 };
        dragRef.current.orig = { ...cur };
      },
      onPanResponderMove: (_, g) => {
        const orig = dragRef.current.orig;
        const _img = imgSizeRef.current;
        const _frame = frameSizeRef.current;
        if (!orig || !_img || !_frame) return;

        const rr = getRenderedRect(_img.width, _img.height, _frame.width, _frame.height);
        const dx = g.dx, dy = g.dy;
        const kind = dragRef.current.kind;
        let next = { ...orig };

        if (kind === "move") {
          next.x = orig.x + dx;
          next.y = orig.y + dy;
          next = clampMove(next, rr);
        } else if (kind === "nw") next = resizeFromNW(orig, dx, dy, rr);
        else if (kind === "ne")   next = resizeFromNE(orig, dx, dy, rr);
        else if (kind === "sw")   next = resizeFromSW(orig, dx, dy, rr);
        else if (kind === "se")   next = resizeFromSE(orig, dx, dy, rr);

        setCrop(next);
      },
      onPanResponderRelease: () => { dragRef.current.kind = null; dragRef.current.orig = null; },
      onPanResponderTerminationRequest: () => false,
    });
  }, []);

  /** 크롭 적용 */
  const applyCrop = useCallback(async () => {
    if (!imgUri || !crop) return toast("크롭할 이미지가 없습니다.");
    const c = toImageRect(crop);
    if (!c) return toast("크롭 좌표 계산 실패");
    const out = await ImageManipulator.manipulateAsync(
      imgUri,
      [{ crop: c }],
      { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG }
    );
    setImgUri(out.uri);
    setCrop(null);
  }, [imgUri, crop, toImageRect]);

  const done = useCallback(() => {
    if (!imgUri) return toast("이미지 없음");
    router.replace(`/analyze/preview?uri=${encodeURIComponent(imgUri)}` as never);
  }, [imgUri, router]);

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={s.centerWrap}>
        {/* 헤더 */}
        <View style={s.header}>
          <Text style={s.title}>사진 편집</Text>
          <Text style={s.caption}>회전/크롭으로 더 정확한 분석</Text>
        </View>

        {/* 카드 */}
        <View style={s.card}>
          {/* 미리보기 영역 (카드 안) */}
          <View style={s.previewWrap} onLayout={onImageLayout} {...responder.panHandlers}>
            {imgUri ? (
              <Image source={{ uri: imgUri }} style={s.preview} resizeMode="contain" />
            ) : (
              <View style={s.previewEmpty}>
                <Text style={s.previewEmptyText}>이미지 없음</Text>
              </View>
            )}
            {crop && (
              <View pointerEvents="none" style={[s.cropBox, { left: crop.x, top: crop.y, width: crop.w, height: crop.h }]}>
                <GridLines />
                <View style={[s.handle, s.nw]} /><View style={[s.handle, s.ne]} />
                <View style={[s.handle, s.sw]} /><View style={[s.handle, s.se]} />
              </View>
            )}
            {crop && <DarkMask rect={crop} frame={frameSize} />}
          </View>

          {/* 액션 버튼들 (카드 안) */}
          <View style={s.row}>
            <TouchableOpacity style={[s.secondaryBtn]} onPress={rotate}>
              <Text style={s.secondaryText}>회전 90°</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.secondaryBtn]} onPress={applyCrop}>
              <Text style={s.secondaryText}>크롭 적용</Text>
            </TouchableOpacity>
          </View>

          {/* 완료 버튼 (카드 바닥) */}
          <TouchableOpacity style={s.primaryBtn} onPress={done}>
            <Text style={s.primaryText}>편집 완료</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

/** 코너 핸들 히트테스트 (로그인처럼 정갈하게, 히트 박스 과하지 않게) */
function hitHandle(r: Rect, x: number, y: number): "nw"|"ne"|"sw"|"se"|null {
  const half = 14; // 12~14 권장
  const within = (cx:number, cy:number) =>
    x >= cx - half && x <= cx + half && y >= cy - half && y <= cy + half;
  if (within(r.x, r.y)) return "nw";
  if (within(r.x + r.w, r.y)) return "ne";
  if (within(r.x, r.y + r.h)) return "sw";
  if (within(r.x + r.w, r.y + r.h)) return "se";
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
  // 로그인 화면과 동일한 배경/센터링
  container: { flex: 1, backgroundColor: COLORS.bg },
  centerWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },

  // 헤더
  header: { alignItems: "center", marginBottom: 14 },
  title: {
    fontFamily: "Jua_400Regular",
    color: COLORS.text,
    fontSize: 30,
    marginTop: 2,
  },
  caption: { color: COLORS.sub, marginTop: 4, fontSize: 13 },

  // 카드 (로그인 카드 스타일 복제)
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

  // 미리보기 박스도 카드 안에 깔끔한 회색 배경으로
  previewWrap: {
    width: "100%",
    height: 380,
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  preview: { width: "100%", height: "100%" },
  previewEmpty: { flex: 1, alignItems: "center", justifyContent: "center" },
  previewEmptyText: { color: COLORS.sub },

  // 카드 내부 버튼 행
  row: { flexDirection: "row", gap: 10, width: "100%", justifyContent: "space-between", marginTop: 12 },

  // 로그인과 동일한 버튼 톤
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  // 보조 버튼은 화이트 배경 + 테두리
  secondaryBtn: {
    flexGrow: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: { color: COLORS.text, fontWeight: "600" },

  // 크롭 UI
  cropBox: { position: "absolute", borderWidth: 2, borderColor: "#fff", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 3 },
  handle: { position: "absolute", width: 16, height: 16, backgroundColor: "#fff", borderRadius: 8, borderWidth: 1, borderColor: "#111827" },
  nw: { left: -8, top: -8 }, ne: { right: -8, top: -8 }, sw: { left: -8, bottom: -8 }, se: { right: -8, bottom: -8 },

  gridLine: { position: "absolute", top: 0, bottom: 0, width: 1, backgroundColor: "rgba(255,255,255,0.75)" },
  gridLineH: { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: "rgba(255,255,255,0.75)" },
});
