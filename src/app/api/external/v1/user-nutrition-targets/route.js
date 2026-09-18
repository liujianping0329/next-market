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
