import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

import { calGranaryTotal } from "@/app/api/granary/_lib/biz";

export async function POST(request, context) {
    const requestBody = await request.json();

    if (!requestBody.id) {
        return NextResponse.json({ error: "granary id is required" }, { status: 400 });
    }

    if (requestBody.userId) {
        await supabase.from("granary_detail").delete().eq("granaryId", requestBody.id)
            .eq("userId", requestBody.userId);
        await supabase.from("granary_user_sum").delete().eq("granaryId", requestBody.id)
            .eq("userId", requestBody.userId);
    } else if (requestBody.userId == null) {
        await supabase.from("granary_detail").delete().eq("granaryId", requestBody.id)
            .is("userId", null);
        await supabase.from("granary_user_sum").delete().eq("granaryId", requestBody.id)
            .is("userId", null);
    }
    const { data: granary } = await supabase.from("granary").select().eq("id", requestBody.id).single();
    await calGranaryTotal(granary);

    return NextResponse.json({ id: granary.id });
}
