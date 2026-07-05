import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

import { getContants } from "@/app/api/constants/_lib/biz";

export async function POST(request, context) {
    const { planetId, userId, gteDate, ltDateMaybe, ...requestBody } = await request.json();

    let query = supabase.from("spend").select("*,f_user(*),location(*)").match(requestBody).order("isFix", { ascending: false })
        .order("date", { ascending: false }).order("created_at", { ascending: false });
    if (planetId) {
        query = query.eq("planetId", planetId);
    } else {
        query = query.eq("userId", userId);
    }
    if (gteDate) {
        query = query.gte("date", gteDate);
    }
    if (ltDateMaybe) {
        query = query.lt("date", ltDateMaybe);
    }

    let { data: spends, error } = await query;

    spends = spends.map(spend => {
        if (spend.cashType === "cny") {
            spend.jpyCost = (spend.amount * spend.cnyToJpy).toFixed(0);
        } else if (spend.cashType === "twd") {
            spend.jpyCost = (spend.amount * spend.twdToJpy).toFixed(0);
        } else if (spend.cashType === "wjpy") {
            spend.jpyCost = (spend.amount * 10000).toFixed(0);
        } else {
            spend.jpyCost = (spend.amount * 1).toFixed(0);
        }
        return spend;
    });

    let spendCate = await getContants({
        category: "spendCate",
        ...(planetId ? { planetId } : { userId }),
    });

    spendCate = spendCate.map(cate => {
        cate.spends = spends.filter(spend => spend.category === cate.id);
        cate.total = cate.spends.reduce((sum, spend) => sum + Number(spend.jpyCost), 0);
        return cate;
    });

    return NextResponse.json({ detail: spendCate });
}