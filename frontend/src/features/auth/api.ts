// src/features/auth/api.ts
import { http } from "@/src/utils/http";

// 로그인 요청 타입
export type LoginRequest = {
  username: string;
  password: string;
};
export type LoginResponse = {
  message: string; // "로그인 성공"
};

// 회원가입 요청 타입
export type RegisterRequest = {
  name: string;
  username: string;
  password: string;
  passwordCheck: string;
  nickname: string;
};
export type RegisterResponse = {
  message: string; // "회원가입 성공"
};

// 로그인: POST /api/users/login
export async function login(payload: LoginRequest) {
  return http<LoginResponse>("/api/users/login", {
    method: "POST",
    body: {
      username: payload.username,
      password: payload.password,
    },
  });
}

// 회원가입: POST /api/users/signup
export async function register(payload: RegisterRequest) {
  return http<RegisterResponse>("/api/users/signup", {
    method: "POST",
    body: {
      name: payload.name,
      username: payload.username,
      password: payload.password,
      passwordCheck: payload.passwordCheck,
      nickname: payload.nickname,
    },
  });
}