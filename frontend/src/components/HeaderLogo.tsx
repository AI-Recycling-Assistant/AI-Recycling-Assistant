import React from "react";
import { Image, ImageSourcePropType, useColorScheme } from "react-native";

type Props = { height?: number };

export default function HeaderLogo({ height = 28 }: Props) {
  const scheme = useColorScheme();
  const src: ImageSourcePropType =
    scheme === "dark"
      ? require("../assets/images/sseu-dark.png")
      : require("../assets/images/sseu-light.png");

  // 가로폭을 명시적으로 고정 (비율 3.6:1 예시)
  const width = Math.round(height * 3.6);

  return (
    <Image
      source={src}
      resizeMode="contain"
      style={{ height, width }} // ✅ width 고정
      accessibilityLabel="쓰담쓰담 로고"
    />
  );
}
