import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request) {
    const { id } = await request.json();
    const { error } = await supabase.from("harvest_item").delete().eq("id", id);

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
