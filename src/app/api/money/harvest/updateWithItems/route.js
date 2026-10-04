import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request) {
    const { harvestId, title, items } = await request.json();
    const { error } = await supabase.from("harvest").update({ title }).eq("id", harvestId);
    if (error) return NextResponse.json({ errorMsg: error.message }, { status: 500 });

    // 修改正文时重建所有事项，同时重置完成状态。
    const { error: deleteError } = await supabase.from("harvest_item").delete().eq("harvest_id", harvestId);
    if (deleteError) return NextResponse.json({ errorMsg: deleteError.message }, { status: 500 });

    if (items.length) {
        const rows = items.map((item, index) => ({
            harvest_id: harvestId,
            sort_order: index,
            text: item.text,
            link: item.link,
            status: 0,
        }));
        const { error: itemError } = await supabase.from("harvest_item").insert(rows);
        if (itemError) return NextResponse.json({ errorMsg: itemError.message }, { status: 500 });
    }

    return NextResponse.json({ id: harvestId });
}
