import { NextResponse } from "next/server";

import supabase from "@/app/utils/database";

/**
 * @swagger
 * /api/external/v1/user-nutrition-targets:
 *   get:
 *     summary: 获取全部用户营养目标
 *     description: 返回全部用户的营养目标和用户邮箱，不需要鉴权。
 *     tags:
 *       - Nutrition
 *     responses:
 *       200:
 *         description: 获取成功
 */
export async function GET() {
    const { data: targets, error: targetError } = await supabase
        .from("user_nutrition_target")
        .select("*,user:f_user!user_nutrition_target_user_id_fkey(id,email)");

    if (targetError) {
        return NextResponse.json({ message: targetError.message }, { status: 500 });
    }

    return NextResponse.json({ data: targets });
}

/**
 * @swagger
 * /api/external/v1/user-nutrition-targets:
 *   post:
 *     summary: 写入用户营养目标
 *     description: 按请求体的user.id覆盖或新增用户营养目标，不需要鉴权。
 *     tags:
 *       - Nutrition
 *     responses:
 *       200:
 *         description: 写入成功
 */
export async function POST(request) {
    const {
        user,
        profile,
        goals,
        healthTags,
        activityEstimates,
        nutritionTargets,
        appliedRules,
    } = await request.json();

    if (!user?.id || !profile || !nutritionTargets) {
        return NextResponse.json({ message: "营养目标参数不正确" }, { status: 400 });
    }

    const data = {
        user_id: user.id,
        sex: profile.sex,
        birth_date: profile.birthDate,
        age: profile.age,
        age_band: profile.ageBand,
        height_cm: profile.heightCm,
        current_weight_kg: profile.currentWeightKg,
        target_weight_kg: profile.targetWeightKg,
        reference_weight_kg: profile.referenceWeightKg,
        body_fat_pct: profile.bodyFatPct,
        activity: profile.activity,
        bmi: profile.bmi,
        menstruation: profile.menstruation,
        ckd_stage: profile.ckdStage,
        walking_kcal_per_step: activityEstimates?.walking?.kcalPerStep,
        goals: goals ?? [],
        health_tags: healthTags ?? [],
        applied_rules: appliedRules ?? {},
        energy_kcal_min: nutritionTargets.energyKcal?.min,
        energy_kcal_max: nutritionTargets.energyKcal?.max,
        protein_g_min: nutritionTargets.proteinG?.min,
        protein_g_max: nutritionTargets.proteinG?.max,
        fat_g_min: nutritionTargets.fatG?.min,
        fat_g_max: nutritionTargets.fatG?.max,
        saturated_fat_g_max: nutritionTargets.saturatedFatG?.max,
        carbohydrate_g_min: nutritionTargets.carbohydrateG?.min,
        carbohydrate_g_max: nutritionTargets.carbohydrateG?.max,
        dietary_fiber_g_min: nutritionTargets.dietaryFiberG?.min,
        vitamin_a_ug_rae_min: nutritionTargets.vitaminA_ugRAE?.min,
        vitamin_b1_mg_min: nutritionTargets.vitaminB1_mg?.min,
        vitamin_b2_mg_min: nutritionTargets.vitaminB2_mg?.min,
        vitamin_b6_mg_min: nutritionTargets.vitaminB6_mg?.min,
        vitamin_b12_ug_min: nutritionTargets.vitaminB12_ug?.min,
        vitamin_c_mg_min: nutritionTargets.vitaminC_mg?.min,
        vitamin_d_ug_target: nutritionTargets.vitaminD_ug?.target,
        calcium_mg_min: nutritionTargets.calcium_mg?.min,
        iron_mg_min: nutritionTargets.iron_mg?.min,
        sodium_mg_max: nutritionTargets.sodium_mg?.max,
        salt_equivalent_g_max: nutritionTargets.saltEquivalent_g?.max,
        potassium_mg_min: nutritionTargets.potassium_mg?.min,
    };

    const { data: target, error } = await supabase
        .from("user_nutrition_target")
        .upsert(data, { onConflict: "user_id" })
        .select("*,user:f_user!user_nutrition_target_user_id_fkey(id,email)")
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: target });
}
