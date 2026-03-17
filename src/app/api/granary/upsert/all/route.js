import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

import { applyPlanetFilter } from "@/app/utils/query";

export async function POST(request, context) {
    const { id, userId, date, cash, ...detail } = await request.json();
    //拿星球id
    let planetId = null;
    if (userId) {
        const { data: fuser } = await supabase.from('f_user').select().eq("id", userId).single();
        planetId = fuser.planetId;
    }

    //拿主表
    let curGranary = null
    if (planetId) {
        const { data: granary } = await supabase.from('granary').select().eq("date", date).eq("planetId", planetId).maybeSingle();
        curGranary = granary;
    } else {
        if (userId) {
            const { data: granary } = await supabase.from('granary').select().eq("date", date).eq("orphanUserId", userId).maybeSingle();
            curGranary = granary;
        } else {
            const { data: granary } = await supabase.from('granary').select().eq("date", date).is("planetId", null).is("orphanUserId", null).maybeSingle();
            curGranary = granary;
        }
    }

    //拿用户模板
    let query = supabase.from("granary_user_template").select();
    query = applyPlanetFilter(query, { planetId: null, userId });

    const { data: granaryTemplates } = await query;
    const cashRateMap = {
        cny: cash.cnyToJpy / 10000,
        wjpy: 1,
        twd: cash.twdToJpy / 10000,
        usd: cash.usdToJpy / 10000
    };

    //算总和
    const total = Object.entries(detail).reduce((sum, [value, price]) => {
        const template = granaryTemplates.find(n => n.value === value);
        if (!template) return sum;

        const rate = cashRateMap[template.cashType] ?? 1;
        return sum + price * rate;
    }, 0);

    const { data: granaryUpserted } = await supabase.from('granary').upsert({
        ...(curGranary && { id: curGranary.id }),
        date, ...(cash || {}),
        ...(planetId && { planetId }),
        total,
        ...((!planetId && userId) && { orphanUserId: userId }),
    }).select().single();


    if (curGranary) {
        if (userId) {
            await supabase.from('granary_detail').delete().eq("granaryId", curGranary.id).eq("userId", userId);
        } else {
            await supabase.from('granary_detail').delete().eq("granaryId", curGranary.id).is("userId", null);
        }
    }

    const detailRows = Object.entries(detail).map(([value, price]) => ({
        price,
        ...(userId && { userId }),
        templateId: granaryTemplates.find(n => n.value === value)?.id,
        granaryId: granaryUpserted.id
    }));
    const { data: details } = await supabase.from('granary_detail').insert(detailRows).select();
    return NextResponse.json({ details });
}