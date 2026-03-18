import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request, context) {
    const requestBody = await request.json();
    console.log(requestBody);
    const { data, error } = await supabase.from('granary_user_template').upsert(requestBody).select();
    return NextResponse.json({ id: data[0].id });
}