import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request, context) {
    const requestBody = await request.json();

    const { data } = await supabase.from("garden").delete().match(requestBody).select("id");

    return NextResponse.json({ ids: data.map(item => item.id) });
}