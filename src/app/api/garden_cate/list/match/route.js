import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";


export async function POST(request, context) {
    const { parentNull, ...requestBody } = await request.json();

    let query = supabase.from("garden_cate").select().match(requestBody);

    if (parentNull) {
        query = query.is("parentId", null);
    }

    const { data: matchList, error } = await query;
    return NextResponse.json({ list: matchList });
}