// src/features/auth/api.ts
import { http } from "@/src/utils/http";

/** API에서 쓰는 공통 타입들 (필요에 맞게 조정하세요) */
export type RegisterRequest = {
  username: string;        // 아이디(또는 이메일) - 명세에 맞게 필드명 조정
  password: string;
  nickname?: string;
};

export type RegisterResponse = {
  id: number | string;
  username: string;
  nickname?: string;
  createdAt?: string;
};

export type LoginRequest = {
  username: string;        // 명세가 email이면 email로 바꾸세요
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
  user?: {
    id: number | string;
    username: string;
    nickname?: string;
  };
};

export type Profile = {
  id: number | string;
  username: string;
  nickname?: string;
};

/** 회원가입 */
export async function register(payload: RegisterRequest) {
  // 예: POST /api/auth/register
  return http<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: payload,
  });
}

/** 로그인 */
export async function login(payload: LoginRequest) {
  // 예: POST /api/auth/login
  return http<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: payload,
  });
}

/** 내 정보 조회 (토큰 필요) */
export async function getProfile(token: string) {
  // 예: GET /api/auth/me
  return http<Profile>("/api/auth/me", {
    method: "GET",
    authToken: token,
  });
}

/** 로그아웃 (서버 세션/리프레시 토큰 무효화가 있다면) */
export async function logout(token?: string) {
  // 예: POST /api/auth/logout
  return http<void>("/api/auth/logout", {
    method: "POST",
    authToken: token || null,
  });
}
