// src/features/photos/api.ts
import { http } from "@/src/utils/http";
import { withQuery } from "@/src/utils/query";
import {
  PhotoItem, Paginated, AnalysisSummary, AnalysisResult,
  SourceType, TipsResponse, CropRequest, RotateRequest
} from "./types";
import { buildImageFormData, ImagePayload } from "./uploader";

// --- 페이지 진입(뷰 용) ---
export async function openAiPhotosHome() {
  // GET /ai-photos (서버에서 필요하면 메타 반환)
  return http<{ ok: boolean; }>("/ai-photos", { method: "GET" });
}

// --- 업로드 ---
export async function uploadFromCamera(img: ImagePayload, authToken?: string) {
  const fd = buildImageFormData(img, { source: "camera" });
  return http<PhotoItem>("/photos", { method: "POST", body: fd, authToken });
}

export async function uploadFromGallery(img: ImagePayload, authToken?: string) {
  const fd = buildImageFormData(img, { source: "gallery" });
  return http<PhotoItem>("/photos", { method: "POST", body: fd, authToken });
}

// --- 목록/상세/삭제 ---
export async function listPhotos(params: { page?: number; limit?: number } = {}, authToken?: string) {
  const path = withQuery("/photos", { page: params.page, limit: params.limit });
  return http<Paginated<PhotoItem>>(path, { method: "GET", authToken });
}

export async function getPhoto(photoId: string, authToken?: string) {
  return http<PhotoItem>(`/photos/${photoId}`, { method: "GET", authToken });
}

export async function deletePhoto(photoId: string, authToken?: string) {
  return http<{ ok: boolean }>(`/photos/${photoId}`, { method: "DELETE", authToken });
}

// --- 편집(크롭/회전) ---
export async function cropPhoto(photoId: string, payload: CropRequest, authToken?: string) {
  return http<PhotoItem>(`/photos/${photoId}/edit/crop`, {
    method: "POST",
    body: payload,
    authToken,
  });
}

export async function rotatePhoto(photoId: string, payload: RotateRequest, authToken?: string) {
  return http<PhotoItem>(`/photos/${photoId}/edit/rotate`, {
    method: "POST",
    body: payload,
    authToken,
  });
}

// --- 분석 시작/상태/결과 ---
export async function requestAnalysis(photoId: string, authToken?: string) {
  // POST /photos/{photo_id}/analyses → { analysisId }
  return http<{ analysisId: string }>(`/photos/${photoId}/analyses`, {
    method: "POST",
    authToken,
  });
}

export async function getAnalysisStatus(analysisId: string, authToken?: string) {
  return http<AnalysisSummary>(`/analyses/${analysisId}`, { method: "GET", authToken });
}

export async function getAnalysisResult(analysisId: string, authToken?: string) {
  return http<AnalysisResult>(`/analyses/${analysisId}/result`, { method: "GET", authToken });
}

// --- 결과 뷰(원본/라벨/최종) 렌더 ---
export async function renderPhotoView(photoId: string, view: "original" | "labels" | "result", authToken?: string) {
  const path = withQuery(`/photos/${photoId}/render`, { view });
  // 서버가 이미지 URL/HTML 스니펫/JSON을 어떤 형식으로 주는지에 맞춰 타입 지정
  return http<any>(path, { method: "GET", authToken });
}

// --- 재촬영 교체(PUT /photos/{photo_id}) ---
export async function replacePhoto(photoId: string, img: ImagePayload, authToken?: string) {
  const fd = buildImageFormData(img);
  return http<PhotoItem>(`/photos/${photoId}`, {
    method: "PUT",
    body: fd,
    authToken,
  });
}

// --- 재촬영 팁(GET /tips?context=retake) ---
export async function getRetakeTips(authToken?: string) {
  const path = withQuery("/tips", { context: "retake" });
  return http<TipsResponse>(path, { method: "GET", authToken });
}
