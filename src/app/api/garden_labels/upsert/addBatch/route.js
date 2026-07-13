import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request, context) {
    const { info } = await request.json();
    const { cateId, labelInfo } = info;

    const insertList = labelInfo.flatMap((gardenItem) => {
        return gardenItem.labelIds.map((label) => ({
            cateId,
            subCateId: label.pid,
            labelId: label.id,
            gardenId: gardenItem.id,
        }));
    });


    const { data, error } = await supabase.from('garden_labels').insert(insertList).select();
    return NextResponse.json({ id: data[0].id });
}