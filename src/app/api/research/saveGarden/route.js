import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { formatDateLocal } from "@/app/utils/date";

function getChannelName(channel) {
    const channelMap = {
        douyin: "抖音",
        xiaohongshu: "小红书",
        bilibili: "哔哩哔哩",
    };

    return channelMap[channel] || channel || "内容";
}

export async function POST(request, context) {
    const { userId, cateId, ...research } = await request.json();

    const garden = {
        title: (research.title || "未命名内容").slice(0, 20),
        date: formatDateLocal(new Date()),

        content:
            research.detail ||
            research.title ||
            "",

        // 假设pics保存URL数组
        pics: research.image
            ? [research.image]
            : [],

        // 保存原始平台链接
        location: research.url
            ? {
                name: `${getChannelName(research.channel)}`,
                path: research.url
            }
            : {},
        topic: "Greengrass",

        userId,

        category: "else",

        cate2: cateId || null,

        researchId: research.id,
    };
    await supabase.from("garden").insert(garden).select().single();

    return NextResponse.json({ id: research.id });
}