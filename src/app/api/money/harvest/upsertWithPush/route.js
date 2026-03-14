import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import ky from "ky";
import { calcRemindTime } from "@/app/utils/date";

export async function POST(request, context) {
    const requestBody = await request.json();
    console.log("requestBody", requestBody)
    const { data, error } = await supabase.from('harvest').upsert(requestBody).select().single();

    let pushInfo = {};
    if (requestBody.userId) {
        const origin = new URL(request.url).origin;
        const sendAfter =
            calcRemindTime(requestBody.startTime?.replace(" ", "T") + ":00+09:00", requestBody.remindBefore);
        console.log("sendAfter", sendAfter)
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

        let tarUsers = [requestBody.userId];
        if (requestBody.isPlanetPush) {
            const { data: { planetId } } = await supabase.from('f_user').select("planetId").eq("id", requestBody.userId).single();
            const { data: tarUsersList } = await supabase.from('f_user').select("id").eq("planetId", planetId);
            tarUsers = tarUsersList?.map(v => v.id) ?? [];
        }

        let oneSignalPara = {
            app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APPID,
            include_aliases: {
                external_id: tarUsers,
            },
            target_channel: "push",
            contents: { en: requestBody.title || "no title" },
            web_url: requestBody.gardenId ? `${origin}/money/garden/greengrass/${requestBody.gardenId}`
                : `${origin}/money/garden?tab=Harvest`,
            ...(new Date(sendAfter) > new Date() && {
                send_after: sendAfter
            })
        };
        console.log("oneSignalPara", oneSignalPara)
        try {
            pushInfo = await ky.post(
                "https://api.onesignal.com/notifications?c=push",
                {
                    headers: {
                        Authorization: `Key ${process.env.ONESIGNAL_API_KEY}`,
                    },
                    json: oneSignalPara,
                }
            ).json();
        } catch (error) {
            const err = await error.response.json();
            console.log(err);
            pushInfo.err = err;
        }
        await supabase.from('harvest').update({ pushId: pushInfo.id }).eq("id", data.id);
    }

    return NextResponse.json({ id: data.id, pushInfo: pushInfo });
}