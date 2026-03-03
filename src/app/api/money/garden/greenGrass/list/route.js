import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request, context) {
    const requestBody = await request.json();

    let listQuery = supabase.from("garden").select().match({ topic: "Greengrass" })
        .order("date", { ascending: false }).order("created_at", { ascending: false });
    let cateQuery = supabase.from("constants").select().match({ category: "gardenCategory" })
        .order('sort', { ascending: true });

    const { data: matchList } = await listQuery;
    const { data: cates } = await cateQuery;
    return NextResponse.json({ list: matchList, cates: cates });
}