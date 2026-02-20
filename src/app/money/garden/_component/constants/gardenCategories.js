export const gardenCategories = [
  { value: "all", label: "全部" },
  { value: "recipe", label: "菜谱" },
  { value: "shop", label: "想去的店" },
  { value: "weekend", label: "周末好去处" },
  { value: "taiwan", label: "台湾" },
  { value: "haerbin", label: "哈尔滨" },
  { value: "japan", label: "日本" },
  { value: "else", label: "其他" }
];

export const gardenCategoriesNoAll = gardenCategories.filter(c => c.value !== "all");