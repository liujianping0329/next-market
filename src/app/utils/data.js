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

export const BEIJING_PLACE_NAMES = [
    "雍和宫",
    "什刹海",
    "琉璃厂",
    "陶然亭",
    "公主坟",
    "木樨地",
    "菜市口",
    "磁器口",
    "五道口",
    "望京",
    "月坛",
    "日坛",
    "玉渊潭",
    "亮马桥",
    "团结湖",
    "酒仙桥",
    "国子监",
    "大栅栏",
    "五道营",
    "后海",
    "西单",
    "东单",
    "牛街",
    "新街口",
    "平安里",
    "积水潭",
    "北新桥",
    "东四",
    "西四",
    "灯市口",
    "珠市口",
    "呼家楼",
    "双井",
    "劲松",
    "潘家园",
    "十里河",
    "大望路",
    "三里屯",
    "燕莎",
    "将台",
    "枣营",
    "麦子店",
    "太阳宫",
    "芍药居",
    "安贞",
    "马甸",
    "和平里",
    "柳芳",
    "左家庄",
    "东坝",
    "常营",
    "管庄",
    "高碑店",
    "传媒大",
    "青年路",
    "甜水园",
    "红庙",
    "八里庄",
    "慈云寺",
    "百子湾",
    "九龙山",
    "垡头",
    "方庄",
    "蒲黄榆",
    "宋家庄",
    "刘家窑",
    "角门",
    "草桥",
    "丽泽",
    "六里桥",
    "莲花桥",
    "万寿路",
    "五棵松",
    "玉泉路",
    "八宝山",
    "苹果园",
    "模式口",
    "鲁谷",
    "定慧寺",
    "白石桥",
    "魏公村",
    "皂君庙",
    "大钟寺",
    "知春路",
    "知春里",
    "中关村",
    "苏州街",
    "海淀桥",
    "万泉河",
    "上地",
    "清河",
    "西二旗",
    "回龙观",
    "霍营",
    "天通苑",
    "立水桥",
    "北苑",
    "亚运村",
    "安慧桥",
    "望京西"
];