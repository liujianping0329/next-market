import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { encode } from "@/app/utils/base64";


export async function POST(request, context) {
    const requestBody = await request.json();

    let detailQuery = supabase.from("garden").select("*,garden_ai(*),garden_remark(*,f_user(*)),garden_ext(*)").match({ id: requestBody.id })
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
    detail.point =
        detail.garden_remark.length > 0
            ? (
                detail.garden_remark.reduce((sum, item) => {
                    return sum + Number(item.point || 0);
                }, 0) / detail.garden_remark.length
            ).toFixed(1)
            : "0.0";
    return NextResponse.json({ detail: detail, cates: cates });
}