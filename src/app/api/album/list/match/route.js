import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";


export async function POST(request, context) {
    const requestBody = await request.json();

    let query = supabase.from("album").select("*,f_user(*),location(*)").match(requestBody).order("created_at", { ascending: false });

    const { data: matchList, error } = await query;
    return NextResponse.json({ list: matchList });
}