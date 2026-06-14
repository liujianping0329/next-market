import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";


export async function POST(request, context) {
    const requestBody = await request.json();

    const { data: detail, error } = await supabase.from("granary").select("*,granary_user_sum(*,f_user(*)),granary_detail(*,granary_user_template(*))")
        .eq("id", requestBody.granaryId)
        .order("created_at", { foreignTable: "granary_user_sum", ascending: false })
        .single();

    let lastQuery = supabase.from("granary").select("*,granary_user_sum(*),granary_detail(*)");

    if (detail.planetId === null) {
        lastQuery = lastQuery.is("planetId", null);
    } else {
        lastQuery = lastQuery.eq("planetId", detail.planetId);
    }

    if (detail.orphanUserId === null) {
        lastQuery = lastQuery.is("orphanUserId", null);
    } else {
        lastQuery = lastQuery.eq("orphanUserId", detail.orphanUserId);
    }
    lastQuery = lastQuery.lt("date", detail.date).order("date", { ascending: false }).limit(1).maybeSingle()
    const { data: lastData, error: lastDataErr } = await lastQuery;

    if (lastData) {
        detail.granary_user_sum.forEach((userSum) => {
            let tarLastUserSum = lastData.granary_user_sum.find(item => item.userId === userSum.userId);
            userSum.diff = tarLastUserSum
                ? Number((userSum.total - tarLastUserSum.total).toFixed(2))
                : undefined;
        });
        detail.granary_detail.forEach((detailItem) => {
            let tarLastDetailItem = lastData.granary_detail.find(item => item.templateId === detailItem.templateId);
            detailItem.diff = tarLastDetailItem
                ? Number((detailItem.price - tarLastDetailItem.price).toFixed(2))
                : undefined;
        });
    }

    return NextResponse.json({ detail });
}