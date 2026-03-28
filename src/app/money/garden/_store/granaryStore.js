// src/app/money/garden/_store/granaryStore.js
import { create } from "zustand"

export const useGranaryStore = create((set) => ({
  // 这个模块专属的数据
  cash: null,
  userTemplate: null,

  // 这个模块专属的方法
  setCash: (data) => set({ cash: data }),
  setUserTemplate: (data) => set({ userTemplate: data }),
}))
