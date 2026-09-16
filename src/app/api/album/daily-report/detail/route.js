import { NextResponse } from "next/server";

import supabase from "@/app/utils/database";

export async function POST(request) {
    const { reportId, userId, targetDate } = await request.json();
    const normalizedReportId = Number(reportId);
    const hasReportId = reportId !== undefined && reportId !== null;

    if (hasReportId && (!Number.isSafeInteger(normalizedReportId) || normalizedReportId <= 0)) {
        return NextResponse.json({ message: "日报参数不正确" }, { status: 400 });
    }

    let query = supabase
        .from("diet_daily_report")
        .select("id,status,summary,breakfast_advice,lunch_advice,dinner_advice,future_attention,health_context,completed_at");

    if (hasReportId) {
        query = query.eq("id", normalizedReportId);
    } else {
        if (!userId || !targetDate) {
            return NextResponse.json({ message: "日报参数不正确" }, { status: 400 });
        }

        query = query.eq("user_id", userId).eq("target_date", targetDate);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ report: data });
}
