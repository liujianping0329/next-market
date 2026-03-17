import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

import { applyPlanetFilter } from "@/app/utils/query";

export async function POST(request, context) {
    const { id, userId, date, cash, ...detail } = await request.json();


    // const { data: isExistDate } = await supabase.from("granary").select()
    //     .eq("date", date).eq("label", requestBody.label).maybeSingle();
    // console.log("isExistLabel", isExistLabel);
    // if (isExistLabel) {
    //     return NextResponse.json({
    //         errorCode: "LABEL_EXISTS",
    //         errorMsg: "类别名称已存在"
    //     }, { status: 400 });
    // }


    if (id) {
        await supabase.from('granary_detail').delete().eq("granaryId", id);
    }

    let query = supabase.from("granary_user_template").select();
    query = applyPlanetFilter(query, { planetId: null, userId });

    const { data: granaryTemplates } = await query;
    const cashRateMap = {
        cny: cash.cnyToJpy / 10000,
        wjpy: 1,
        twd: cash.twdToJpy / 10000,
        usd: cash.usdToJpy / 10000
    };

    const total = Object.entries(detail).reduce((sum, [value, price]) => {
        const template = granaryTemplates.find(n => n.value === value);
        if (!template) return sum;

        const rate = cashRateMap[template.cashType] ?? 1;
        return sum + price * rate;
    }, 0);

    const { data: granaryUpserted } = await supabase.from('granary').upsert({
        ...(id && { id }),
        date, ...(cash || {}),
        ...(userId && { userId }),
        total
    }).select().single();

    const detailRows = Object.entries(detail).map(([value, price]) => ({
        price,
        templateId: granaryTemplates.find(n => n.value === value)?.id,
        granaryId: granaryUpserted.id,
        ...(userId && { userId }),
    }));
    const { data: details } = await supabase.from('granary_detail').upsert(detailRows).select();
    return NextResponse.json({ details });
}