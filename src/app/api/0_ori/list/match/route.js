import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { formatDateLocal, parseLocalDate } from "@/app/utils/date";

export async function POST(request, context) {
    const requestBody = await request.json();

    let query = supabase.from("f_user").select().match(requestBody);

    const { data: matchList, error } = await query;
    return NextResponse.json({ list: matchList });
}