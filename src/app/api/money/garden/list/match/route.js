import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request, context) {
    const { planetId, isPlanetNull, ...gardenFilter } = await request.json();

    let query = supabase.from("garden").select(`*,
        user_filter:f_user(),
        planet_filter:f_user(planet()),
        f_user(*,planet(*)),
        f_user_filter:f_user!inner(planetId)`).match(gardenFilter);

    if (planetId) {
        query = query.eq('f_user_filter.planetId', planetId);
    } else if (isPlanetNull) {
        query = query.or("user_filter.is.null,planet_filter.is.null");
    }

    if (gardenFilter.topic === "SoyBean") {
        query = query.order('status', { ascending: false }).order('sort', { ascending: true });
    } else if (gardenFilter.topic === "Greengrass") {
        query = query.order("date", { ascending: false }).order("created_at", { ascending: false });
    }

    const { data: matchList } = await query;
    return NextResponse.json({ list: matchList });
}