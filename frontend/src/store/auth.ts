// 전역 로그인 상태를 관리하는 가벼운 저장소(Zustand)

import { create } from "zustand";

type AuthState = {
  isLoggedIn: boolean;         // 로그인 여부
  username: string | null;     // 인사말에 보여줄 이름
  login: (name: string) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  isLoggedIn: false,
  username: null,
  login: (name) => set({ isLoggedIn: true, username: name }),
  logout: () => set({ isLoggedIn: false, username: null }),
}));
