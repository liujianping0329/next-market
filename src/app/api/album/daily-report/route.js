import ky from "ky";
import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";

import supabase from "@/app/utils/database";

const getMealKey = (createdAt) => {
    const tokyoDate = new Date(new Date(createdAt).getTime() + 9 * 60 * 60 * 1000);
    const hour = tokyoDate.getUTCHours();

    if (hour < 11) return "breakfastAlbums";
    if (hour < 17) return "lunchAlbums";
    return "dinnerAlbums";
};

export async function POST(request) {
    const { userId, targetDate, albumIds, stepCount } = await request.json();
    const normalizedStepCount = stepCount === null || stepCount === undefined || stepCount === "" ? null : Number(stepCount);

    if (!userId || !targetDate || !Array.isArray(albumIds) || !albumIds.length || (normalizedStepCount !== null && (!Number.isSafeInteger(normalizedStepCount) || normalizedStepCount < 0))) {
        return NextResponse.json({ message: "日报参数不正确" }, { status: 400 });
    }

    const { data: albums, error } = await supabase
        .from("album")
        .select("id,created_at,album_user(user_id),album_item(id,name,estimated_amount)")
        .in("id", albumIds)
        .order("created_at", { ascending: true });

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const payload = {
        albumIds: albums.map((album) => album.id),
        breakfastAlbums: [],
        lunchAlbums: [],
        dinnerAlbums: [],
    };

    for (const album of albums) {
        payload[getMealKey(album.created_at)].push({
            albumId: album.id,
            participantCount: (album.album_user ?? []).length,
            items: (album.album_item ?? []).map((item) => ({
                itemId: item.id,
                name: item.name,
                estimatedAmount: item.estimated_amount,
            })),
        });
    }

    const submittedAt = new Date().toISOString();
    const reportData = {
        status: "analyzing_nutrition",
        album_ids: payload.albumIds,
        step_count: normalizedStepCount,
        submitted_at: submittedAt,
        error_message: null,
    };
    const { data: report, error: reportError } = await supabase
        .from("diet_daily_report")
        .upsert({
            user_id: userId,
            target_date: targetDate,
            ...reportData,
        }, { onConflict: "user_id,target_date" })
        .select("id")
        .single();

    if (reportError) {
        return NextResponse.json({ message: reportError.message }, { status: 500 });
    }

    payload.reportId = report.id;

    waitUntil(
        ky.post(`${process.env.SPRING_AI_URL}/api/ai/diet/daily-report`, {
            json: payload,
            timeout: 300_000,
            retry: 0,
        }).catch(async (error) => {
            console.error(
                "日报请求失败:",
                error.response
                    ? await error.response.clone().text()
                    : error,
            );
        }),
    );

    return NextResponse.json({ accepted: true, reportId: report.id }, { status: 202 });
}
