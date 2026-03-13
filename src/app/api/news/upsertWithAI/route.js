import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { generateAI } from "@/app/api/ai/_lib/generateAI";

export async function POST(request, context) {
    const requestBody = await request.json();
    const { data: insertData, error } = await supabase.from('news').upsert(requestBody).select().single();
    generateAI({
        type: "news",
        filled: {
            title: requestBody.question,
            content: requestBody.questionDetail
        }
    }).then((aiData) => {
        const { ans: answer, ...ansProp } = aiData?.ansJSON;
        if (answer === undefined || answer === null) return null;

        return supabase
            .from("news")
            .update({ answer, ansProp, status: "done", updated_at: new Date() })
            .eq("id", insertData.id);
    });
    return NextResponse.json({ id: insertData.id });
}