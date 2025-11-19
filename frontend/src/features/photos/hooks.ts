// src/features/photos/hooks.ts
import { useEffect, useRef, useState } from "react";
import { getAnalysisStatus, getAnalysisResult } from "./api";
import { AnalysisSummary, AnalysisResult } from "./types";

type UseAnalysisPollingOpts = {
  analysisId: string;
  authToken?: string | null;
  intervalMs?: number; // 기본 1200ms
};

export function useAnalysisPolling({ analysisId, authToken, intervalMs = 1200 }: UseAnalysisPollingOpts) {
  const [status, setStatus] = useState<AnalysisSummary | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      try {
        const s = await getAnalysisStatus(analysisId, authToken || undefined);
        if (cancelled) return;
        setStatus(s);
        if (s.status === "done") {
          const r = await getAnalysisResult(analysisId, authToken || undefined);
          if (cancelled) return;
          setResult(r);
          clear();
        } else if (s.status === "failed") {
          setError(s.error || "분석 실패");
          clear();
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "네트워크 오류");
        clear();
      }
    }
    function clear() {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    }

    tick(); // 최초 1회
    timer.current = setInterval(tick, intervalMs);
    return () => {
      cancelled = true;
      clear();
    };
  }, [analysisId, authToken, intervalMs]);

  return { status, result, error };
}
