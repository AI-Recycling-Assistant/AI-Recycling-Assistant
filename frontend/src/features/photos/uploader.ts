// src/features/photos/uploader.ts
import { Platform } from "react-native";

export type ImagePayload = {
  uri: string;
  name?: string;
  type?: string;
};

export async function buildImageFormData(
  image: ImagePayload,
  extra?: Record<string, string | number | boolean>
) {
  const fd = new FormData();

  if (Platform.OS === "web") {
    // 웹은 Blob을 요구
    const resp = await fetch(image.uri);
    const blob = await resp.blob();
    fd.append("image", blob, image.name || "photo.jpg");
  } else {
    // RN(native)는 파일 객체 형태로
    fd.append(
        "image",
        {
          uri: image.uri,
          name: image.name || "photo.jpg",
          type: image.type || "image/jpeg",
        } as any
    );
  }

  if (extra) {
    Object.entries(extra).forEach(([k, v]) => fd.append(k, String(v)));
  }
  return fd;
}
