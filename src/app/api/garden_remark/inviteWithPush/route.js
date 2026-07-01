import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import ky from "ky";

export async function POST(request, context) {
    const { planetId, detail } = await request.json();
    const { data: tarUsersList } = await supabase.from('f_user').select("id").eq("planetId", planetId);

    const origin = new URL(request.url).origin;
    let pushInfo = {};
    let oneSignalPara = {
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APPID,
        include_aliases: {
            external_id: tarUsersList.map(user => user.id),
        },
        target_channel: "push",
        headings: {
            en: "邀您评论"
        },
        contents: { en: detail.title || "no title" },
        web_url: `${origin}/remark/gardenInvite/${detail.id}`
    };

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
    return NextResponse.json({ pushInfo });
}