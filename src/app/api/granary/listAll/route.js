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
    let planetUsers = [];
    if (planetId) {
        const { data: granary } = await supabase.from('granary').select().eq("planetId", planetId).order("date", { ascending: false });
        granaryList = granary;
        const { data: users } = await supabase.from('f_user').select().eq("planetId", planetId);
        planetUsers = users;
    } else {
        if (userId) {
            const { data: granary } = await supabase.from('granary').select().eq("orphanUserId", userId).order("date", { ascending: false });
            granaryList = granary;
        } else {
            const { data: granary } = await supabase.from('granary').select().is("planetId", null).is("orphanUserId", null).order("date", { ascending: false });
            granaryList = granary;
        }
    }

    granaryList = granaryList.map((item, index, arr) => ({
        ...item,
        diffToNext: index < arr.length - 1
            ? item.total - arr[index + 1].total
            : null // 最后一个没有下一个
    }));


    return NextResponse.json({ templateList, granaryList, planetUsers });
}