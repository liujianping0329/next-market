import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request, context) {
    const requestBody = await request.json();

    console.log("sss", requestBody)
    let query = supabase.from("harvest").select();
    if (requestBody.view === "harvestList") {
        query = query.select("*,garden(pics)")
    }
    if (requestBody.startTime__gte) {
        query = query.gte("startTime", requestBody.startTime__gte)
    }
    if (requestBody.startTime__lt) {
        query = query.lt("startTime", requestBody.startTime__lt)
    }
    const { data: matchList, error } = await query;
    console.log("err", error);
    return NextResponse.json({ list: matchList });
}