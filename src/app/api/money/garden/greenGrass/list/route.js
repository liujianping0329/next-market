import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { applyPlanetFilter } from "@/app/utils/query";

export async function POST(request, context) {
    const { planetId, isPlanetNull, ...gardenFilter } = await request.json();

    let listQuery = supabase.from("garden").select().match({ topic: "Greengrass" });

    listQuery = applyPlanetFilter(listQuery, { planetId, isPlanetNull });
    listQuery = listQuery.order("date", { ascending: false }).order("created_at", { ascending: false });

    let cateQuery = supabase.from("constants").select().match({ category: "gardenCategory" })
        .order('sort', { ascending: true });

    const { data: matchList } = await listQuery;
    const { data: cates } = await cateQuery;
    return NextResponse.json({ list: matchList, cates: cates });
}