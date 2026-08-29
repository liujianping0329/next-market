import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import ky from "ky";

export async function POST(request, context) {
    const requestBody = await request.json();
    const aiResult = await ky.get(`${process.env.SPRING_AI_URL}/data`, {
        searchParams: {
            question: requestBody.question,
        },
        timeout: 180000
    }).json();
    requestBody.answer = aiResult.answer;
    requestBody.answer_update_at = new Date();
    requestBody.token = aiResult.token;
    const { data, error } = await supabase.from('ai_question').upsert(requestBody).select();
    return NextResponse.json({ id: data[0].id });
}