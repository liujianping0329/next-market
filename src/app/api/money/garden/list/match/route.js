import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { applyPlanetFilter } from "@/app/utils/query";

export async function POST(request, context) {
    const { planetId, isPlanetNull, ...gardenFilter } = await request.json();

    let query = supabase.from("garden").select().match(gardenFilter);

    query = applyPlanetFilter(query, { planetId, isPlanetNull });

    if (gardenFilter.topic === "SoyBean") {
        query = query.order('status', { ascending: false }).order('sort', { ascending: true });
    } else if (gardenFilter.topic === "Greengrass") {
        query = query.order("date", { ascending: false }).order("created_at", { ascending: false });
    }

    const { data: matchList } = await query;
    return NextResponse.json({ list: matchList });
}