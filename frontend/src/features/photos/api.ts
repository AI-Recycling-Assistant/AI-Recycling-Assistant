import { Platform } from "react-native";
import type { ImagePayload } from "./uploader";

// 🔥 Spring 서버로 이미지 업로드 + 분석 결과 받기
export async function analyzeImageWithSpring(file: ImagePayload) {
  const fd = new FormData();

  if (Platform.OS === "web") {
    // 🔥 웹은 URI 그대로 못보냄 → Blob 변환
    const resp = await fetch(file.uri);
    const blob = await resp.blob();

    fd.append("image", blob, file.name || "photo.jpg");
  } else {
    // 🔥 iOS / Android
    fd.append("image", {
      uri: file.uri,
      name: file.name || "photo.jpg",
      type: file.type || "image/jpeg",
    } as any);
  }

  const SPRING_SERVER =
      Platform.OS === "web"
          ? "http://localhost:3005/proxy/analyze-image"
          : "http://172.26.131.41:8080/api/ai/analyze-image";


  const resp = await fetch(SPRING_SERVER, {
    method: "POST",
    body: fd,
    // 절대 넣지 말 것: headers: { "Content-Type": "multipart/form-data" }
  });

  return resp.json();
}


