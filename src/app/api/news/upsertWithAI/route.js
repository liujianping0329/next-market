import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { generateAI } from "@/app/api/ai/_lib/generateAI";

export async function POST(request, context) {
    const requestBody = await request.json();
    const { data: insertData, error } = await supabase.from('news').upsert(requestBody).select().single();

    const ext = [
        requestBody.isDetail ? "返回内容中要包含detailHtml字段" : "",
    ]
        .filter(Boolean)
        .join("，");

    await supabase.from("news").update({ status: "updating" }).eq("id", insertData.id);
    generateAI({
        type: "news",
        ...(requestBody.isPic ? { pic: true } : {}),
        filled: {
            title: requestBody.question,
            content: requestBody.questionDetail,
            ext
        }
    }).then((aiData) => {
        const { ans: answer, url, detailHtml, ...ansProp } = aiData?.ansJSON || {};
        const pic = aiData?.pic || {};
        console.log("aiData", aiData)
        if (answer === undefined || answer === null) return null;

        return supabase
            .from("news")
            .update({
                answer, ansProp,
                ...(url ? { url } : {}),
                ...(pic ? { pic } : {}),
                ...(detailHtml ? { detailHtml } : {}),
                status: "done", updated_at: new Date()
            })
            .eq("id", insertData.id);
    });
    return NextResponse.json({ id: insertData.id });
}