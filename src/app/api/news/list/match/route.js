import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { formatDateLocal, parseLocalDate } from "@/app/utils/date";
import { applyPlanetFilter } from "@/app/utils/query";

export async function POST(request, context) {
    const { planetId, userId, matchPara } = await request.json();

    let query = supabase.from("news").select();
    query = applyPlanetFilter(query, { planetId, userId });

    const { data: matchList, error } = await query;
    return NextResponse.json({ list: matchList });
}