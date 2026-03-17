import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

import { applyPlanetFilter } from "@/app/utils/query";

export async function POST(request, context) {
    const { id, userId, date, cash, ...detail } = await request.json();

    let planetId = null;
    if (userId) {
        const { data: fuser } = await supabase.from('f_user').select().eq("id", userId).single();
        planetId = fuser.planetId;
    }

    const { data: granary } = await supabase.from('granary').select().eq("date", date).eq("planetId", planetId).maybeSingle();

    // if (id) {
    //     if (userId) {
    //         await supabase.from('granary_detail').delete().eq("date", date).eq("userId", userId);
    //     } else {
    //         await supabase.from('granary_detail').delete().eq("date", date).is("userId", null);
    //     }
    // } else {
    //     if (userId) {
    //         const { data: detailDataCheck } = await supabase.from("granary_detail").select()
    //             .eq("date", date).eq("userId", userId);
    //         if (detailDataCheck.length > 0) {
    //             return NextResponse.json({
    //                 errorCode: "DATE_EXISTS",
    //                 errorMsg: "同一用户每天只能新增一次数据"
    //             }, { status: 400 });
    //         }
    //     } else {
    //         const { data: detailDataCheck } = await supabase.from("granary_detail").select()
    //             .eq("date", date).is("userId", null);
    //         if (detailDataCheck.length > 0) {
    //             return NextResponse.json({
    //                 errorCode: "DATE_EXISTS",
    //                 errorMsg: "匿名用户每天只能新增一次数据"
    //             }, { status: 400 });
    //         }
    //     }
    // }

    // let query = supabase.from("granary_user_template").select();
    // query = applyPlanetFilter(query, { planetId: null, userId });

    // const { data: granaryTemplates } = await query;
    // const cashRateMap = {
    //     cny: cash.cnyToJpy / 10000,
    //     wjpy: 1,
    //     twd: cash.twdToJpy / 10000,
    //     usd: cash.usdToJpy / 10000
    // };

    // const total = Object.entries(detail).reduce((sum, [value, price]) => {
    //     const template = granaryTemplates.find(n => n.value === value);
    //     if (!template) return sum;

    //     const rate = cashRateMap[template.cashType] ?? 1;
    //     return sum + price * rate;
    // }, 0);

    // const { data: granaryUpserted } = await supabase.from('granary').upsert({
    //     ...(id && { id }),
    //     date, ...(cash || {}),
    //     ...(userId && { userId }),
    //     total
    // }).select().single();

    // const { data: granaryUpserted } = await supabase.from('granary').select().eq().single();



    // const detailRows = Object.entries(detail).map(([value, price]) => ({
    //     price,
    //     templateId: granaryTemplates.find(n => n.value === value)?.id,
    //     ...(userId && { userId }),
    // }));
    // const { data: details } = await supabase.from('granary_detail').upsert(detailRows).select();
    return NextResponse.json({});
}