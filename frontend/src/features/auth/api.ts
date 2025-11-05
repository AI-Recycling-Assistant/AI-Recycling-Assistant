// src/features/auth/api.ts
import { http } from "@/src/utils/http";

// ===== 타입 (표 기준) =====
export type LoginRequest = {
  id: string;
  pw: string;
};
export type LoginResponse = {
  ok: boolean;
  token?: string;    // 서버 응답 스펙에 맞춰 조정
  userId?: number | string;
};

export type RegisterRequest = {
  id: string;
  pw: string;
  name: string;
  nickname?: string; // 표 '객체'엔 없지만 상세설명에 있어 선택값으로 허용
};
export type RegisterResponse = {
  ok: boolean;
  userId?: number | string;
};

// ===== API =====

// 로그인 처리: POST /login  (바디 { id, pw })
export async function login(payload: LoginRequest) {
  return http<LoginResponse>("/login", {
    method: "POST",
    body: payload,
  });
}

// 회원가입 처리: POST /register (바디 { id, pw, name } [+ nickname?])
export async function register(payload: RegisterRequest) {
  const body = {
    id: payload.id,
    pw: payload.pw,
    name: payload.name,
    ...(payload.nickname ? { nickname: payload.nickname } : {}),
  };

  return http<RegisterResponse>("/register", {
    method: "POST",
    body,
  });
}
