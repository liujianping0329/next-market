import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { applyPlanetFilter } from "@/app/utils/query";

export async function POST(request, context) {
    const { planetId, userId, ...gardenFilter } = await request.json();

    let listQuery = supabase.from("garden").select().match({ topic: "Greengrass" });

    listQuery = applyPlanetFilter(listQuery, { planetId, userId }, "*,cate2(id,name),");
    listQuery = listQuery.order("date", { ascending: false }).order("created_at", { ascending: false });

    let cateQuery = supabase.from("garden_cate").select().is("parentId", null).eq("status", 1)
        .order('id', { ascending: true });

    const { data: matchList } = await listQuery;
    const { data: cate2s } = await cateQuery;
    return NextResponse.json({ list: matchList, cate2s });
}