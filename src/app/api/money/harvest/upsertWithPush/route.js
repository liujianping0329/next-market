import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import ky from "ky";

export async function POST(request, context) {
    const requestBody = await request.json();
    const { data, error } = await supabase.from('harvest').upsert(requestBody).select();

    let pushInfo;
    if (requestBody.userId) {
        const origin = new URL(request.url).origin;
        const sendAfter =
            requestBody.startTime?.replace(" ", "T") + ":00+09:00";
        pushInfo = await ky.post(
            "https://onesignal.com/api/v1/notifications",
            {
                headers: {
                    Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
                },
                json: {
                    app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APPID,
                    include_external_user_ids: [requestBody.userId],
                    contents: { en: requestBody.title },
                    web_url: requestBody.gardenId ? `${origin}/money/garden/greengrass/${requestBody.gardenId}`
                        : `${origin}/money/garden?tag=harvest`,
                    ...(new Date(sendAfter) > new Date() && {
                        send_after: sendAfter
                    })
                },
            }
        ).json();
    }
    return NextResponse.json({ id: data[0].id, pushInfo: pushInfo });
}