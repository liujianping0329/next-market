import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { upload } from "@/app/api/file/_lib/upload";
import ky from "ky";
import { waitUntil } from "@vercel/functions";

export async function POST(request, context) {
    const formData = await request.formData();

    const file = formData.get("file");
    const fileUrl = await upload(file, "album");
    const userId = formData.get("userId");
    const planetId = formData.get("planetId");
    const locationId = formData.get("locationId");
    const isPush = formData.get("isPush") === "true";

    // if (isPush) {
    //     const { data: tarUsersList } = await supabase.from('f_user').select("id").eq("planetId", planetId).neq("id", userId);

    //     const origin = new URL(request.url).origin;
    //     let pushInfo = {};
    //     let oneSignalPara = {
    //         app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APPID,
    //         include_aliases: {
    //             external_id: tarUsersList.map(user => user.id),
    //         },
    //         target_channel: "push",
    //         headings: {
    //             en: "您有一条新的图片动态"
    //         },
    //         contents: { en: "您有一条新的图片动态" },
    //         web_url: `${origin}/user_func/album`
    //     };

    //     try {
    //         pushInfo = await ky.post(
    //             "https://api.onesignal.com/notifications?c=push",
    //             {
    //                 headers: {
    //                     Authorization: `Key ${process.env.ONESIGNAL_API_KEY}`,
    //                 },
    //                 json: oneSignalPara,
    //             }
    //         ).json();
    //     } catch (error) {
    //         console.error(
    //             "OneSignal error body:",
    //             await error.response?.clone().text()
    //         );

    //         throw error;
    //     }
    // }
    const { data, error } = await supabase.from('album').upsert({ pic: fileUrl, userId, planetId, locationId }).select().single();
    waitUntil(
        ky.post(`${process.env.SPRING_AI_URL}/api/ai/album/analyze`, {
            json: {
                albumId: data.id,
                imageUrl: fileUrl,
                mimeType: file.type,
                isPush,
                planetId,
                userId,
            },
            timeout: 300_000,
            retry: 0,
        }).then(() => {
            console.log("Spring AI task accepted:", data.id);
        }).catch(async (error) => {
            console.error(
                "Spring AI request failed:",
                data.id,
                error.response
                    ? await error.response.clone().text()
                    : error
            );
        })
    );
    console.log("upsert album", data, error);
    return NextResponse.json({ id: data.id });
}
