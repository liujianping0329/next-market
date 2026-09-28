import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request) {
    const { startTime, title, userId, journeyId, journeyType, items } = await request.json();
    const { data: harvest, error } = await supabase.from('harvest').insert({
        startTime,
        title,
        userId,
        journeyId,
        journeyType,
    }).select('id').single();

    if (error) return NextResponse.json({ errorMsg: error.message }, { status: 500 });

    if (items.length) {
        const rows = items.map((item, index) => ({
            harvest_id: harvest.id,
            sort_order: index,
            text: item.text,
            link: item.link,
        }));
        const { error: itemError } = await supabase.from('harvest_item').insert(rows);
        if (itemError) {
            const { error: cleanupError } = await supabase.from('harvest').delete().eq('id', harvest.id);
            return NextResponse.json({
                errorMsg: cleanupError
                    ? `正文保存失败，且新建记录清理失败：${itemError.message}`
                    : itemError.message,
            }, { status: 500 });
        }
    }

    return NextResponse.json({ id: harvest.id });
}
