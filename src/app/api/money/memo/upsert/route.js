import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request, context) {
    const requestBody = await request.json();

    const { data } = await supabase.from('money_memo').upsert(requestBody).select();
    console.log("Upserted Memo:", data);
    return NextResponse.json({ id: data[0].id });
}