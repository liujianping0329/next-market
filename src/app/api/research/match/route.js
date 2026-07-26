import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";


export async function POST(request, context) {
    const { cateId, requestBody } = await request.json();

    let query = supabase.from("garden_research").select("*,garden(id),keywordId!inner(*,cateId(*))")
        .eq("keywordId.cateId", cateId);

    const { data: matchList, error } = await query.order('created_at', { ascending: false });

    return NextResponse.json({ list: matchList });
}