import { NextResponse } from "next/server";
import { generateText, generateImage } from "ai";
import { openai } from "@ai-sdk/openai";

import supabase from "@/app/utils/database";

export async function calGranaryTotal(granary) {

  const cashRateMap = {
    cny: granary.cnyToJpy / 10000,
    wjpy: 1,
    twd: granary.twdToJpy / 10000,
    usd: granary.usdToJpy / 10000
  };

  //重拿子表所有记录
  const { data: detailAll } = await supabase.from('granary_detail').select("*, granary_user_template(*)").eq("granaryId", granary.id);
  if (detailAll.length === 0) {
    await supabase.from('granary').delete().eq("id", granary.id)
    return null;
  }

  //算总和
  const total = detailAll.reduce((sum, detailItem) => {
    const rate = cashRateMap[detailItem.granary_user_template.cashType] ?? 1;
    return sum + detailItem.price * rate;
  }, 0);

  const { data: granaryUpsertedTotal, error } = await supabase.from('granary').update({
    total
  }).eq("id", granary.id).select().single();
  return granaryUpsertedTotal;
}

export async function outputOldSys(userId, date, cash, total) {
  if (userId !== "c0db971f-d334-46ec-9080-ce9c64617dd0" && userId !== "09909ed0-70ca-4c96-93ed-ba3301573a75") return
  const { data: oldMoney, error } = await supabase.from('money').select().eq("date", date).maybeSingle();
  console.log({ oldMoney })
  if (oldMoney) {
    let newSysExt = [...oldMoney.newSysExt];
    let userTotal = newSysExt.find(item => item.userId === userId);
    if (userTotal) {
      userTotal.total = total;
    } else {
      newSysExt.push({ userId, total });
    }
    await supabase.from('money').update({
      total: newSysExt.reduce((sum, item) => sum + item.total, 0),
      newSysExt: newSysExt
    }).eq("id", oldMoney.id);
  } else {
    await supabase.from('money').insert({
      ...(cash || {}), total, date,
      newSysExt: [{ userId, total }]
    });
  }
}