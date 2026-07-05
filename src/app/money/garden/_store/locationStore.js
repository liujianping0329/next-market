// src/app/money/garden/_store/userStore.js

import { create } from "zustand"

export const useLocationStore = create((set) => ({
  // 这个模块专属的数据
  locationInfo: null,

  // 这个模块专属的方法
  setLocationInfo: (data) => set({ locationInfo: data })
}))
