import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { formatDateLocal, parseLocalDate } from "@/app/utils/date";

import { getContants } from "@/app/api/constants/_lib/biz";

export async function POST(request, context) {
    const { planetId, ...requestBody } = await request.json();

    let query = supabase.from("spend_fix").select("*,constants(*)").match(requestBody);

    const { data: matchList, error } = await query;

    let spendCate = await getContants({
        category: "spendCate",
        ...(planetId ? { planetId } : { userId: requestBody.userId }),
    });
    return NextResponse.json({ list: matchList, spendCate });
}