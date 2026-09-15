import { NextResponse } from "next/server";

import supabase from "@/app/utils/database";

export async function POST(request) {
    const { userId, targetDate } = await request.json();

    if (!userId || !targetDate) {
        return NextResponse.json({ message: "日报参数不正确" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("diet_daily_report")
        .select("status,summary,breakfast_advice,lunch_advice,dinner_advice,future_attention,health_context,completed_at")
        .eq("user_id", userId)
        .eq("target_date", targetDate)
        .maybeSingle();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ report: data });
}
