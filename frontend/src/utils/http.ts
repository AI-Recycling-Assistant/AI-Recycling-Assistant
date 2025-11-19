// src/utils/http.ts
const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:8080";

type HttpOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: any;                 // JSON 또는 FormData
  authToken?: string | null;
  signal?: AbortSignal;
};

export async function http<T = any>(path: string, opts: HttpOptions = {}): Promise<T> {
  const url = `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  // 기본 헤더
  const headers: Record<string, string> = {
    ...(opts.headers || {}),
  };
  if (opts.authToken) headers.Authorization = `Bearer ${opts.authToken}`;

  // body 타입에 따라 Content-Type 설정
  const isFormData = typeof FormData !== "undefined" && opts.body instanceof FormData;
  if (!isFormData) {
    // JSON 요청만 Content-Type 지정
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  const res = await fetch(url, {
    method: opts.method || "GET",
    headers,
    body: opts.body
      ? isFormData
        ? opts.body // FormData는 그대로
        : JSON.stringify(opts.body)
      : undefined,
    signal: opts.signal,
  });

  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}
