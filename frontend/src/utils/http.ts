// src/utils/http.ts
const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:8080";

type HttpOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
  authToken?: string | null;
};

export async function http<T = any>(path: string, opts: HttpOptions = {}): Promise<T> {
  const url = `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };
  if (opts.authToken) headers.Authorization = `Bearer ${opts.authToken}`;

  const res = await fetch(url, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
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
