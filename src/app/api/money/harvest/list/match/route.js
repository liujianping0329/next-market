import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request, context) {
    const requestBody = await request.json();

    console.log("sss", requestBody)
    let query = supabase.from("harvest").select();
    if (requestBody.startTime__gte) {
        query = query.gte("startTime", new Date(requestBody.startTime__gte).toISOString())
    }
    if (requestBody.startTime__lt) {
        query = query.lt("startTime", new Date(requestBody.startTime__lt).toISOString())
    }

    const { data: matchList } = await query;
    return NextResponse.json({ list: matchList });
}