// src/components/RecycleBinButton.tsx
import React, { useRef } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { Link, type Href } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  title: string;
  caption?: string;
  href: Href;           // expo-router 경로 타입
  tint?: string;        // 본체 색
  lidColor?: string;    // 뚜껑/손잡이 색
  width?: number;
  height?: number;
};

export default function RecycleBinButton({
  title,
  caption,
  href,
  tint = "#93c5fd",
  lidColor = "#60a5fa",
  width = 132,
  height = 152,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
  };

  return (
    <Link href={href} asChild>
      <Pressable onPressIn={onPressIn} onPressOut={onPressOut} accessibilityRole="button" style={{ margin: 6 }}>
        <Animated.View style={[styles.wrap, { transform: [{ scale }] }]}>
          {/* 뚜껑 */}
          <View style={[styles.lid, { backgroundColor: lidColor, width: Math.max(110, width * 0.88) }]} />
          {/* 손잡이 */}
          <View style={[styles.handle, { backgroundColor: lidColor }]} />
          {/* 본체 */}
          <View style={[styles.body, { backgroundColor: tint, width, height }]}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name="recycle" size={32} />
            </View>
            <Text style={styles.title} numberOfLines={2}>{title}</Text>
            {caption ? <Text style={styles.caption} numberOfLines={2}>{caption}</Text> : null}
          </View>
        </Animated.View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  lid: {
    height: 14,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  handle: {
    position: "absolute",
    top: 8,
    width: 28,
    height: 6,
    borderRadius: 3,
  },
  body: {
    marginTop: 10,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: { fontSize: 16, fontWeight: "700", textAlign: "center", lineHeight: 20 },
  caption: { marginTop: 4, fontSize: 12, opacity: 0.8, textAlign: "center", lineHeight: 16 },
});
