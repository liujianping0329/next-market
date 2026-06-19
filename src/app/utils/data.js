export const convertCateName = (gardenCate, cates) => {
    if (gardenCate.includes("-")) {
        let pcateValue = gardenCate.split("-")[0];
        let pcate = cates.find((c => c.value === pcateValue))
        if (!pcate) return null
        let cate = pcate.children.find((c => c.value === gardenCate))
        if (!cate) return null
        return `${pcate.label}-${cate.label}`
    }
    return cates.find((c => c.value === gardenCate))?.label
};

export const normalizeObjectNumbers = (obj) => {
    if (!obj) return obj;
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => {
            if (value === "") return [key, 0];
            if (value instanceof Date) return [key, value];
            if (typeof value === "string" && !Number.isNaN(Number(value))) {
                return [key, Number(value)];
            }
            return [key, value];
        })
    );
}