import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request, context) {
    const requestBody = await request.json();

    let detailQuery = supabase.from("garden").select().match({ id: requestBody.id })
        .single();
    let cateQuery = supabase.from("constants").select().match({ category: "gardenCategory" })
        .order('sort', { ascending: true });

    const { data: detail } = await detailQuery;
    const { data: cates } = await cateQuery;
    return NextResponse.json({ detail: detail, cates: cates });
}