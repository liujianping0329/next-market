import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { formatDateLocal, parseLocalDate } from "@/app/utils/date";

export async function POST(request, context) {
    // const requestBody = await request.json();
    const { planetId, isPlanetNull, ...harvestFilter } = await request.json();

    let query = supabase.from("harvest").select();
    if (harvestFilter.view === "harvestList") {
        query = query.select(`*,garden(pics),
            user_filter:f_user(),
            planet_filter:f_user(planet()),
            f_user(*,planet(*))
            `)
    }
    console.log(planetId)
    console.log(isPlanetNull)
    if (planetId) {
        query = query.eq('f_user.planetId', planetId);
    } else if (isPlanetNull) {
        query = query.or("user_filter.is.null,planet_filter.is.null");
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