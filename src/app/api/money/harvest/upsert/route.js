import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request, context) {
    const requestBody = await request.json();
    const { data, error } = await supabase.from('harvest').upsert(requestBody).select();
    console.log(error)
    return NextResponse.json({ id: data[0].id });
}