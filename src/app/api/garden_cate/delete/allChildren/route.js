import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request, context) {
    const requestBody = await request.json();

    // 第一层子项
    const { data: level1 = [] } = await supabase
        .from("garden_cate")
        .select("id")
        .eq("parentId", requestBody.id);

    const level1Ids = level1.map((item) => item.id);

    const { data: level2 = [] } = level1Ids.length
        ? await supabase
            .from("garden_cate")
            .select("id")
            .in("parentId", level1Ids)
        : { data: [] };
    const level2Ids = level2.map((item) => item.id);

    // 先删最深层
    if (level2Ids.length) {
        await supabase.from("garden_cate").delete().in("id", level2Ids);
    }
    if (level1Ids.length) {
        await supabase.from("garden_cate").delete().in("id", level1Ids);
    }

    return NextResponse.json({
        deletedIds: [...level1Ids, ...level2Ids],
    });
}