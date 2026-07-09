import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";


export async function POST(request, context) {
    const requestBody = await request.json();

    let query = supabase.from("garden_cate").select().match(requestBody).order("created_at", { ascending: false });
    const { data: matchList, error } = await query;

    const list = matchList
        .filter((item) => !item.parentId)
        .map((parent) => {
            return {
                ...parent,
                children: matchList.filter((child) => child.parentId === parent.id),
            };
        });


    return NextResponse.json({ list });
}