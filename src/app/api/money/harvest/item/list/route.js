import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request) {
    const { harvestId } = await request.json();
    const { data, error } = await supabase.from("harvest_item")
        .select("id, harvest_id, sort_order, text, link, status")
        .eq("harvest_id", harvestId)
        .order("sort_order", { ascending: true });

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ list: data });
}
