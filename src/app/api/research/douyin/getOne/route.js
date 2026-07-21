import { NextResponse } from "next/server";
import ky from "ky";

import supabase from "@/app/utils/database";

export async function POST(request, context) {
    const { keyword, cateId, ...otherPara } = await request.json();

    const { data: keywordObj } = await supabase.from('garden_research_keyword').insert({
        cateId, keyword
    }).select().single();

    const result = await ky.post(
        "https://api.getoneapi.com/api/douyin/search_video",
        {
            headers: {
                Authorization: `Bearer ${process.env.GETONEAPIKEY}`,
            },
            json: {
                keyword,
                count: 18,
                offset: "0",
                publish_time: "0",
                sort_type: 0,
            },
        }
    ).json();

    const videos =
        result?.data?.aweme_list?.map((item) => ({
            platform: "getOneApi",
            channel: "douyin",
            // 唯一标识
            platformId: item.aweme_id,

            // 适合作为名称的短标题
            title:
                item.item_title ||
                item.preview_title ||
                item.desc?.replace(/#[^\s#]+/g, "").trim().slice(0, 30),

            // 包括做法、说明在内的详细内容
            detail: item.desc || item.caption || item.preview_title || "",

            // 点击后打开抖音视频页面
            url: item.share_url || item.share_info?.share_url || "",

            // 适合作为列表、卡片、详情页主图的封面
            image:
                item.video?.cover?.url_list?.[0] ||
                item.video?.origin_cover?.url_list?.[0] ||
                item.video?.dynamic_cover?.url_list?.[0] ||
                "",
            hashtags:
                item.text_extra
                    ?.filter((tag) => tag.type === 1)
                    .map((tag) => (tag.hashtag_name)) ?? [],
            keywordId: keywordObj.id
        })) ?? [];
    await supabase.from('garden_research').upsert(videos);

    return NextResponse.json({ videos });
}