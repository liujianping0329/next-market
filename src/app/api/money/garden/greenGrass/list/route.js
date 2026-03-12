import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request, context) {
    const { planetId, isPlanetNull, ...gardenFilter } = await request.json();

    let listQuery = supabase.from("garden").select(`*,
        user_filter:f_user(),
        planet_filter:f_user(planet()),
        f_user(*,planet(*)),
        f_user_filter:f_user!inner(planetId)`).match({ topic: "Greengrass" });

    if (planetId) {
        listQuery = listQuery.eq('f_user_filter.planetId', planetId);
    } else if (isPlanetNull) {
        listQuery = listQuery.or("user_filter.is.null,planet_filter.is.null");
    }
    listQuery = listQuery.order("date", { ascending: false }).order("created_at", { ascending: false });

    let cateQuery = supabase.from("constants").select().match({ category: "gardenCategory" })
        .order('sort', { ascending: true });

    const { data: matchList } = await listQuery;
    const { data: cates } = await cateQuery;
    return NextResponse.json({ list: matchList, cates: cates });
}