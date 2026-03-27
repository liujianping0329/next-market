import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request, context) {
    const requestBody = await request.json();
    console.log(requestBody);

    await supabase.from("money").delete().match(requestBody).select("id");

    return NextResponse.json({});
}