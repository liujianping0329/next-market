import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";


export async function POST(request, context) {
    const requestBody = await request.json();

    let query = supabase.from("location").select().neq("status", -1).eq("planetId", requestBody.planetId)
        .order("status", { ascending: false });

    const { data: matchList, error } = await query;
    return NextResponse.json({ list: matchList });
}