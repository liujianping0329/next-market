import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { error } from "console";
import { REDIRECT_ERROR_CODE } from "next/dist/client/components/redirect-error";

export async function POST(request, context) {
    const requestBody = await request.json();
    if (requestBody.category) {
        if (requestBody.label) {
            const { data: isExistLabel } = await supabase.from("constants").select()
                .eq("category", requestBody.category).eq("label", requestBody.label).maybeSingle();
            console.log("isExistLabel", isExistLabel);
            if (isExistLabel) {
                return NextResponse.json({
                    errorCode: "LABEL_EXISTS",
                    errorMsg: "类别名称已存在"
                }, { status: 400 });
            }
        }

        if (!requestBody.id) {
            const { data: maxRow } = await supabase
                .from("constants")
                .select("sort")
                .eq("category", requestBody.category)
                .order("sort", { ascending: false })
                .limit(1)
                .maybeSingle();
            let currentSort = maxRow?.sort ?? 0;
            requestBody.sort = currentSort + 1;
        }
    }
    const { data } = await supabase.from('constants').upsert(requestBody).select();
    return NextResponse.json({ id: data[0].id });
}