import { NextResponse } from "next/server";
import supabase from "../../../utils/database";

export async function POST(request, context) {
    const requestBody = await request.json();

    Object.keys(requestBody).forEach((key) => {
        const v = requestBody[key];

        if (!isNaN(v) && v !== null && v !== "" && v !== true && v !== false) {
            requestBody[key] = Number(v);
        }
    });

    const {data:curDateMoney} = await supabase.from("money").select().eq("date",requestBody.date).single();
    let upsertId = -1;
    if (curDateMoney) {
        if(requestBody.from === "X") {
            curDateMoney.total = requestBody.jpyX + (requestBody.twd * requestBody.twdToJpy / 10000) + requestBody.nisaX;
            curDateMoney.detail = {
                ...curDateMoney.detail,
                jpyX: requestBody.jpyX,
                twd: requestBody.twd,
                nisaX: requestBody.nisaX
            };
        }else if(requestBody.from === "L") {
            curDateMoney.total = requestBody.jpyL + (requestBody.zfb * requestBody.cnyToJpy / 10000) + requestBody.cnbj
                + (requestBody.zsbc * requestBody.cnyToJpy / 10000);
            curDateMoney.detail = {
                ...curDateMoney.detail,
                jpyL: requestBody.jpyL,
                zfb: requestBody.zfb,
                cnbj: requestBody.cnbj,
                zsbc: requestBody.zsbc
            };
        }
        curDateMoney.total = +curDateMoney.total.toFixed(2);
        upsertId = curDateMoney.id;
        await supabase.from("money").update(curDateMoney).eq("id",curDateMoney.id);
    } else {
        const insertData = {
            date: requestBody.date,
            cnyToJpy: requestBody.cnyToJpy,
            twdToJpy: requestBody.twdToJpy,
            usdToJpy: requestBody.usdToJpy
        };
        if(requestBody.from === "X") {
            insertData.total = requestBody.jpyX + (requestBody.twd * requestBody.twdToJpy / 10000) + requestBody.nisaX;
            insertData.detail = {
                jpyX: requestBody.jpyX,
                twd: requestBody.twd,
                nisaX: requestBody.nisaX
            };
        }else if(requestBody.from === "L") {
            insertData.total = requestBody.jpyL + (requestBody.zfb * requestBody.cnyToJpy / 10000) + requestBody.cnbj
                + (requestBody.zsbc * requestBody.cnyToJpy / 10000);
            insertData.detail = {
                jpyL: requestBody.jpyL,
                zfb: requestBody.zfb,
                cnbj: requestBody.cnbj,
                zsbc: requestBody.zsbc
            };
        }
        console.log("Insert Data:", insertData.total);
        insertData.total = +insertData.total.toFixed(2);
        const { data:insertRes } = await supabase.from("money").insert(insertData).select();
        upsertId = insertRes[0].id;
    }
    return NextResponse.json({ id: upsertId });
}