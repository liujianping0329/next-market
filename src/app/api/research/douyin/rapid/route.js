import { NextResponse } from "next/server";
import ky from "ky";

import supabase from "@/app/utils/database";

const RAPID_API_HOST =
    "douyin-china-tiktok-all-api.p.rapidapi.com";

export async function POST(request, context) {
    const { keyword, cateId, ...otherPara } = await request.json();

    const { data: keywordObj } = await supabase.from('garden_research_keyword').insert({
        cateId, keyword
    }).select().single();

    const result = await ky.get(
        `https://${RAPID_API_HOST}/api/douyin/search-video/v4`,
        {
            headers: {
                "x-rapidapi-key": process.env.RAPIDAPIKEY,
                "x-rapidapi-host": RAPID_API_HOST,
            },
            searchParams: {
                keyword,
                sortType: "_0",
                publishTime: "_0",
                duration: "_0",
                page: "1",
            },
            timeout: 120000,
        }
    ).json();

    const awemeList =
        result?.data?.business_data
            ?.map((item) => item?.data?.aweme_info)
            .filter(Boolean) ?? [];

    const videos = awemeList.map((item) => ({
        platform: "rapidApi",
        channel: "douyin",

        platformId: item.aweme_id,

        title:
            item.item_title ||
            item.preview_title ||
            item.desc
                ?.replace(/#[^\s#]+/g, "")
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, 30) ||
            "未命名视频",

        detail:
            item.desc ||
            item.caption ||
            item.preview_title ||
            "",

        url:
            item.share_url ||
            item.share_info?.share_url ||
            "",

        image:
            item.video?.cover?.url_list?.[0] ||
            item.video?.origin_cover?.url_list?.[0] ||
            item.video?.dynamic_cover?.url_list?.[0] ||
            "",

        hashtags:
            item.text_extra
                ?.filter((tag) => tag.type === 1)
                .map((tag) => tag.hashtag_name) ?? [],

        keywordId: keywordObj.id,
    }));
    await supabase.from('garden_research').upsert(videos);

    return NextResponse.json({ videos });
}