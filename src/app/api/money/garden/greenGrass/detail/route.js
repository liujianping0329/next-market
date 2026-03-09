import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { encode, decode } from "@/app/utils/base64";
import { id } from "date-fns/locale";

export async function POST(request, context) {
    const requestBody = await request.json();

    let detailQuery = supabase.from("garden").select("*,garden_ai(*)").match({ id: requestBody.id })
        .single();
    let cateQuery = supabase.from("constants").select().match({ category: "gardenCategory" })
        .order('sort', { ascending: true });

    const { data: detail } = await detailQuery;
    const { data: cates } = await cateQuery;

    detail.passCode = encode({
        table: "garden",
        id: detail.id,
        title: detail.title
    });
    return NextResponse.json({ detail: detail, cates: cates });
}