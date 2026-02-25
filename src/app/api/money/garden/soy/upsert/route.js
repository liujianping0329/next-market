import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { title } from "process";
//单一父节点upsert
//  {
//         "pname": "folder1",
//         "titles": "记录1\n记录2\n记录3"
//  }
export async function POST(request, context) {
    const requestBody = await request.json();
    console.log("Upsert SoyBean Request:", requestBody);
    const { data: existParent } = await supabase.from('garden')
        .select("id").eq("category", "folder").eq("topic", "SoyBean")
        .eq("title", requestBody.pname)
        .limit(1).maybeSingle();
    if (existParent) {
        return NextResponse.json({
            errorCode: "NAME_EXISTS",
            errorMsg: "名称已存在"
        }, { status: 400 });
    }

    let parent = {};
    if (requestBody.id) {
        const { data } = await supabase.from('garden').upsert(requestBody).select().single();
        parent = data;
        await supabase.from('garden').delete().eq("parent", requestBody.id).eq("topic", "SoyBean")
            .eq("category", "item");
    } else {
        const { data: minParentSort } = await supabase.from('garden')
            .select("sort").eq("category", "folder").eq("topic", "SoyBean")
            .order("sort", { ascending: true }).limit(1).maybeSingle();
        const { data } = await supabase.from('garden').upsert({
            title: requestBody.pname,
            category: "folder",
            topic: "SoyBean",
            sort: (minParentSort?.sort ?? 0) - 1
        }).select().single();
        parent = data;
    }
    let childSort = 1;
    await supabase.from("garden").insert(requestBody.titles.split("\n").map(title => {
        return {
            title,
            category: "item",
            parent: parent.id,
            topic: "SoyBean",
            sort: childSort++
        };
    }));
    return NextResponse.json({ id: parent.id });
}