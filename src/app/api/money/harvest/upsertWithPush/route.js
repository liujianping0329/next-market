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
            "https://api.onesignal.com/notifications?c=push",
            {
                headers: {
                    Authorization: `Key ${process.env.ONESIGNAL_API_KEY}`,
                },
                json: {
                    app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APPID,
                    include_aliases: {
                        external_id: [requestBody.userId],
                    },
                    target_channel: "push",
                    contents: { en: requestBody.title || "no title" },
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