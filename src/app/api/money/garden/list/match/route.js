import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { applyPlanetFilter } from "@/app/utils/query";

export async function POST(request, context) {
    const { planetId, userId, statuses, filterUserId, ...gardenFilter } = await request.json();

    let query = supabase.from("garden").select().match(gardenFilter);

    if (statuses && statuses.length > 0) {
        query = query.in("status", statuses);
    }

    if (filterUserId) {
        query = query.eq("userId", filterUserId);
    }

    query = applyPlanetFilter(query, { planetId, userId });

    if (gardenFilter.topic === "SoyBean") {
        query = query.order('status', { ascending: false }).order('sort', { ascending: true });
    } else if (gardenFilter.topic === "Greengrass") {
        query = query.order("date", { ascending: false }).order("created_at", { ascending: false });
    }

    const { data: matchList } = await query;
    return NextResponse.json({ list: matchList });
}