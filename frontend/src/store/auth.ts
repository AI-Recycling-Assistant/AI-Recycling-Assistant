// @store/auth.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthState = {
  isLoggedIn: boolean;
  userId: number | null;
  username: string | null; // 로그인 ID
  nickname: string | null; // 닉네임

  // 로컬스토리지에서 읽어온 상태인지 여부 (초기 로딩 체크용)
  hydrated: boolean;

  login: (payload: {
    userId: number;
    username: string;
    nickname: string;
  }) => void;
  logout: () => void;
  setHydrated: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      userId: null,
      username: null,
      nickname: null,
      hydrated: false,

      login: ({ userId, username, nickname }) =>
        set({
          isLoggedIn: true,
          userId,
          username,
          nickname,
        }),

      logout: () =>
        set({
          isLoggedIn: false,
          userId: null,
          username: null,
          nickname: null,
        }),

      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "auth-storage",
      // ✅ 웹: localStorage, 네이티브: AsyncStorage
      storage: createJSONStorage(() =>
        Platform.OS === "web" ? window.localStorage : AsyncStorage
      ),
      // ✅ 저장소에서 값 읽어온 뒤 hydrated=true 로 변경
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
