import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";


export async function POST(request, context) {
    const requestBody = await request.json();

    let query = supabase.from("ai_question").select().match(requestBody)
        .order('answer_update_at', { ascending: false });;

    const { data: matchList, error } = await query;
    return NextResponse.json({ list: matchList });
}