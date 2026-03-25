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