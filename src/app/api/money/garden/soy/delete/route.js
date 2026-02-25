import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { title } from "process";
//单一父节点delete
//  {
//         "id": parentId,
//  }
export async function POST(request, context) {
    const requestBody = await request.json();

    const { data: parent } = await supabase.from('garden').delete().eq("id", requestBody.id).eq("topic", "SoyBean")
        .eq("category", "folder").select().single();
    await supabase.from("garden").delete().eq("parent", requestBody.id).eq("topic", "SoyBean")
        .eq("category", "item");

    return NextResponse.json({ id: parent.id });
}