// src/app/money/garden/_store/userStore.js

import { create } from "zustand"

export const useUserStore = create((set) => ({
  // 这个模块专属的数据
  userInfo: null,

  // 这个模块专属的方法
  setUserInfo: (data) => set({ userInfo: data })
}))
