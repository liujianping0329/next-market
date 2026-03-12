import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function GET() {
    const paraExchange = {
        to: 'JPY',
        version: 2,
        key: '4bd5698591ec2b8ad65e16994e783d39',
    };
    const [{ result: [{ exchange: cnyToJpy }] },
        { result: [{ exchange: twdToJpy }] },
        { result: [{ exchange: usdToJpy }] }] = await Promise.all([
            fetch(`http://op.juhe.cn/onebox/exchange/currency?${new URLSearchParams({
                from: 'CNY', ...paraExchange
            }).toString()}`, {
                next: { revalidate: 7200 }
            }).then(r => r.json()),

            fetch(`http://op.juhe.cn/onebox/exchange/currency?${new URLSearchParams({
                from: 'TWD', ...paraExchange
            }).toString()}`, {
                next: { revalidate: 7200 }
            }).then(r => r.json()),

            fetch(`http://op.juhe.cn/onebox/exchange/currency?${new URLSearchParams({
                from: 'USD', ...paraExchange
            }).toString()}`, {
                next: { revalidate: 7200 }
            }).then(r => r.json()),
        ]);
    return NextResponse.json({ cash: { cnyToJpy: Number(cnyToJpy).toFixed(2), twdToJpy: Number(twdToJpy).toFixed(2), usdToJpy: Number(usdToJpy).toFixed(2) } });
}