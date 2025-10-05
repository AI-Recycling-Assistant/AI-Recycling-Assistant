// src/components/RecycleBinButton.tsx
import React, { useMemo, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Animated, Easing, ImageSourcePropType } from "react-native";
import { useRouter, type Href } from "expo-router";

type Props = {
  title: string;
  caption?: string;
  href: Href;

  // 비주얼
  tint?: string;             // 본체 색
  lidColor?: string;         // 뚜껑/손잡이 색
  width?: number;
  height?: number;

  // 캐릭터 (PNG, 투명배경 권장)
  characterSource: ImageSourcePropType;

  // 정면(아이콘) 쓰담이
  iconDiameter?: number;      // 원 지름
  iconCharacterSize?: number; // 아이콘 안 캐릭터 크기

  // 팝업(뚜껑 열릴 때 나오는) 쓰담이
  popCharacterSize?: number;  // 팝업 캐릭터 크기
  characterTopOffset?: number;// 뚜껑 아래 기준 시작 Y
  popOut?: number;            // 위로 솟는 정도(px)

  // 동작 모드
  openMode?: "tap" | "hold";  // tap: 탭 후 자동 이동, hold: 누르는 동안만 열림
  openPreviewMs?: number;     // tap 모드에서 열린 채 보여줄 시간
  navigateOnHoldRelease?: boolean; // hold 모드에서 손 떼면 이동
};

export default function RecycleBinButton({
  title,
  caption,
  href,
  tint = "#93c5fd",
  lidColor = "#60a5fa",
  width = 132,
  height = 164,
  characterSource,

  iconDiameter = 52,
  iconCharacterSize = 36,

  popCharacterSize = 64,
  characterTopOffset = 4,
  popOut = 28,

  openMode = "tap",
  openPreviewMs = 320,
  navigateOnHoldRelease = false,
}: Props) {
  const router = useRouter();

  // 애니메이션 값들
  const scale = useRef(new Animated.Value(1)).current;  // 버튼 살짝 눌림
  const lid   = useRef(new Animated.Value(0)).current;  // 0(닫힘)→1(열림)
  const buddy = useRef(new Animated.Value(0)).current;  // 0(숨김)→1(보임)

  // 뚜껑 모션
  const lidRotate     = lid.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-20deg"] });
  const lidTranslateY = lid.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });

  // 팝업 캐릭터 모션: 안쪽 → 밖(-popOut)
  const buddyTranslateY = buddy.interpolate({
    inputRange: [0, 1],
    outputRange: [Math.max(18, popCharacterSize * 0.35), -popOut],
  });
  const buddyOpacity = buddy.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  // 정면 아이콘은 뚜껑 열릴 때 살짝 페이드아웃(겹침 방지)
  const iconFade = buddy.interpolate({ inputRange: [0, 1], outputRange: [1, 0.2] });

  const lidWidth = useMemo(() => Math.max(110, width * 0.88), [width]);

  // 열기/닫기
  const open = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 0 }),
      Animated.timing(lid,   { toValue: 1, duration: 220, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.timing(buddy, { toValue: 1, duration: 260, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
    ]).start();
  };
  const close = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }),
      Animated.timing(buddy, { toValue: 0, duration: 180, useNativeDriver: true, easing: Easing.in(Easing.cubic) }),
      Animated.timing(lid,   { toValue: 0, duration: 180, useNativeDriver: true, easing: Easing.in(Easing.cubic) }),
    ]).start();
  };

  // 입력 핸들러
  const onPressIn = () => {
    if (openMode === "hold") open();
  };
  const onPressOut = () => {
    if (openMode === "hold") {
      close();
      if (navigateOnHoldRelease) router.push(href);
    }
  };
  const onPress = () => {
    if (openMode === "tap") {
      open();
      setTimeout(() => {
        close();
        router.push(href);
      }, openPreviewMs);
    }
  };

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress} style={{ margin: 6 }}>
      <Animated.View style={[styles.wrap, { transform: [{ scale }] }]}>
        {/* 뚜껑 */}
        <Animated.View
          style={[
            styles.lid,
            { backgroundColor: lidColor, width: lidWidth, transform: [{ translateY: lidTranslateY }, { rotateZ: lidRotate }], zIndex: 2 },
          ]}
        />
        {/* 손잡이 */}
        <Animated.View
          style={[styles.handle, { backgroundColor: lidColor, transform: [{ translateY: lidTranslateY }], zIndex: 2 }]}
        />

        {/* 본체 */}
        <View style={[styles.body, { backgroundColor: tint, width, height }]}>
          {/* 팝업 쓰담이 (뚜껑 열릴 때 위로 등장) */}
          <Animated.Image
            source={characterSource}
            style={{
              position: "absolute",
              top: characterTopOffset,
              width: popCharacterSize,
              height: popCharacterSize,
              alignSelf: "center",
              resizeMode: "contain",
              transform: [{ translateY: buddyTranslateY }],
              opacity: buddyOpacity,
            }}
          />

          {/* 정면 아이콘(원형 배지 안 쓰담이) */}
          <Animated.View
            style={[
              styles.iconWrap,
              { width: iconDiameter, height: iconDiameter, borderRadius: iconDiameter / 2, opacity: iconFade },
            ]}
          >
            <Animated.Image
              source={characterSource}
              style={{ width: iconCharacterSize, height: iconCharacterSize, resizeMode: "contain" }}
            />
          </Animated.View>

          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          {caption ? <Text style={styles.caption} numberOfLines={2}>{caption}</Text> : null}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", overflow: "visible" },
  lid: {
    height: 16,
    borderTopLeftRadius: 8, borderTopRightRadius: 8,
    borderBottomLeftRadius: 4, borderBottomRightRadius: 4,
    shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 2, shadowOffset: { width: 0, height: 1 },
  },
  handle: { position: "absolute", top: 8, width: 32, height: 6, borderRadius: 3 },
  body: {
    marginTop: 10, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 12,
    alignItems: "center", justifyContent: "flex-start",
    shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
    overflow: "visible", zIndex: 1,
  },
  iconWrap: {
    backgroundColor: "rgba(255,255,255,0.72)",
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  title: { fontSize: 16, fontWeight: "700", textAlign: "center", lineHeight: 20, color: "#111827" },
  caption: { marginTop: 4, fontSize: 12, opacity: 0.8, textAlign: "center", lineHeight: 16, color: "#374151" },
});
