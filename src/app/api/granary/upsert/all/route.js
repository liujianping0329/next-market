import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

import { applyPlanetFilter } from "@/app/utils/query";
import { calGranaryTotal } from "@/app/api/granary/_lib/biz";

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

    const { data: granaryUpserted } = await supabase.from('granary').upsert({
        ...(curGranary && { id: curGranary.id }),
        date, ...(cash || {}),
        ...(planetId && { planetId }),
        ...((!planetId && userId) && { orphanUserId: userId }),
    }).select().single();

    //重置子表
    if (curGranary) {
        if (userId) {
            await supabase.from('granary_detail').delete().eq("granaryId", curGranary.id).eq("userId", userId);
            await supabase.from('granary_user_sum').delete().eq("granaryId", curGranary.id).eq("userId", userId);
        } else {
            await supabase.from('granary_detail').delete().eq("granaryId", curGranary.id).is("userId", null);
            await supabase.from('granary_user_sum').delete().eq("granaryId", curGranary.id).is("userId", null);
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

    const detailRows = Object.entries(detail).map(([value, price]) => ({
        price,
        ...(userId && { userId }),
        templateId: granaryTemplates.find(n => n.value === value)?.id,
        granaryId: granaryUpserted.id
    }));
    const { data: detailsInsert } = await supabase.from('granary_detail').insert(detailRows).select();

    //算个人总和
    const totalUser = detailsInsert.reduce((sum, detailItem) => {
        const rate = cashRateMap[granaryTemplates.find(n => n.id === detailItem.templateId)?.cashType] ?? 1;
        return sum + detailItem.price * rate;
    }, 0);

    const { data: userSumInsert } = await supabase.from('granary_user_sum').insert({
        granaryId: granaryUpserted.id,
        ...(userId && { userId }),
        total: totalUser
    }).select();

    await calGranaryTotal(granaryUpserted);

    return NextResponse.json({ detailsInsert });
}
