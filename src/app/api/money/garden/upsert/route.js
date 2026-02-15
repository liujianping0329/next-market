import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request, context) {
    const requestBody = await request.json();
    console.log("Upserted Garden:", requestBody);
    const { data } = await supabase.from('garden').upsert(requestBody).select();
    console.log("Upserted Garden:", data);
    return NextResponse.json({ id: data[0].id });
}