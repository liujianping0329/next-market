import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";


export async function POST(request, context) {
    const requestBody = await request.json();

    let query = supabase.from("garden_cate").select().match(requestBody).order("created_at", { ascending: false });
    const { data: matchList, error } = await query;
    const sortByName = (a, b) =>
        (a.name ?? "").localeCompare(b.name ?? "", "zh-CN");

    const list = matchList
        .filter((item) => !item.parentId)
        .map((parent) => ({
            ...parent,
            children: matchList
                .filter((child) => child.parentId === parent.id)
                .map((child) => ({
                    ...child,
                    children: matchList
                        .filter(
                            (grandchild) =>
                                grandchild.parentId === child.id
                        )
                        .sort(sortByName),
                }))
                .sort(sortByName),
        }))
        .sort(sortByName);

    return NextResponse.json({ list });
}