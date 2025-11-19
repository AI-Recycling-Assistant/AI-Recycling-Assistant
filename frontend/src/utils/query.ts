// src/utils/query.ts
export function withQuery(path: string, params?: Record<string, any>) {
  if (!params || Object.keys(params).length === 0) return path;
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    usp.append(k, String(v));
  });
  return `${path}?${usp.toString()}`;
}
