import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { formatDateLocal, parseLocalDate } from "@/app/utils/date";

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
    const { data: matchList, error } = await query.order('startTime', { ascending: true });
    const list = matchList.map(i => ({ ...i, startTime: i.startTime.replace("T", " ").slice(0, 16) }));
    return NextResponse.json({ list: list });
}