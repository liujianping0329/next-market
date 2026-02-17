import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request, context) {
    const requestBody = await request.json();
    const { data: matchList } = await supabase.from("garden").select().match(requestBody)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .order('status', { ascending: false })
        .order('sort', { ascending: true });
    console.log("Match Garden List:", matchList);
    return NextResponse.json({ list: matchList });
}