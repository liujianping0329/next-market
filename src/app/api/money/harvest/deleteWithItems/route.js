import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request) {
    const { harvestId } = await request.json();

    const { error: itemError } = await supabase.from("harvest_item").delete().eq("harvest_id", harvestId);
    if (itemError) return NextResponse.json({ errorMsg: itemError.message }, { status: 500 });

    const { error } = await supabase.from("harvest").delete().eq("id", harvestId);
    if (error) return NextResponse.json({ errorMsg: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
}
