import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import ky from "ky";
import { calcRemindTime } from "@/app/utils/date";

export async function POST(request, context) {
    const requestBody = await request.json();
    const { data, error } = await supabase.from('harvest').upsert(requestBody).select().single();

    let pushInfo;
    if (requestBody.userId) {
        const origin = new URL(request.url).origin;
        const sendAfter =
            calcRemindTime(requestBody.startTime?.replace(" ", "T") + ":00+09:00", requestBody.remindBefore);
        if (requestBody.id && data.pushId) {
            try {
                await ky.delete(
                    `https://api.onesignal.com/notifications/${data.pushId}?app_id=${process.env.NEXT_PUBLIC_ONESIGNAL_APPID}`,
                    {
                        headers: {
                            Authorization: `Key ${process.env.ONESIGNAL_API_KEY}`,
                        },
                    }
                );
            } catch {

            }
        }
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
        await supabase.from('harvest').update({ pushId: pushInfo.id }).eq("id", data.id);
    }

    return NextResponse.json({ id: data.id, pushInfo: pushInfo });
}