import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";


export async function POST(request, context) {
    const requestBody = await request.json();

    let query = supabase.from("garden_research").select().match(requestBody);

    const { data: matchList, error } = await query.order('created_at', { ascending: false });
    console.log(matchList)
    return NextResponse.json({ list: matchList });
}