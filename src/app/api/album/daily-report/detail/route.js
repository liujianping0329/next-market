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
        .select("id,user_id,target_date,status,summary,breakfast_advice,lunch_advice,dinner_advice,future_attention,health_context,completed_at,nut_calories_kcal,nut_protein_g,nut_fat_g,nut_saturated_fat_g,nut_carbohydrate_g,nut_dietary_fiber_g,nut_vitamin_a_ug,nut_vitamin_b1_mg,nut_vitamin_b2_mg,nut_vitamin_b6_mg,nut_vitamin_b12_ug,nut_vitamin_c_mg,nut_vitamin_d_ug,nut_calcium_mg,nut_iron_mg,nut_sodium_mg,nut_potassium_mg");

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

    if (!data) return NextResponse.json({ report: null, nutritionTarget: null });

    const { data: nutritionTarget, error: nutritionTargetError } = await supabase
        .from("user_nutrition_target")
        .select("energy_kcal_min,energy_kcal_max,protein_g_min,protein_g_max,fat_g_min,fat_g_max,saturated_fat_g_max,carbohydrate_g_min,carbohydrate_g_max,dietary_fiber_g_min,vitamin_a_ug_rae_min,vitamin_b1_mg_min,vitamin_b2_mg_min,vitamin_b6_mg_min,vitamin_b12_ug_min,vitamin_c_mg_min,vitamin_d_ug_target,calcium_mg_min,iron_mg_min,sodium_mg_max,potassium_mg_min")
        .eq("user_id", data.user_id)
        .maybeSingle();

    if (nutritionTargetError) {
        return NextResponse.json({ message: nutritionTargetError.message }, { status: 500 });
    }

    return NextResponse.json({ report: data, nutritionTarget });
}
