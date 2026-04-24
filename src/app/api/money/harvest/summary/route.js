import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { formatDateLocal, parseLocalDate } from "@/app/utils/date";
import { applyPlanetFilter } from "@/app/utils/query";

export async function POST(request, context) {
    const { planetId, userId, start, end } = await request.json();
    let query = supabase.from("harvest").select();

    query = applyPlanetFilter(query, { planetId, userId });
    const { data: list } = await query.gte('startTime', start)
        .lt('startTime', end).order('startTime', { ascending: true });
    return NextResponse.json(list);
}