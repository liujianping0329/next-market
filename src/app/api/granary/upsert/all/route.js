import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request, context) {
    const { id, userId, date, cash, ...detail } = await request.json();
    const { data: granaryUpserted, error } = await supabase.from('granary').upsert({
        ...(id && { id }),
        date, ...(cash || {}),
        ...(userId && { userId }),
    }).select();

    if (id) {
        await supabase.from('granary_detail').delete().eq("granaryId", id);
    }

    // const detailRows = Object.entries(detail).map(([name, amount]) => ({
    //     granaryId: granaryUpserted.id,
    //     name,
    //     amount,
    // }));
    return NextResponse.json({});
}