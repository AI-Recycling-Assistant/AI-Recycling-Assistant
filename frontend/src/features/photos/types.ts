// src/features/photos/types.ts
export type SourceType = "camera" | "gallery";

export type PhotoItem = {
  photoId: string;
  createdAt: string;
  width: number;
  height: number;
  source: SourceType;
  lastAnalysisId?: string;
  status?: "ready" | "processing" | "failed";
  meta?: Record<string, any>;
  // 서버가 썸네일/원본 URL을 주면 추가
  thumbnailUrl?: string;
  originalUrl?: string;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

export type AnalysisStatus = "queued" | "processing" | "done" | "failed";

export type AnalysisSummary = {
  analysisId: string;
  status: AnalysisStatus;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
};

export type Candidate = {
  label: string;
  confidence: number; // 0~1
};

export type AnalysisResult = {
  analysisId: string;
  photoId: string;
  summary: {
    top1?: Candidate;
    top5: Candidate[];
  };
  // 필요 시 상세 필드
};

export type TipsResponse = {
  items: { text: string }[];
};

export type CropRequest = {
  x: number; y: number; width: number; height: number;
  reanalyze?: boolean;
};

export type RotateRequest = {
  degree: 90 | 180 | 270;
};
