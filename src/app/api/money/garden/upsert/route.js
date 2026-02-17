import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request, context) {
    const requestBody = await request.json();

    if (requestBody?.[0]?.topic === "SoyBean") {
        const { data: maxRow } = await supabase
            .from("garden")
            .select("sort")
            .eq("topic", "SoyBean")
            .order("sort", { ascending: false })
            .limit(1)
            .maybeSingle();
        console.log("Max Sort for SoyBean:", maxRow);
        let currentSort = maxRow?.sort ?? 0;
        console.log("Max Sort for SoyBean:", currentSort);

        // 给每条新记录分配一个递增的 sort 值
        requestBody.forEach((item, index) => {
            item.sort = currentSort + index + 1;
        });
    }

    const { data } = await supabase.from('garden').upsert(requestBody).select();
    console.log("Upserted Garden:", data);
    return NextResponse.json({ ids: data.map(item => item.id) });
}