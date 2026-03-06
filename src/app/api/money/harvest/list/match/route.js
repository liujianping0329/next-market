import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request, context) {
    const requestBody = await request.json();

    let query = supabase.from("harvest").select();
    if (requestBody.view === "harvestList") {
        query = query.select("*,garden(pics),f_user(raw_user_meta_data)")
    }
    if (requestBody.startTime__gte) {
        query = query.gte("startTime", requestBody.startTime__gte)
    }
    if (requestBody.startTime__lt) {
        query = query.lt("startTime", requestBody.startTime__lt)
    }
    const { data: matchList, error } = await query;
    return NextResponse.json({ list: matchList });
}