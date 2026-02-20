import { create } from "zustand"

export const useGardenStore = create((set, get) => ({
  // 你 Greengrass 的列表
  greengrassList: [],

  // 写入列表
  setGreengrassList: (list) => set({ greengrassList: list }),

  // 可选：按 id 找一条（方便详情页用）
  getGreengrassById: (id) => {
    const list = get().greengrassList
    return list.find((x) => String(x.id) === String(id))
  },

  // 可选：更新/合并单条（详情页 fetch 到更全的数据时用）
  upsertGreengrass: (item) => {
    const list = get().greengrassList
    const idx = list.findIndex((x) => String(x.id) === String(item.id))
    if (idx >= 0) {
      const next = [...list]
      next[idx] = { ...next[idx], ...item }
      set({ greengrassList: next })
    } else {
      set({ greengrassList: [item, ...list] })
    }
  },
}))