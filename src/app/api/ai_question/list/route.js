import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function GET() {
    const { data: allList } = await supabase.from("ai_question").select().order('answer_update_at', { ascending: false });
    return NextResponse.json({ list: allList });
}