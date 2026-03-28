import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { formatDateLocal, parseLocalDate } from "@/app/utils/date";

export async function POST(request, context) {
    const requestBody = await request.json();

    let query = supabase.from("granary").select("*,granary_user_sum(*,f_user(*)),granary_detail(*,granary_user_template(*))")
        .eq("id", requestBody.granaryId)
        .order("created_at", { foreignTable: "granary_user_sum", ascending: false })
        .single();

    const { data: detail, error } = await query;
    return NextResponse.json({ detail });
}