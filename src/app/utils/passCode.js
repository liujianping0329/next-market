

export const analyzePassCode = (passCode) => {
    const matchUrl = passCode.match(/https?:\/\/[^\s]+/);
    const url = matchUrl ? matchUrl[0] : null;

    if (!url) {
        return null;
    }
    if (url.includes("douyin")) {
        const matchDetail = passCode.match(/】(.*?)https?:\/\//);
        return {
            type: "douyin",
            typeName: "抖音",
            url,
            detail: matchDetail ? matchDetail[1] : null
        };
    } else if (url.includes("dianping")) {
        const matchTitle = passCode.match(/【(.*?)】/);
        const matchDetail = passCode.match(
            /】([\s\S]*?)https?:\/\//
        );
        return {
            type: "dianping",
            typeName: "大众",
            url,
            title: matchTitle ? matchTitle[1].trim() : null,
            detail: matchDetail ? matchDetail[1].trim() : null
        };
    } else if (url.includes("xhslink")) {
        const matchDetail = passCode.match(/^(.*?)https?:\/\//);
        return {
            type: "xhslink",
            typeName: "小红书",
            url,
            detail: matchDetail ? matchDetail[1] : null
        };
    } else {
        const hostname = new URL(url).hostname;
        const platform = hostname.replace(/^www\./, "").split(".")[0];
        return {
            type: "else",
            typeName: platform,
            url,
            detail: platform
        };
    }
};