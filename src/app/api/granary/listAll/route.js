import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { formatDateLocal, parseLocalDate } from "@/app/utils/date";
import { applyPlanetFilter } from "@/app/utils/query";

export async function POST(request, context) {
    const { planetId, userId, ...granaryFilter } = await request.json();

    let query = supabase.from("granary_user_template").select().match(granaryFilter);
    query = applyPlanetFilter(query, { planetId: null, userId });

    const { data: templateList, error } = await query;

    let granaryList = [];
    if (planetId) {
        const { data: granary } = await supabase.from('granary').select().eq("planetId", planetId);
        granaryList = granary;
    } else {
        if (userId) {
            const { data: granary } = await supabase.from('granary').select().eq("orphanUserId", userId);
            granaryList = granary;
        } else {
            const { data: granary } = await supabase.from('granary').select().is("planetId", null).is("orphanUserId", null);
            granaryList = granary;
        }
    }


    return NextResponse.json({ templateList, granaryList });
}