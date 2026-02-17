import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request, context) {
    const requestBody = await request.json();

    let query = supabase.from("garden").select().match(requestBody);

    if (requestBody.topic === "SoyBean") {
        query = query.order('status', { ascending: false }).order('sort', { ascending: true });
    } else if (requestBody.topic === "Greengrass") {
        query = query.order("date", { ascending: false }).order("created_at", { ascending: false });
    }

    const { data: matchList } = await query;
    console.log("Match Garden List:", matchList);
    return NextResponse.json({ list: matchList });
}