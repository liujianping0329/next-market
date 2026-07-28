import { NextResponse } from "next/server";
import ky from "ky";

import supabase from "@/app/utils/database";

const RAPID_API_HOST =
    "instagram-api85.p.rapidapi.com";

export async function POST(request, context) {
    const { keyword, cateId, ...otherPara } = await request.json();

    const { data: keywordObj } = await supabase.from('garden_research_keyword').insert({
        cateId, keyword
    }).select().single();
    let result = {};
    try {
        result = await ky.get(
            `https://${RAPID_API_HOST}/api/instagram/search-reels/v1`,
            {
                headers: {
                    "x-rapidapi-key": process.env.RAPIDAPIKEY,
                    "x-rapidapi-host": RAPID_API_HOST,
                },
                searchParams: {
                    keyword,
                },
                timeout: 120000,
            }
        ).json();
    } catch (error) {
        if (error.response) {
            console.log("status:", error.response.status);
            console.log("body:", await error.response.text());
        }

        throw error;
    }
    const awemeList =
        result?.data?.data?.items?.filter(Boolean) ?? [];

    const videos = awemeList.map((item) => {
        const detail = item.caption?.text || "";

        return {
            platform: "rapidApi",
            channel: "instagram",

            platformId: String(item.id),

            title:
                detail
                    .replace(/#[^\s#]+/g, "")
                    .replace(/\s+/g, " ")
                    .trim()
                    .slice(0, 30) ||
                item.user?.full_name ||
                item.user?.username ||
                "未命名视频",

            detail,

            url:
                item.code
                    ? `https://www.instagram.com/reel/${item.code}/`
                    : "",

            image:
                item.thumbnail_url ||
                item.image_versions?.items?.[0]?.url ||
                item.image_versions?.additional_items?.first_frame?.url ||
                "",

            hashtags:
                item.caption?.hashtags?.map((tag) =>
                    tag.replace(/^#/, "")
                ) ?? [],

            keywordId: keywordObj.id,
        };
    });

    await supabase.from('garden_research').upsert(videos);

    return NextResponse.json({ videos });
}