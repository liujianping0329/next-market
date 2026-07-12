import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request, context) {
    const { children, ...father } = await request.json();
    const { data: fatherData, error: fatherError } = await supabase
        .from("garden_cate")
        .upsert(father)
        .select()
        .single();

    if (Array.isArray(children) && children.length > 0) {
        // 第二层：子节点
        const childRows = children.map(({ children, ...child }) => ({
            ...child,
            parentId: fatherData.id,
            planetId: father.planetId,
        }));

        const { data: childData, error: childError } = await supabase
            .from("garden_cate")
            .upsert(childRows)
            .select();
        // 第三层：孙节点
        const grandchildRows = [];

        children.forEach((child, index) => {
            if (!Array.isArray(child.children)) return;

            child.children.forEach(({ children, ...grandchild }) => {
                grandchildRows.push({
                    ...grandchild,
                    parentId: childData[index].id,
                    planetId: father.planetId,
                });
            });
        });

        if (grandchildRows.length > 0) {
            await supabase.from("garden_cate").upsert(grandchildRows);
        }
    }
    return NextResponse.json({ id: fatherData.id });
}