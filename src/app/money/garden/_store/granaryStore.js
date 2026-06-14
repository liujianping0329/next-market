// src/app/money/garden/_store/granaryStore.js
import { create } from "zustand"

export const useGranaryStore = create((set) => ({
  // 这个模块专属的数据
  cash: null,
  userTemplate: null,
  spendCate: null,

  // 这个模块专属的方法
  setCash: (data) => set({ cash: data }),
  setUserTemplate: (data) => set({ userTemplate: data }),
  setSpendCate: (data) => set({ spendCate: data }),
}))
