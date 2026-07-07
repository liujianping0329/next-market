import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request, context) {
    const { children, ...father } = await request.json();
    const { data, error } = await supabase.from('garden_cate').upsert(father).select();
    if (Array.isArray(children) && children.length > 0) {
        await supabase.from('garden_cate').upsert(children.map(child => ({
            ...child,
            parentId: data[0].id,
            planetId: father.planetId,
        }))).select();
    }
    return NextResponse.json({ id: data[0].id });
}