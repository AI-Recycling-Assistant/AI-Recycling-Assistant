// src/components/HeaderLogo.tsx
import React from "react";
import { Image, ImageSourcePropType, useColorScheme } from "react-native";

type Props = { height?: number };

export default function HeaderLogo({ height = 40 }: Props) {
  const scheme = useColorScheme();
  const src: ImageSourcePropType =
    scheme === "dark"
      ? require("../assets/images/sseu-dark.png")
      : require("../assets/images/sseu-light.png");

  const aspect = 3.8;                 // 가로/세로 비율
  const width = Math.round(height * aspect);

  return (
    <Image
      source={src}
      resizeMode="contain"
      style={{ height, width }}
      accessibilityLabel="쓰담쓰담 로고"
    />
  );
}
