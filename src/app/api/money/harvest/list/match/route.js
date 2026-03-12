import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { formatDateLocal, parseLocalDate } from "@/app/utils/date";
import { applyPlanetFilter } from "@/app/utils/query";

export async function POST(request, context) {
    // const requestBody = await request.json();
    const { planetId, userId, ...harvestFilter } = await request.json();

    let query = supabase.from("harvest").select();
    if (harvestFilter.view === "harvestList") {
        query = applyPlanetFilter(query, { planetId, userId }, `
            *,garden(pics),
        `);
    }
    if (harvestFilter.startTime__gte) {
        query = query.gte("startTime", harvestFilter.startTime__gte)
    }
    if (harvestFilter.startTime__lt) {
        query = query.lt("startTime", harvestFilter.startTime__lt)
    }

    const { data: matchList, error } = await query.order('startTime', { ascending: true });
    const list = matchList.map(i => ({ ...i, startTime: i.startTime.replace("T", " ").slice(0, 16) }));
    return NextResponse.json({ list: list });
}